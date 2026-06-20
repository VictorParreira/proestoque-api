import { Router } from "express";

import {
  databaseHealthCheck,
  healthCheck,
} from "../controllers/health.controller";

export const healthRoutes = Router();

healthRoutes.get("/", healthCheck);
healthRoutes.get("/db", databaseHealthCheck);