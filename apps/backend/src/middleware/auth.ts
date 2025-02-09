import { prisma } from "@/utils/prisma";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { Context, Next } from "hono";

const PUBLIC_ROUTES = [
  "/docs",
  "/webhooks/calls", // Retail AI webhook endpoint
];

declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      role: string;
      orgId: string;
    };
    organization: {
      id: string;
      name: string;
    };
  }
}

export async function authMiddleware(c: Context, next: Next) {
  // Skip auth for public routes
  if (PUBLIC_ROUTES.some((route) => c.req.path.startsWith(route))) {
    return next();
  }

  // Use Clerk middleware
  await clerkMiddleware()(c, next);
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Get or create user in our database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: auth.userId },
      include: { organization: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

    // Set user and org in context
    c.set("user", {
      id: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
    });
    c.set("organization", {
      id: user.organization.id,
      name: user.organization.name,
    });

    return next();
  } catch (error) {
    return c.json({ error: "Unauthorized" }, 401);
  }
}
