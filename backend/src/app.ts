import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/", routes);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

export default app;
