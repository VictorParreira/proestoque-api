import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { config } from "../config";
import { AppError } from "./errorHandler";

type AuthTokenPayload = JwtPayload & {
  sub: string;
};

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
      };
    }
  }
}

export function autenticar(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return next(new AppError("Token não fornecido", 401));
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError("Token inválido", 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (typeof decoded === "string" || !decoded.sub) {
      return next(new AppError("Token inválido", 401));
    }

    const payload = decoded as AuthTokenPayload;

    request.usuario = {
      id: payload.sub,
    };

    return next();
  } catch {
    return next(new AppError("Token inválido", 401));
  }
}