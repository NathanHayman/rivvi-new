import { logger } from "@/utils/logger";
import { Context } from "hono";
import { ZodError } from "zod";

export async function errorHandler(err: Error, c: Context) {
  logger.error(err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        error: "Validation Error",
        details: err.errors,
      },
      400
    );
  }

  // Handle known errors with status codes
  if ("status" in err && typeof (err as any).status === "number") {
    return c.json(
      {
        error: err.message,
      },
      (err as any).status
    );
  }

  // Handle unknown errors
  return c.json(
    {
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
    500
  );
}
