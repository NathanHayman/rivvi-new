import { Hono } from "hono";
import { registerCampaignRoutes } from "./campaigns";
import { registerOrganizationRoutes } from "./organizations";
import { registerRunRoutes } from "./runs";
import { registerWebhookRoutes } from "./webhooks";

export function registerRoutes(app: Hono) {
  registerRunRoutes(app);
  registerWebhookRoutes(app);
  registerOrganizationRoutes(app);
  registerCampaignRoutes(app);
  return app;
}
