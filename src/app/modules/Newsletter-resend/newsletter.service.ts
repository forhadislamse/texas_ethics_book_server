// import { Resend } from "resend";
// import config from "../../../config";
// import httpStatus from "http-status";
// import ApiError from "../../../errors/ApiErrors";

// // নোড রান হওয়ার সাথে সাথে এরর এড়াতে ফাংশনের ভেতরে বা এখানে চেক করে নেওয়া ভালো
// const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

// const subscribeToNewsletter = async (email: string) => {
//   if (!process.env.RESEND_API_KEY) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Newsletter service is not configured");
//   }

//   try {
//     // ১. Resend অডিয়েন্সে (কন্টাক্ট লিস্টে) ইউজার অ্যাড করা
//     if (process.env.RESEND_AUDIENCE_ID) {
//       await resend.contacts.create({
//         email,
//         audienceId: process.env.RESEND_AUDIENCE_ID,
//       });
//     }

//     // ২. ওয়েলকাম ইমেইল পাঠানো
//     // 💡 অ্যালার্ট: ডোমেন না থাকা পর্যন্ত "onboarding@resend.dev" ব্যবহার করা বাধ্যতামূলক
//     const fromEmail = "Cates Legal <onboarding@resend.dev>"; 
    
//     /* 
//     প্রোডাকশনে যখন ডোমেন কিনবে, তখন config.client.url-এর কোডটি অন করবে:
//     const fromEmail = config.client.url
//         ? `Newsletter <newsletter@${new URL(config.client.url).hostname}>`
//         : "Newsletter <newsletter@example.com>";
//     */

//     await resend.emails.send({
//       from: fromEmail,
//       to: [email], // ⚠️ মনে রেখো: টেস্ট মোডে এখানে শুধু তোমার নিজের মেইন জিমেইলটাই কাজ করবে
//       subject: "Welcome to CATES LEGAL Newsletter",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//           <h2 style="color: #2563eb; margin-bottom: 16px;">Thank you for subscribing!</h2>
//           <p style="color: #374151; line-height: 1.6;">
//             You have successfully subscribed to the CATES LEGAL newsletter.
//             We'll send you the latest updates on Texas Ethics Laws and digital practice guides.
//           </p>
//           <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
//             If you did not request this, please ignore this email.
//           </p>
//         </div>
//       `,
//     });

//     return { success: true };
//   } catch (error: any) {
//     console.error("Newsletter subscription error:", error);
//     throw new ApiError(
//       httpStatus.BAD_GATEWAY,
//       error.message || "Failed to subscribe to newsletter. Please try again later."
//     );
//   }
// };

// export const NewsletterService = {
//   subscribeToNewsletter,
// };