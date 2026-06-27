import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { NewsletterService } from "./newsletter.service";
import { NewsletterValidation } from "./newsletter.validation";

const subscribeNewsletter = catchAsync(async (req: Request, res: Response) => {
  // ১. Zod দিয়ে ইমেইল ভ্যালিডেশন চেক
  const result = NewsletterValidation.subscribeSchema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.errors[0]?.message || "Invalid request";
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message,
    });
  }

  const { email } = result.data;

  // ২. মেইলচিম্প সার্ভিসে ইমেইল পাঠানো (অটোমেটিক সাবস্ক্রিপশন)
  const data = await NewsletterService.subscribeToNewsletter(email);

  // ৩. ফ্রন্টএন্ডে সাকসেস রেসপন্স পাঠানো
  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Successfully subscribed to the Mailchimp newsletter",
    data,
  });
});

export const NewsletterController = {
  subscribeNewsletter,
};