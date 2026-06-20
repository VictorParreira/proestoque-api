import { Router } from "express";

import {
  buscarCategoriaPorId,
  listarCategorias,
} from "../controllers/categoria.controller";

export const categoriaRoutes = Router();

categoriaRoutes.get("/", listarCategorias);
categoriaRoutes.get("/:id", buscarCategoriaPorId);