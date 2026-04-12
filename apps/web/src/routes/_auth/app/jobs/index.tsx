import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { send } from "@repo/jobs";
import { Button } from "@repo/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";

const greetingSchema = z.object({
  name: z.string().min(1).max(100),
});

const $sendGreeting = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(greetingSchema)
  .handler(async ({ data }) => {
    const jobId = await send("greeting", { name: data.name });
    return { jobId };
  });

export const Route = createFileRoute("/_auth/app/jobs/")({
  component: JobsPage,
});

function JobsPage() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendGreeting() {
    setLoading(true);
    try {
      const result = await $sendGreeting({ data: { name: "World" } });
      setJobId(result.jobId ?? "failed to queue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center text-sm">
      <pre className="mb-1 rounded-md border bg-card p-1 text-xs text-card-foreground">
        _auth/app/jobs/index.tsx
      </pre>

      <p>
        Trigger a background job using pg-boss. The worker logs the greeting to the server console.
      </p>

      <Button onClick={handleSendGreeting} disabled={loading} size="sm">
        {loading ? "Sending..." : "Send greeting job"}
      </Button>

      {jobId && (
        <div className="rounded-md border bg-card px-3 py-2 font-mono text-xs text-card-foreground">
          Job queued: {jobId}
        </div>
      )}
    </div>
  );
}
