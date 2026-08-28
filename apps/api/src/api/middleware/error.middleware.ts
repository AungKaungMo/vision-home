import type { NextFunction, Request, Response } from "express";

import { AppError } from "@/core/errors";
import { logger } from "@/core/logger";
import { failure } from "@/core/response";

// Express only treats a middleware as an error handler when it declares
// exactly four parameters. Do not drop `next`.
export const errorMiddleware = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json(failure(error.message));
    return;
  }

  logger.error("Unhandled error", {
    method: request.method,
    path: request.originalUrl,
    error: error instanceof Error ? error.stack : String(error),
  });
  response.status(500).json(failure("Internal server error"));
};
