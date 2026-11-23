import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "tampilkit-dev-secret";

export interface AuthRequest extends Request {
  ownerId?: string;
}

export function requireOwner(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Silakan masuk terlebih dahulu" });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { ownerId: string };
    req.ownerId = payload.ownerId;
    next();
  } catch {
    return res.status(401).json({ message: "Sesi tidak valid, silakan masuk kembali" });
  }
}