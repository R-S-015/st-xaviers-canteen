import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Initialize Resend with the API key (will be empty if not set yet)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { orderId, status } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Fetch the order details
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.user_email) {
      return NextResponse.json({ message: "No email associated with this order" }, { status: 200 });
    }

    const isReady = status === "ready";
    const subject = isReady ? `🍽️ Your Canteen Order #${orderId} is Ready!` : `👨‍🍳 Your Canteen Order #${orderId} is Preparing!`;
    
    // HTML Email Template matching the Latte & Sage theme
    const htmlBody = `
      <div style="font-family: sans-serif; background-color: #E5DCC5; padding: 40px 20px; color: #4A3C31;">
        <div style="max-w: 500px; margin: 0 auto; background-color: #F2EAE0; border-radius: 20px; padding: 30px; border: 1px solid #CFBFA3; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 40px;">${isReady ? '🏃‍♂️' : '👨‍🍳'}</span>
          </div>
          <h2 style="text-align: center; color: #4A3C31; margin-top: 0;">Order #${orderId} Update</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #5E4D3F; text-align: center;">
            ${isReady 
              ? `Great news! Your food is hot and ready for pickup at the canteen counter.` 
              : `The kitchen has started preparing your order! Hang tight.`
            }
          </p>
          <div style="background-color: #DCD0B6; padding: 15px; border-radius: 12px; margin-top: 30px;">
            <h4 style="margin: 0 0 10px 0; color: #8C7A6B; text-transform: uppercase; font-size: 12px;">Order Summary</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4A3C31; font-weight: bold;">
              ${order.items.map((item: string) => `<li style="margin-bottom: 5px;">${item}</li>`).join('')}
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/orders" style="display: inline-block; background-color: #C97A7E; color: #F2EAE0; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold;">
              View Live Status
            </a>
          </div>
        </div>
      </div>
    `;

    // 2. Send the email (or mock it if no API key is present)
    if (resend) {
      await resend.emails.send({
        from: "Canteen Connect <orders@resend.dev>", // resend.dev is the default free testing domain
        to: order.user_email,
        subject: subject,
        html: htmlBody,
      });
      console.log(`✅ Real Email Sent to ${order.user_email}!`);
    } else {
      console.log(`\n=================================================`);
      console.log(`✉️ MOCK EMAIL INTERCEPTED (No RESEND_API_KEY found)`);
      console.log(`=================================================`);
      console.log(`To: ${order.user_email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Items: ${order.items.join(', ')}`);
      console.log(`=================================================\n`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
