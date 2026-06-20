import { Router } from "express";

import {
  atualizarProduto,
  buscarProdutoPorId,
  criarProduto,
  deletarProduto,
  listarProdutos,
} from "../controllers/produto.controller";

export const produtoRoutes = Router();

produtoRoutes.get("/", listarProdutos);
produtoRoutes.post("/", criarProduto);
produtoRoutes.get("/:id", buscarProdutoPorId);
produtoRoutes.put("/:id", atualizarProduto);
produtoRoutes.delete("/:id", deletarProduto);