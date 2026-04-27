import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { send } from "@repo/jobs";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const greetingSchema = z.object({
  name: z.string().min(1).max(100),
});

export const $sendGreeting = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(greetingSchema)
  .handler(async ({ data }) => {
    const jobId = await send("greeting", { name: data.name });
    return { jobId };
  });
