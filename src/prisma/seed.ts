import { prisma } from "./client";

const categorias = [
  {
    id: "cat_1",
    nome: "Eletrônicos",
    icone: "phone-portrait-outline",
    colorToken: "primary",
  },
  {
    id: "cat_2",
    nome: "Alimentos",
    icone: "fast-food-outline",
    colorToken: "success",
  },
  {
    id: "cat_3",
    nome: "Limpeza",
    icone: "sparkles-outline",
    colorToken: "info",
  },
  {
    id: "cat_4",
    nome: "Escritório",
    icone: "briefcase-outline",
    colorToken: "warning",
  },
  {
    id: "cat_5",
    nome: "Outros",
    icone: "cube-outline",
    colorToken: "error",
  },
];

async function main() {
  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: {
        id: categoria.id,
      },
      update: {
        nome: categoria.nome,
        icone: categoria.icone,
        colorToken: categoria.colorToken,
      },
      create: categoria,
    });
  }

  console.log("Seed executado: 5 categorias cadastradas.");
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });