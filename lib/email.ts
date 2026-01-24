import nodemailer from "nodemailer";
import { env } from "./env";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth:
    env.GMAIL_USER && env.GMAIL_PASSWORD
      ? {
          user: env.GMAIL_USER,
          pass: env.GMAIL_PASSWORD,
        }
      : undefined,
});

// Check if email is configured
const isEmailConfigured = !!env.GMAIL_USER && !!env.GMAIL_PASSWORD;

export interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    customizationFee: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: string;
  customizedItems: boolean;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    // Skip if email is not configured
    if (!isEmailConfigured) {
      console.warn("Email not configured. Skipping customer confirmation email. Set GMAIL_USER and GMAIL_PASSWORD to enable.");
      return;
    }

    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.unitPrice.toFixed(
          2
        )}</td>
        ${
          item.customizationFee > 0
            ? `<td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.customizationFee.toFixed(
                2
              )}</td>`
            : ""
        }
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${
          (item.unitPrice + item.customizationFee) * item.quantity
        }</td>
      </tr>
    `
      )
      .join("");

    const mailOptions = {
      from: `"PrintWibe" <${env.GMAIL_USER}>`,
      to: data.customerEmail,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
            <h1 style="color: #333; margin: 0;">Order Confirmed!</h1>
            <p style="color: #666; margin: 5px 0;">Order #${
              data.orderNumber
            }</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Order Details</h2>
            
            <p><strong>Dear ${data.customerName},</strong></p>
            <p>Thank you for your order! We're excited to create your custom merchandise.</p>
            
            <h3 style="color: #333; margin-top: 20px;">Items Ordered:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f9f9f9;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                  ${
                    data.items.some((i) => i.customizationFee > 0)
                      ? `<th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Custom Fee</th>`
                      : ""
                  }
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: right;">
              <h3 style="color: #007bff; font-size: 24px; margin: 10px 0;">Total: ₹${data.total.toFixed(
                2
              )}</h3>
            </div>
            
            <h3 style="color: #333; margin-top: 20px;">Shipping Address:</h3>
            <p style="margin: 5px 0;">
              ${data.shippingAddress.street}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${
        data.shippingAddress.postalCode
      }<br>
              ${data.shippingAddress.country}
            </p>
            
            <h3 style="color: #333; margin-top: 20px;">Payment Method:</h3>
            <p style="margin: 5px 0;">${
              data.paymentMethod === "razorpay"
                ? "Online Payment (Razorpay)"
                : "Cash on Delivery"
            }</p>
            
            ${
              data.customizedItems
                ? `
              <div style="background-color: #fff3cd; padding: 15px; margin-top: 20px; border-radius: 5px;">
                <strong>⚠️ Custom Design Notice:</strong>
                <p style="margin: 5px 0;">Your order includes customized items. Our design team will review your artwork and may contact you for any adjustments.</p>
              </div>
            `
                : ""
            }
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                If you have any questions about your order, please reply to this email or contact us at contact@printwibe.com
              </p>
              <p style="color: #666; font-size: 12px;">
                Best regards,<br>
                <strong>The PrintWibe Team</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Order confirmation email sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("Failed to send customer email:", error);
    return false;
  }
}

/**
 * Send new order notification email to admin
 */
export async function sendAdminOrderNotification(data: OrderEmailData) {
  try {
    // Skip if email is not configured
    if (!isEmailConfigured) {
      console.warn("Email not configured. Skipping admin notification email. Set GMAIL_USER and GMAIL_PASSWORD to enable.");
      return;
    }

    const adminEmail = env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("ADMIN_EMAIL not configured, skipping admin notification");
      return false;
    }

    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.unitPrice.toFixed(
          2
        )}</td>
        ${
          item.customizationFee > 0
            ? `<td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.customizationFee.toFixed(
                2
              )}</td>`
            : ""
        }
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${
          (item.unitPrice + item.customizationFee) * item.quantity
        }</td>
      </tr>
    `
      )
      .join("");

    const mailOptions = {
      from: `"PrintWibe Orders" <${env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `🎉 New Order Received - ${data.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #28a745; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">🎉 New Order Received!</h1>
            <p style="margin: 5px 0; font-size: 18px;">Order #${
              data.orderNumber
            }</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Order Information</h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              <p><strong>Order Total:</strong> <span style="font-size: 20px; color: #28a745;">₹${data.total.toFixed(
                2
              )}</span></p>
              <p><strong>Payment Method:</strong> ${
                data.paymentMethod === "razorpay"
                  ? "Online Payment"
                  : "Cash on Delivery"
              }</p>
            </div>
            
            <h3 style="color: #333; margin-top: 20px;">Items Ordered:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #28a745; color: white;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  ${
                    data.items.some((i) => i.customizationFee > 0)
                      ? `<th style="padding: 10px; text-align: right;">Custom</th>`
                      : ""
                  }
                  <th style="padding: 10px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <h3 style="color: #333; margin-top: 20px;">Shipping Address:</h3>
            <p style="margin: 5px 0;">
              ${data.shippingAddress.street}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${
        data.shippingAddress.postalCode
      }<br>
              ${data.shippingAddress.country}
            </p>
            
            ${
              data.customizedItems
                ? `
              <div style="background-color: #ffe6e6; padding: 15px; margin-top: 20px; border-left: 4px solid #dc3545;">
                <strong style="color: #dc3545;">⚠️ CUSTOM DESIGN ITEMS</strong>
                <p style="margin: 5px 0;">This order contains customized items that need design review.</p>
              </div>
            `
                : ""
            }
            
            <div style="margin-top: 20px;">
              <a href="${
                env.NEXTAUTH_URL || "http://localhost:3000"
              }/v1/admin/orders/${
        data.orderNumber
      }" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Order Details
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                This is an automated notification. Please log in to your admin panel to manage this order.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Admin notification email sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error("Failed to send admin email:", error);
    return false;
  }
}
