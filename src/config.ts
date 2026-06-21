import dotenv from "dotenv";

dotenv.config();

export function getEnvVar(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

const port = Number(process.env.PORT) || 3333;

export const config = {
  port,
  databaseUrl: getEnvVar("DATABASE_URL"),
  jwtSecret: getEnvVar("JWT_SECRET"),
  jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN"),
} as const;