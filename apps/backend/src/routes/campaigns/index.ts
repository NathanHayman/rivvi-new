import { prisma } from "@/utils/prisma";
import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";

const createCampaignSchema = z.object({
  name: z.string(),
  agentId: z.string(),
});

const router = new Hono()
  // Get all campaigns for organization
  .get("/", async (c: Context) => {
    const org = c.get("organization");

    const campaigns = await prisma.campaign.findMany({
      where: {
        orgId: org.id,
      },
      include: {
        runs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    return c.json(campaigns);
  })

  // Create a new campaign
  .post("/", zValidator("json", createCampaignSchema), async (c: Context) => {
    const org = c.get("organization");
    const data = (await c.req.json()) as z.infer<typeof createCampaignSchema>;

    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        agentId: data.agentId,
        orgId: org.id,
      },
    });

    return c.json(campaign, 201);
  })

  // Get campaign details
  .get("/:id", async (c: Context) => {
    const id = c.req.param("id");

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        runs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!campaign) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    return c.json(campaign);
  });

export function registerCampaignRoutes(app: Hono) {
  return app.route("/campaigns", router);
}
