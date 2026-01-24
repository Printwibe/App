import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { Notifications } from "@/lib/models/notifications";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Set SSE headers
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    };

    // Create a custom response with streaming capabilities
    const customResponse = new Response(
      new ReadableStream({
        async start(controller) {
          // Send initial data (existing notifications)
          try {
            const notifications = await Notifications.findRecent(20);
            const unreadCount = await Notifications.countUnread();

            const data = {
              type: "initial",
              notifications,
              unreadCount,
            };
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          } catch (error) {
            console.error("Error sending initial notifications:", error);
          }

          // Keep connection alive with heartbeat
          const heartbeat = setInterval(() => {
            try {
              controller.enqueue(`: heartbeat\n\n`);
            } catch (error) {
              clearInterval(heartbeat);
            }
          }, 30000); // Send heartbeat every 30 seconds

          // Listen for new notifications using polling
          // In production, you might use MongoDB change streams or a message queue
          let lastCheckTime = new Date();
          const pollInterval = setInterval(async () => {
            try {
              const db = await getDatabase();
              const recentNotifications = await db
                .collection("notifications")
                .find({ createdAt: { $gt: lastCheckTime } })
                .toArray();

              if (recentNotifications.length > 0) {
                lastCheckTime = new Date();
                const unreadCount = await Notifications.countUnread();

                const data = {
                  type: "new_notification",
                  notifications: recentNotifications,
                  unreadCount,
                };
                controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
              }
            } catch (error) {
              console.error("Error polling notifications:", error);
            }
          }, 5000); // Check for new notifications every 5 seconds

          // Cleanup on client disconnect
          request.signal.addEventListener("abort", () => {
            clearInterval(heartbeat);
            clearInterval(pollInterval);
            controller.close();
          });
        },
      }),
      { headers }
    );

    return customResponse;
  } catch (error) {
    console.error("Stream notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
