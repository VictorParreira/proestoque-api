import { z } from "zod";

export const registroSchema = z.object({
  nome: z
    .string({
      message: "O nome é obrigatório",
    })
    .trim()
    .min(3, "O nome deve ter no mínimo 3 caracteres")
    .max(80, "O nome deve ter no máximo 80 caracteres"),

  email: z
    .string({
      message: "O e-mail é obrigatório",
    })
    .trim()
    .email("Informe um e-mail válido")
    .max(120, "O e-mail deve ter no máximo 120 caracteres")
    .toLowerCase(),

  senha: z
    .string({
      message: "A senha é obrigatória",
    })
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres"),
});

export const loginSchema = z.object({
  email: z
    .string({
      message: "O e-mail é obrigatório",
    })
    .trim()
    .email("Informe um e-mail válido")
    .toLowerCase(),

  senha: z
    .string({
      message: "A senha é obrigatória",
    })
    .min(1, "A senha é obrigatória"),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;