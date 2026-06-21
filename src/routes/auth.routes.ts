import { Router } from "express";

import {
  login,
  perfil,
  refresh,
  registrar,
} from "../controllers/auth.controller";
import { autenticar } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  loginSchema,
  refreshTokenSchema,
  registroSchema,
} from "../schemas/auth.schema";

export const authRoutes = Router();

authRoutes.post("/registro", validate(registroSchema), registrar);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/refresh", validate(refreshTokenSchema), refresh);
authRoutes.get("/me", autenticar, perfil);