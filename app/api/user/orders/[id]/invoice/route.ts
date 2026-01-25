import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const order = await db.collection("orders").findOne({
      orderId: id,
      userId: user._id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate HTML invoice
    const invoiceHTML = generateInvoiceHTML(order, user);

    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${order.orderId}.html"`,
      },
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 },
    );
  }
}

function generateInvoiceHTML(order: any, user: any) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .header .tagline {
      color: #666;
      font-size: 14px;
    }
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .invoice-info div {
      flex: 1;
    }
    .invoice-info h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .invoice-info p {
      margin: 3px 0;
      font-size: 14px;
    }
    .invoice-number {
      font-size: 18px !important;
      font-weight: 600;
      color: #000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    thead {
      background: #f8f8f8;
    }
    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #ddd;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      margin-left: auto;
      width: 300px;
      margin-top: 20px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .totals-row.total {
      border-top: 2px solid #000;
      margin-top: 10px;
      padding-top: 15px;
      font-weight: 600;
      font-size: 18px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-delivered { background: #d4edda; color: #155724; }
    .badge-shipped { background: #cce5ff; color: #004085; }
    .badge-processing { background: #e2e3e5; color: #383d41; }
    .badge-confirmed { background: #d1ecf1; color: #0c5460; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-cancelled { background: #f8d7da; color: #721c24; }
    @media print {
      body { background: white; padding: 0; }
      .invoice-container { box-shadow: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <h1>PrintWibe</h1>
      <p class="tagline">Custom Print Solutions</p>
    </div>

    <!-- Invoice Info -->
    <div class="invoice-info">
      <div>
        <h3>Invoice To:</h3>
        <p><strong>${user.name || "N/A"}</strong></p>
        <p>${user.email || ""}</p>
        ${user.phone ? `<p>${user.phone}</p>` : ""}
      </div>
      <div>
        <h3>Invoice Details:</h3>
        <p class="invoice-number">${order.orderId}</p>
        <p>Date: ${formatDate(order.createdAt)}</p>
        <p>Status: <span class="badge badge-${order.orderStatus}">${order.orderStatus.toUpperCase()}</span></p>
      </div>
    </div>

    <!-- Shipping Address -->
    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 14px; color: #666; margin-bottom: 10px; text-transform: uppercase;">Shipping Address:</h3>
      <p style="font-size: 14px; line-height: 1.6;">
        ${order.shippingAddress.house}, ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br>
        ${order.shippingAddress.country}
      </p>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Variant</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item: any) => `
          <tr>
            <td>
              ${item.name || "Product"}
              ${item.isCustomized ? '<br><span style="font-size: 12px; color: #666;">(Customized)</span>' : ""}
            </td>
            <td>${item.variant?.size || "N/A"} / ${item.variant?.color || "N/A"}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">₹${item.unitPrice.toFixed(2)}</td>
            <td class="text-right">₹${item.itemTotal.toFixed(2)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>₹${order.subtotal.toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>Shipping:</span>
        <span>₹${order.shipping.toFixed(2)}</span>
      </div>
      ${
        order.discount > 0
          ? `
      <div class="totals-row" style="color: #28a745;">
        <span>Discount ${order.promoCode ? `(${order.promoCode})` : ""}:</span>
        <span>-₹${order.discount.toFixed(2)}</span>
      </div>
      `
          : ""
      }
      <div class="totals-row total">
        <span>Total Amount:</span>
        <span>₹${order.total.toFixed(2)}</span>
      </div>
    </div>

    <!-- Payment Info -->
    <div style="margin-top: 30px; padding: 15px; background: #f8f8f8; border-radius: 4px;">
      <p style="font-size: 14px; margin-bottom: 5px;"><strong>Payment Method:</strong> ${
        order.paymentMethod === "cod" ||
        order.paymentMethod === "cash_on_delivery"
          ? "Cash on Delivery"
          : order.paymentMethod === "razorpay" ||
              order.paymentMethod === "online"
            ? "Online Payment"
            : order.paymentMethod || "N/A"
      }</p>
      <p style="font-size: 14px;"><strong>Payment Status:</strong> <span class="badge badge-${order.paymentStatus}">${order.paymentStatus.toUpperCase()}</span></p>
      ${
        order.razorpayPaymentId
          ? `<p style="font-size: 12px; margin-top: 5px; color: #666;">Transaction ID: ${order.razorpayPaymentId}</p>`
          : ""
      }
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>PrintWibe</strong> - Custom Print Solutions</p>
      <p>Email: contact@printwibe.com | Phone: +91 XXX XXX XXXX</p>
      <p style="margin-top: 10px;">Thank you for your business!</p>
    </div>
  </div>

  <script>
    // Auto print when opened in new window
    if (window.location.search.includes('print=true')) {
      window.onload = function() {
        window.print();
      }
    }
  </script>
</body>
</html>
  `;
}
