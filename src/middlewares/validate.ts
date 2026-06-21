import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import { AppError } from "./errorHandler";

export function validate(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      return next(
        new AppError("Dados inválidos", 422, result.error.flatten()),
      );
    }

    request.body = result.data;

    return next();
  };
}