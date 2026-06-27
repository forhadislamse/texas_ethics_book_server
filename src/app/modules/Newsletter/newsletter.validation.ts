import { z } from "zod";

export const NewsletterValidation = {
  subscribeSchema: z.object({
    email: z.string().email("Invalid email address"),
  }),
};
