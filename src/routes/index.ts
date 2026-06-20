import { Router } from "express";

import { categoriaRoutes } from "./categoria.routes";
import { produtoRoutes } from "./produto.routes";

export const routes = Router();

routes.get("/health", (_request, response) => {
  return response.status(200).json({
    status: "ok",
    service: "proestoque-api",
  });
});

routes.use("/categorias", categoriaRoutes);
routes.use("/produtos", produtoRoutes);