import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { config } from "../config";
import { AppError } from "../middlewares/errorHandler";
import { prisma } from "../prisma/client";
import type {
  LoginInput,
  RefreshTokenInput,
  RegistroInput,
} from "../schemas/auth.schema";

const BCRYPT_SALT_ROUNDS = 10;

type AuthTokenPayload = JwtPayload & {
  sub: string;
};

function gerarAccessToken(usuarioId: string) {
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

function gerarRefreshToken(usuarioId: string) {
  const signOptions: SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      sub: usuarioId,
    },
    config.jwtRefreshSecret,
    signOptions,
  );
}

async function criarSessao(usuarioId: string) {
  const accessToken = gerarAccessToken(usuarioId);
  const refreshToken = gerarRefreshToken(usuarioId);
  const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);

  const usuario = await prisma.usuario.update({
    where: {
      id: usuarioId,
    },
    data: {
      refreshTokenHash,
    },
  });

  return {
    usuario,
    token: accessToken,
    accessToken,
    refreshToken,
  };
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

function validarRefreshToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);

    if (typeof decoded === "string" || !decoded.sub) {
      throw new AppError("Refresh token inválido", 401);
    }

    return decoded as AuthTokenPayload;
  } catch {
    throw new AppError("Refresh token inválido", 401);
  }
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

    const sessao = await criarSessao(usuario.id);

    return response.status(201).json({
      usuario: formatarUsuario(sessao.usuario),
      token: sessao.token,
      accessToken: sessao.accessToken,
      refreshToken: sessao.refreshToken,
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

    const sessao = await criarSessao(usuario.id);

    return response.status(200).json({
      usuario: formatarUsuario(sessao.usuario),
      token: sessao.token,
      accessToken: sessao.accessToken,
      refreshToken: sessao.refreshToken,
    });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(
  request: Request<unknown, unknown, RefreshTokenInput>,
  response: Response,
  next: NextFunction,
) {
  try {
    const { refreshToken } = request.body;

    const payload = validarRefreshToken(refreshToken);

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!usuario || !usuario.refreshTokenHash) {
      throw new AppError("Refresh token inválido", 401);
    }

    const refreshTokenValido = await bcrypt.compare(
      refreshToken,
      usuario.refreshTokenHash,
    );

    if (!refreshTokenValido) {
      throw new AppError("Refresh token inválido", 401);
    }

    const sessao = await criarSessao(usuario.id);

    return response.status(200).json({
      usuario: formatarUsuario(sessao.usuario),
      token: sessao.token,
      accessToken: sessao.accessToken,
      refreshToken: sessao.refreshToken,
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