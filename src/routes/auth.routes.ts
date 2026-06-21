import { Router } from "express";

import { login, perfil, registrar } from "../controllers/auth.controller";
import { autenticar } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { loginSchema, registroSchema } from "../schemas/auth.schema";

export const authRoutes = Router();

authRoutes.post("/registro", validate(registroSchema), registrar);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.get("/me", autenticar, perfil);