import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../db";
import { JWT_SECRET } from "../../middleware/requireOwner";

const router = Router();

router.post("/auth/daftar", async (req, res) => {
  const { name, email, password, phone } = req.body ?? {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nama, email, dan kata sandi wajib diisi" });
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Kata sandi minimal 6 karakter" });
  }
  const existing = await db.owner.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email sudah terdaftar" });
  }
  const hashed = await bcrypt.hash(password, 10);
  const owner = await db.owner.create({ data: { name, email, password: hashed, phone: phone || null } });
  const token = jwt.sign({ ownerId: owner.id }, JWT_SECRET, { expiresIn: "30d" });
  res.status(201).json({ token, owner: { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone } });
});

router.post("/auth/masuk", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan kata sandi wajib diisi" });
  }
  const owner = await db.owner.findUnique({ where: { email } });
  if (!owner) {
    return res.status(401).json({ message: "Email atau kata sandi salah" });
  }
  const valid = await bcrypt.compare(password, owner.password);
  if (!valid) {
    return res.status(401).json({ message: "Email atau kata sandi salah" });
  }
  const token = jwt.sign({ ownerId: owner.id }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, owner: { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone } });
});

export default router;