import dotenv from "dotenv";

import { app } from "./app";
import { prisma } from "./prisma/client";

dotenv.config();

const port = Number(process.env.PORT) || 3333;

async function startServer() {
  try {
    await prisma.$connect();

    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

void startServer();