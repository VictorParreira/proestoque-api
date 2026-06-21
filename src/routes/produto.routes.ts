import { Router } from "express";

import {
  criarMovimentacaoDoProduto,
  listarMovimentacoesDoProduto,
} from "../controllers/movimentacao.controller";
import {
  atualizarProduto,
  buscarProdutoPorId,
  criarProduto,
  deletarProduto,
  listarProdutos,
} from "../controllers/produto.controller";
import { autenticar } from "../middlewares/auth";

export const produtoRoutes = Router();

produtoRoutes.use(autenticar);

produtoRoutes.get("/", listarProdutos);
produtoRoutes.post("/", criarProduto);

produtoRoutes.get("/:id/movimentacoes", listarMovimentacoesDoProduto);
produtoRoutes.post("/:id/movimentacoes", criarMovimentacaoDoProduto);

produtoRoutes.get("/:id", buscarProdutoPorId);
produtoRoutes.put("/:id", atualizarProduto);
produtoRoutes.delete("/:id", deletarProduto);