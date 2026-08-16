import type { Response } from "express";
import type { ZodIssue } from "zod";

type FieldError = {
  field: string;
  message: string;
};

type SuccessPayload = {
  message?: string;
} & Record<string, unknown>;

type ErrorPayload = {
  message: string;
  errors?: FieldError[];
};

export const sendSuccess = (
  res: Response,
  statusCode: number,
  payload: SuccessPayload = {}
) => {
  return res.status(statusCode).json({
    success: true,
    ...payload,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  payload: ErrorPayload
) => {
  return res.status(statusCode).json({
    success: false,
    message: payload.message,
    errors: payload.errors ?? [],
  });
};

export const sendZodValidationError = (
  res: Response,
  issues: ZodIssue[]
) => {
  return sendError(res, 400, {
    message: "Validation failed",
    errors: issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
};
