import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT) || 3333;

app.get("/health", (_request, response) => {
  return response.status(200).json({
    status: "ok",
    service: "proestoque-api",
  });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});