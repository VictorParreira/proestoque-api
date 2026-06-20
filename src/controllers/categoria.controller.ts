import type { NextFunction, Request, Response } from "express";

import { AppError } from "../middlewares/errorHandler";
import { prisma } from "../prisma/client";

export async function listarCategorias(
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return response.status(200).json(categorias);
  } catch (error) {
    return next(error);
  }
}

export async function buscarCategoriaPorId(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const rawId = request.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      throw new AppError("Categoria não encontrada", 404);
    }

    const categoria = await prisma.categoria.findUnique({
      where: {
        id,
      },
    });

    if (!categoria) {
      throw new AppError("Categoria não encontrada", 404);
    }

    return response.status(200).json(categoria);
  } catch (error) {
    return next(error);
  }
}