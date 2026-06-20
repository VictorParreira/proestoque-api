import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { healthRoutes } from "./routes/health.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);

const port = Number(process.env.PORT) || 3333;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});