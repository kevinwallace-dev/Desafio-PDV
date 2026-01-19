import { Request, Response, NextFunction } from "express";
import { AppError, InternalError } from "./errors";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      statusCode: err.statusCode
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation error",
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details: err.flatten?.()
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      error: "Invalid reference",
      code: "FOREIGN_KEY_VIOLATION",
      statusCode: 400
    });
  }

  if (err.code === "23502") {
    return res.status(400).json({
      error: "Missing required field",
      code: "NOT_NULL_VIOLATION",
      statusCode: 400
    });
  }

  const internalError = new InternalError("An unexpected error occurred");
  return res.status(internalError.statusCode).json({
    error: internalError.message,
    code: internalError.code,
    statusCode: internalError.statusCode
  });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
