import { createFileRoute } from "@tanstack/react-router";
import { handleExplain } from "@/lib/ai/explain.server";

// Public (no login, by design for children). Input is length-capped and the prompt is math-only.
export const Route = createFileRoute("/api/public/explain")({
  server: { handlers: { POST: ({ request }) => handleExplain(request) } },
});
