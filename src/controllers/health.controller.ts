import type { Request, Response } from "express";

import { prisma } from "../prisma/client";

export async function healthCheck(_request: Request, response: Response) {
  return response.status(200).json({
    status: "ok",
    service: "proestoque-api",
  });
}

export async function databaseHealthCheck(
  _request: Request,
  response: Response,
) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return response.status(200).json({
      status: "ok",
      service: "proestoque-api",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return response.status(500).json({
      status: "error",
      service: "proestoque-api",
      database: "disconnected",
    });
  }
}