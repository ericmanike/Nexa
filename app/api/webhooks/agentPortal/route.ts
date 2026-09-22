import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import SystemLog from "@/models/SystemLog";

export const dynamic = "force-dynamic";

/*
 Verify HMAC-SHA256 signature
 */
function verifySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  try {
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(header);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-webhook-signature") || request.headers.get("X-Webhook-Signature");
    const secret = process.env.AGENT_PORTAL_WEBHOOK_SECRET 

    // Verify signature if secret is configured
    if (secret) {
      const isValid = verifySignature(rawBody, signatureHeader, secret);
      if (!isValid) {
        console.warn("AgentPortal Webhook: Invalid signature received");
        await SystemLog.create({
          level: "warn",
          category: "webhook",
          message: "AgentPortal Webhook: Invalid signature received",
          meta: { signatureHeader },
        });
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("AgentPortal Webhook: AGENT_PORTAL_WEBHOOK_SECRET not set in environment. Skipping signature verification.");
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    console.log("AgentPortal Webhook received:", payload.event, "Order ID:", payload.order_id);

    const {
      event,
      version = 1,
      order_id,
      status: overallStatus,
      items = [],
      items_truncated = false,
      failure_count = 0,
      retrying_count = 0,
    } = payload;

    // Log incoming webhook event
    await SystemLog.create({
      level: "info",
      category: "webhook",
      message: `AgentPortal Webhook: ${event || "order.completed"} received for provider order ${order_id}`,
      meta: {
        event,
        version,
        order_id,
        overallStatus,
        itemCount: items.length,
        items_truncated,
        failure_count,
        retrying_count,
      },
    });

    let updatedCount = 0;

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const { reference, status: itemStatus, failed_reason, refunded_at, msisdn, data_mb } = item;

        if (!reference) continue;

        // Map reference back to local order
        // Reference could match payment_id or transaction_id
        const order = await Order.findOne({
          $or: [
            { payment_id: reference },
            { transaction_id: reference },
            { transaction_id: `paid_${reference}` },
            { transaction_id: `store_${reference}` },
            { transaction_id: `nexa-${reference}` },
          ],
        });

        if (!order) {
          console.warn(`AgentPortal Webhook: Order not found for reference ${reference}`);
          continue;
        }

        let newStatus: "delivered" | "failed" | "refunded" | null = null;
        if (itemStatus === "success") {
          newStatus = "delivered";
        } else if (itemStatus === "failed") {
          newStatus = "failed";
        } else if (itemStatus === "refunded") {
          newStatus = "refunded";
        }

        if (newStatus && order.status !== newStatus) {
          order.status = newStatus;
          await order.save();
          updatedCount++;

          await SystemLog.create({
            level: newStatus === "delivered" ? "info" : "error",
            category: "order",
            message: `Order ${order._id} status updated to ${newStatus} via AgentPortal Webhook`,
            meta: {
              orderId: order._id,
              reference,
              msisdn,
              data_mb,
              failed_reason: failed_reason || null,
              refunded_at: refunded_at || null,
            },
          });
        }
      }
    }

    if (items_truncated) {
      await SystemLog.create({
        level: "warn",
        category: "webhook",
        message: `AgentPortal Webhook items truncated for order ${order_id}. More than 500 items in slice.`,
        meta: { order_id },
      });
    }

    return NextResponse.json({
      received: true,
      updated_orders: updatedCount,
    });
  } catch (error: any) {
    console.error("AgentPortal Webhook error:", error);
    try {
      await SystemLog.create({
        level: "error",
        category: "webhook",
        message: `AgentPortal Webhook error: ${error.message || "Unknown error"}`,
        meta: { stack: error.stack },
      });
    } catch (_) {}
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
