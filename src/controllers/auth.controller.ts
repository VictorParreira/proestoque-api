import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

import { config } from "../config";
import { AppError } from "../middlewares/errorHandler";
import { prisma } from "../prisma/client";
import type { LoginInput, RegistroInput } from "../schemas/auth.schema";

const BCRYPT_SALT_ROUNDS = 10;

function gerarToken(usuarioId: string) {
  const signOptions: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      sub: usuarioId,
    },
    config.jwtSecret,
    signOptions,
  );
}

function formatarUsuario(usuario: {
  id: string;
  nome: string;
  email: string;
  criadoEm: Date;
  atualizadoEm: Date;
}) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm,
  };
}

export async function registrar(
  request: Request<unknown, unknown, RegistroInput>,
  response: Response,
  next: NextFunction,
) {
  try {
    const { nome, email, senha } = request.body;

    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (usuarioExistente) {
      throw new AppError("E-mail já cadastrado", 409);
    }

    const senhaHash = await bcrypt.hash(senha, BCRYPT_SALT_ROUNDS);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
      },
    });

    const token = gerarToken(usuario.id);

    return response.status(201).json({
      usuario: formatarUsuario(usuario),
      token,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(
  request: Request<unknown, unknown, LoginInput>,
  response: Response,
  next: NextFunction,
) {
  try {
    const { email, senha } = request.body;

    const usuario = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (!usuario) {
      throw new AppError("E-mail ou senha inválidos", 401);
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaCorreta) {
      throw new AppError("E-mail ou senha inválidos", 401);
    }

    const token = gerarToken(usuario.id);

    return response.status(200).json({
      usuario: formatarUsuario(usuario),
      token,
    });
  } catch (error) {
    return next(error);
  }
}

export async function perfil(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const usuarioId = request.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Token inválido", 401);
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
    });

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return response.status(200).json({
      usuario: formatarUsuario(usuario),
    });
  } catch (error) {
    return next(error);
  }
}