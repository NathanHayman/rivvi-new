import { CallService } from "@/services/call";
import { RunService } from "@/services/run";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const runService = new RunService();
const callService = new CallService();

const createRunSchema = z.object({
  name: z.string(),
  campaignId: z.string(),
});

const router = new Hono()
  // Create a new run
  .post("/", zValidator("json", createRunSchema), async (c) => {
    const org = c.get("organization");
    const data = c.req.valid("json");

    const run = await runService.createRun({
      name: data.name,
      campaignId: data.campaignId,
      orgId: org.id,
    });

    return c.json(run, 201);
  })

  // Upload Excel file for run
  .post("/:runId/upload", async (c) => {
    const runId = c.req.param("runId");
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const buffer = await file.arrayBuffer();
    const result = await runService.processUpload(runId, Buffer.from(buffer));
    return c.json(result);
  })

  // Start a run
  .post("/:runId/start", async (c) => {
    const runId = c.req.param("runId");
    const run = await runService.startRun(runId);
    return c.json(run);
  })

  // Pause a run
  .post("/:runId/pause", async (c) => {
    const runId = c.req.param("runId");
    const run = await runService.pauseRun(runId);
    return c.json(run);
  })

  // Get run details
  .get("/:runId", async (c) => {
    const runId = c.req.param("runId");
    const run = await runService.getRun(runId);
    return c.json(run);
  })

  // Get active calls for a run
  .get("/:runId/calls/active", async (c) => {
    const runId = c.req.param("runId");
    const count = await callService.getActiveCalls(runId);
    return c.json({ count });
  });

export function registerRunRoutes(app: Hono) {
  return app.route("/runs", router);
}
