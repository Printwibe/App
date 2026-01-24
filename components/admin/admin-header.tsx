"use client";

import { Bell, Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AdminNotifications } from "./admin-notifications";

export function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    // Fetch admin info
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch("/api/v1/admin/auth/me");
        if (response.ok) {
          const data = await response.json();
          setAdminInfo(data.admin);
        }
      } catch (error) {
        console.error("Failed to fetch admin info:", error);
      }
    };
    fetchAdminInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/admin/auth/logout", { method: "POST" });
      router.push("/v1/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <AdminNotifications />

        {/* Admin User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {adminInfo ? getInitials(adminInfo.name) : "U"}
                </AvatarFallback>
              </Avatar>
              {adminInfo && (
                <span className="hidden md:inline-block text-sm font-medium">
                  {adminInfo.name}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {adminInfo?.name || "Admin"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {adminInfo?.email || "Loading..."}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/v1/admin/settings")}>
              <User className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
