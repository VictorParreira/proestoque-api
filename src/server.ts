import { app } from "./app";
import { config } from "./config";
import { prisma } from "./prisma/client";

async function startServer() {
  try {
    await prisma.$connect();

    app.listen(config.port, () => {
      console.log(`API running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

void startServer();