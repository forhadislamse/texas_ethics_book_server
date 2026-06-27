import mailchimp from "@mailchimp/mailchimp_marketing";
import { Resend } from "resend";
import config from "../../../config";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import crypto from "crypto";

// Mailchimp কনফিগারেশন
mailchimp.setConfig({
  apiKey: config.mailchimp.apiKey,
  server: config.mailchimp.serverPrefix || "us10",
});

// Resend কনফিগারেশন (সরাসরি env ব্যাকআপসহ)
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

const subscribeToNewsletter = async (email: string) => {
  if (!config.mailchimp.apiKey || !config.mailchimp.audienceId) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Mailchimp service is not configured");
  }

  try {
    // ১. Mailchimp অডিয়েন্সে ইউজার অ্যাড বা আপডেট করা
    const audienceId = config.mailchimp.audienceId;
    await mailchimp.lists.setListMember(
      audienceId, 
      crypto.createHash('md5').update(email.toLowerCase()).digest('hex'), 
      {
        email_address: email,
        status_if_new: "subscribed",
      }
    );

    // ২. Resend দিয়ে ইনবক্সে ওয়েলকাম ইমেইল পাঠানো
    if (process.env.RESEND_API_KEY) {
      const fromEmail = "onboarding@resend.dev"; // কাস্টম নাম বাদে শুধু অফিসিয়াল ফ্রি ইমেইল

      await resend.emails.send({
        from: fromEmail,
        to: [email], // ⚠️ মনে রেখো: ডোমেন ভেরিফাই না করা পর্যন্ত এখানে শুধু 'forhadworkspace@gmail.com' ইমেইলটিই কাজ করবে
        subject: "Welcome to CATES LEGAL Newsletter",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 16px;">Thank you for subscribing!</h2>
            <p style="color: #374151; line-height: 1.6;">
              You have successfully subscribed to the CATES LEGAL newsletter.
              We'll send you the latest updates on Texas Ethics Laws and digital practice guides.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
              If you did not request this, please ignore this email.
            </p>
          </div>
        `,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    throw new ApiError(
      httpStatus.BAD_GATEWAY,
      error.response?.body?.detail || error.message || "Failed to process newsletter subscription."
    );
  }
};

export const NewsletterService = {
  subscribeToNewsletter,
};