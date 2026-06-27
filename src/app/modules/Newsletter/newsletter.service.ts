import mailchimp from "@mailchimp/mailchimp_marketing";
import config from "../../../config"; // তোমার config ফাইলের পাথ অনুযায়ী ইমপোর্ট করো
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import crypto from "crypto";

// Mailchimp কনফিগারেশন (config থেকে ভ্যালু নেওয়া হচ্ছে)
mailchimp.setConfig({
  apiKey: config.mailchimp.apiKey,
  server: config.mailchimp.serverPrefix || "us10",
});

const subscribeToNewsletter = async (email: string) => {
  if (!config.mailchimp.apiKey || !config.mailchimp.audienceId) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Newsletter service is not configured in config");
  }

  try {
    const audienceId = config.mailchimp.audienceId;

    // Mailchimp-এ মেম্বার অ্যাড বা আপডেট করা
    await mailchimp.lists.setListMember(
      audienceId, 
      crypto.createHash('md5').update(email.toLowerCase()).digest('hex'), 
      {
        email_address: email,
        status_if_new: "subscribed",
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Mailchimp subscription error:", error);
    throw new ApiError(
      httpStatus.BAD_GATEWAY,
      error.response?.body?.detail || "Failed to subscribe to newsletter."
    );
  }
};

export const NewsletterService = {
  subscribeToNewsletter,
};