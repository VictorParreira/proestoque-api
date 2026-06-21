import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly detalhes?: unknown;

  constructor(message: string, statusCode = 400, detalhes?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.detalhes = detalhes;
  }
}

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({
      erro: "JSON inválido no corpo da requisição",
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      erro: error.message,
      ...(error.detalhes ? { detalhes: error.detalhes } : {}),
    });
  }

  console.error(error);

  return response.status(500).json({
    erro: "Erro interno do servidor",
  });
}