import { WebhookProcessor } from "@/services/webhook";
import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";

const webhookProcessor = new WebhookProcessor();

const webhookSchema = z.object({
  id: z.string(),
  type: z.enum(["call.completed", "call.failed", "transcription.completed"]),
  timestamp: z.string().datetime(),
  data: z.object({
    runId: z.string(),
    callId: z.string(),
    duration: z.number().optional(),
    disposition: z.string().optional(),
    error: z.string().optional(),
    transcription: z.string().optional(),
  }),
});

type WebhookSchema = z.infer<typeof webhookSchema>;

const router = new Hono()
  // Health check endpoint
  .get("/health", (c: Context) => c.json({ status: "ok" }))

  // Retail AI webhook endpoint
  .post("/calls", zValidator("json", webhookSchema), async (c) => {
    const { id, type, timestamp, data } = (await c.req.valid(
      "json"
    )) as WebhookSchema;
    try {
      await webhookProcessor.processWebhook({
        id,
        type,
        timestamp,
        data,
        retryCount: 0,
        status: "PENDING",
      });
      return c.json({ success: true }, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json(
          { error: "Failed to process webhook", details: error.message },
          500
        );
      }
      return c.json({ error: "Failed to process webhook" }, 500);
    }
  });

export function registerWebhookRoutes(app: Hono) {
  return app.route("/webhooks", router);
}
