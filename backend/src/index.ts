import "dotenv/config";
import morgan from "morgan";
import { postgres } from "./db";
import express, { Request, Response } from "express";

const app = express();

app.use(morgan("tiny"));
app.use(express.json());

app.post("/api/test-strips/upload", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/api/test-strips", async (req: Request, res: Response) => {
  res.json("Hello World!");
});

app.get("/api/test-strips/:id", async (req: Request, res: Response) => {
  res.json("Hello World!");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
