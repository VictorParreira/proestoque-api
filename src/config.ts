import dotenv from "dotenv";

dotenv.config();

export function getEnvVar(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

function getOptionalEnvVar(name: string, fallback: string) {
  return process.env[name] || fallback;
}

function parseCorsOrigins(value: string) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const port = Number(process.env.PORT) || 3333;

export const config = {
  port,
  databaseUrl: getEnvVar("DATABASE_URL"),
  corsOrigins: parseCorsOrigins(getOptionalEnvVar("CORS_ORIGIN", "*")),
  jwtSecret: getEnvVar("JWT_SECRET"),
  jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN"),
  jwtRefreshSecret: getEnvVar("JWT_REFRESH_SECRET"),
  jwtRefreshExpiresIn: getEnvVar("JWT_REFRESH_EXPIRES_IN"),
} as const;