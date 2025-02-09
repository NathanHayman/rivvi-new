import { prisma } from "@/utils/prisma";
import { Hono } from "hono";

const router = new Hono()
  // Get organization details
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        campaigns: true,
        users: true,
      },
    });

    if (!organization) {
      return c.json({ error: "Organization not found" }, 404);
    }

    return c.json(organization);
  })

  // Get organization's active run
  .get("/:id/active-run", async (c) => {
    const id = c.req.param("id");
    const activeRun = await prisma.run.findFirst({
      where: {
        orgId: id,
        status: { in: ["PROCESSING", "RUNNING"] },
      },
      include: {
        campaign: true,
      },
    });

    return c.json(activeRun);
  });

export function registerOrganizationRoutes(app: Hono) {
  return app.route("/organizations", router);
}
