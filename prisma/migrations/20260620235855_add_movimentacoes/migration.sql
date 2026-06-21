-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produtoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "observacao" TEXT,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movimentacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Movimentacao_produtoId_idx" ON "Movimentacao"("produtoId");

-- CreateIndex
CREATE INDEX "Movimentacao_tipo_idx" ON "Movimentacao"("tipo");

-- CreateIndex
CREATE INDEX "Movimentacao_criadaEm_idx" ON "Movimentacao"("criadaEm");
