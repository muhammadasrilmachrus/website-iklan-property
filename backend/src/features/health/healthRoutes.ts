import { Router, Request, Response } from "express";

const projectName = "iklan-properti";
const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ name: projectName, status: "ok" });
});

router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
