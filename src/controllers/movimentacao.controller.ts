import type { NextFunction, Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { AppError } from "../middlewares/errorHandler";
import { prisma } from "../prisma/client";

const movimentacaoSchema = z.object({
  tipo: z.enum(["entrada", "saida"], {
    message: "O tipo deve ser entrada ou saida",
  }),

  quantidade: z
    .number({
      message: "A quantidade é obrigatória",
    })
    .int("A quantidade deve ser um número inteiro")
    .positive("A quantidade deve ser maior que zero"),

  observacao: z.string().trim().optional(),
});

function getParamId(request: Request) {
  const rawId = request.params.id;

  return Array.isArray(rawId) ? rawId[0] : rawId;
}

export async function listarMovimentacoesDoProduto(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const produtoId = getParamId(request);

    if (!produtoId) {
      throw new AppError("Produto não encontrado", 404);
    }

    const produto = await prisma.produto.findUnique({
      where: {
        id: produtoId,
      },
    });

    if (!produto) {
      throw new AppError("Produto não encontrado", 404);
    }

    const movimentacoes = await prisma.movimentacao.findMany({
      where: {
        produtoId,
      },
      orderBy: {
        criadaEm: "desc",
      },
    });

    return response.status(200).json(movimentacoes);
  } catch (error) {
    return next(error);
  }
}

export async function criarMovimentacaoDoProduto(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const produtoId = getParamId(request);

    if (!produtoId) {
      throw new AppError("Produto não encontrado", 404);
    }

    const resultado = movimentacaoSchema.safeParse(request.body);

    if (!resultado.success) {
      const mensagem =
        resultado.error.issues[0]?.message ??
        "Dados inválidos para movimentação";

      throw new AppError(mensagem, 400);
    }

    const data = resultado.data;

const resultadoTransacao = await prisma.$transaction(
  async (tx: Prisma.TransactionClient) => {
    const produto = await tx.produto.findUnique({
      where: {
        id: produtoId,
      },
    });

    if (!produto) {
      throw new AppError("Produto não encontrado", 404);
    }

    const novaQuantidade =
      data.tipo === "entrada"
        ? produto.quantidade + data.quantidade
        : produto.quantidade - data.quantidade;

    if (novaQuantidade < 0) {
      throw new AppError("Quantidade insuficiente em estoque", 400);
    }

    const movimentacao = await tx.movimentacao.create({
      data: {
        produtoId,
        tipo: data.tipo,
        quantidade: data.quantidade,
        observacao: data.observacao?.trim() ? data.observacao : undefined,
      },
    });

    const produtoAtualizado = await tx.produto.update({
      where: {
        id: produtoId,
      },
      data: {
        quantidade: novaQuantidade,
        ultimaMovimentacao: new Date(),
      },
      include: {
        categoria: true,
      },
    });

    return {
      movimentacao,
      produto: produtoAtualizado,
    };
  },
);

    return response.status(201).json(resultadoTransacao);
  } catch (error) {
    return next(error);
  }
}