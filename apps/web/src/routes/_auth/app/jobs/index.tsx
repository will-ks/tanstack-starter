import { Button } from "@repo/ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { $sendGreeting } from "~/utils/jobs.functions";

export const Route = createFileRoute("/_auth/app/jobs/")({
  component: JobsPage,
});

function JobsPage() {
  const [jobId, setJobId] = useState<string | null>(null);

  const greetingMutation = useMutation({
    mutationFn: () => $sendGreeting({ data: { name: "World" } }),
    onSuccess: (data) => {
      setJobId(data.jobId ?? "failed to queue");
    },
  });

  return (
    <div className="flex flex-col items-center gap-3 text-center text-sm">
      <pre className="mb-1 rounded-md border bg-card p-1 text-xs text-card-foreground">
        _auth/app/jobs/index.tsx
      </pre>

      <p>
        Trigger a background job using pg-boss. The worker logs the greeting to the server console.
      </p>

      <Button
        onClick={() => greetingMutation.mutate()}
        disabled={greetingMutation.isPending}
        size="sm"
      >
        {greetingMutation.isPending ? "Sending..." : "Send greeting job"}
      </Button>

      {jobId && (
        <div className="rounded-md border bg-card px-3 py-2 font-mono text-xs text-card-foreground">
          Job queued: {jobId}
        </div>
      )}
    </div>
  );
}
