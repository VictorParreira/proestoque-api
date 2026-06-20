import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../middlewares/errorHandler";
import { prisma } from "../prisma/client";

const unidadesPermitidas = ["un", "cx", "kg", "g", "lt", "ml", "pct", "m"] as const;

const produtoBaseSchema = z.object({
  nome: z
    .string({
      message: "O nome é obrigatório",
    })
    .trim()
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .max(80, "O nome deve ter no máximo 80 caracteres"),

  categoriaId: z
    .string({
      message: "A categoria é obrigatória",
    })
    .trim()
    .min(1, "A categoria é obrigatória"),

  quantidade: z
    .number({
      message: "A quantidade é obrigatória",
    })
    .int("A quantidade deve ser um número inteiro")
    .min(0, "A quantidade não pode ser negativa"),

  quantidadeMinima: z
    .number({
      message: "A quantidade mínima é obrigatória",
    })
    .int("A quantidade mínima deve ser um número inteiro")
    .min(0, "A quantidade mínima não pode ser negativa"),

  preco: z
    .number({
      message: "O preço é obrigatório",
    })
    .min(0, "O preço não pode ser negativo")
    .max(999999.99, "O preço deve ser menor que R$ 1.000.000,00"),

  unidade: z.enum(unidadesPermitidas, {
    message: "Selecione uma unidade válida",
  }),

  foto: z.string().trim().optional(),
});

const criarProdutoSchema = produtoBaseSchema;

const atualizarProdutoSchema = produtoBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Informe pelo menos um campo para atualizar",
  },
);

function getParamId(request: Request) {
  const rawId = request.params.id;

  return Array.isArray(rawId) ? rawId[0] : rawId;
}

async function ensureCategoriaExists(categoriaId: string) {
  const categoria = await prisma.categoria.findUnique({
    where: {
      id: categoriaId,
    },
  });

  if (!categoria) {
    throw new AppError("Categoria não encontrada", 400);
  }
}

export async function listarProdutos(
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        categoria: true,
      },
      orderBy: {
        criadoEm: "desc",
      },
    });

    return response.status(200).json(produtos);
  } catch (error) {
    return next(error);
  }
}

export async function buscarProdutoPorId(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = getParamId(request);

    if (!id) {
      throw new AppError("Produto não encontrado", 404);
    }

    const produto = await prisma.produto.findUnique({
      where: {
        id,
      },
      include: {
        categoria: true,
      },
    });

    if (!produto) {
      throw new AppError("Produto não encontrado", 404);
    }

    return response.status(200).json(produto);
  } catch (error) {
    return next(error);
  }
}

export async function criarProduto(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const resultado = criarProdutoSchema.safeParse(request.body);

    if (!resultado.success) {
      const mensagem =
        resultado.error.issues[0]?.message ?? "Dados inválidos para produto";

      throw new AppError(mensagem, 400);
    }

    const data = resultado.data;

    await ensureCategoriaExists(data.categoriaId);

    const produto = await prisma.produto.create({
      data: {
        nome: data.nome,
        categoriaId: data.categoriaId,
        quantidade: data.quantidade,
        quantidadeMinima: data.quantidadeMinima,
        preco: data.preco,
        unidade: data.unidade,
        foto: data.foto?.trim() ? data.foto : undefined,
      },
      include: {
        categoria: true,
      },
    });

    return response.status(201).json(produto);
  } catch (error) {
    return next(error);
  }
}

export async function atualizarProduto(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = getParamId(request);

    if (!id) {
      throw new AppError("Produto não encontrado", 404);
    }

    const produtoExistente = await prisma.produto.findUnique({
      where: {
        id,
      },
    });

    if (!produtoExistente) {
      throw new AppError("Produto não encontrado", 404);
    }

    const resultado = atualizarProdutoSchema.safeParse(request.body);

    if (!resultado.success) {
      const mensagem =
        resultado.error.issues[0]?.message ?? "Dados inválidos para produto";

      throw new AppError(mensagem, 400);
    }

    const data = resultado.data;

    if (data.categoriaId) {
      await ensureCategoriaExists(data.categoriaId);
    }

    const produto = await prisma.produto.update({
      where: {
        id,
      },
      data: {
        nome: data.nome,
        categoriaId: data.categoriaId,
        quantidade: data.quantidade,
        quantidadeMinima: data.quantidadeMinima,
        preco: data.preco,
        unidade: data.unidade,
        foto: data.foto?.trim() ? data.foto : undefined,
        ultimaMovimentacao: new Date(),
      },
      include: {
        categoria: true,
      },
    });

    return response.status(200).json(produto);
  } catch (error) {
    return next(error);
  }
}

export async function deletarProduto(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = getParamId(request);

    if (!id) {
      throw new AppError("Produto não encontrado", 404);
    }

    const produto = await prisma.produto.findUnique({
      where: {
        id,
      },
    });

    if (!produto) {
      throw new AppError("Produto não encontrado", 404);
    }

    await prisma.produto.delete({
      where: {
        id,
      },
    });

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
}