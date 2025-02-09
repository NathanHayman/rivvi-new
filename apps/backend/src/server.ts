// src/server.ts

import { initializeAWS } from "@/utils/aws";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { registerRoutes } from "./routes";

// Create Hono app
const app = new Hono();

// Initialize AWS clients
initializeAWS();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Auth middleware (except for public routes)
app.use("*", authMiddleware);

// Error handling
app.onError(errorHandler);

// Register routes
registerRoutes(app);

// Start server
const port = Number(process.env.PORT) || 4000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
