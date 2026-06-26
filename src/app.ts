import cors from "cors";
import express from "express";

import { config } from "./config";
import { errorHandler } from "./middlewares/errorHandler";
import { routes } from "./routes";

export const app = express();

const corsOrigin = config.corsOrigins.includes("*")
  ? "*"
  : config.corsOrigins;

app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
});

app.use("/api", routes);

app.use(errorHandler);