import { Router, Request } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import db from "../../db";
import { requireOwner, AuthRequest } from "../../middleware/requireOwner";

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Hanya file gambar yang diperbolehkan"));
    }
    cb(null, true);
  },
});

const PROPERTY_TYPES = ["RUMAH", "KOST", "RUKO"];
const LISTING_TYPES = ["JUAL", "SEWA"];
const PRICE_UNITS = ["TOTAL", "PER_BULAN", "PER_TAHUN"];

function serializeProperty(property: any) {
  return { ...property, price: Number(property.price) };
}

function validatePropertyBody(body: any) {
  const { title, type, listingType, price, description, address, city } = body ?? {};
  if (!title || !type || !listingType || price === undefined || price === "" || !description || !address || !city) {
    return "Semua kolom wajib diisi";
  }
  if (!PROPERTY_TYPES.includes(type)) return "Jenis properti tidak valid";
  if (!LISTING_TYPES.includes(listingType)) return "Jenis penawaran tidak valid";
  if (body.priceUnit && !PRICE_UNITS.includes(body.priceUnit)) return "Satuan harga tidak valid";
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return "Harga harus berupa angka lebih dari 0";
  return null;
}

function toNullableInt(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

interface IdParams {
  id: string;
}

interface AuthRequestWithId extends Request<IdParams> {
  ownerId?: string;
}

const router = Router();

router.get("/properties", async (req, res) => {
  const { type, listingType, city, search } = req.query as Record<string, string | undefined>;
  const where: any = { isActive: true };
  if (type && PROPERTY_TYPES.includes(type)) where.type = type;
  if (listingType && LISTING_TYPES.includes(listingType)) where.listingType = listingType;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (search) where.title = { contains: search, mode: "insensitive" };

  const properties = await db.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { photos: { orderBy: { order: "asc" }, take: 1 } },
  });
  res.json(properties.map(serializeProperty));
});

router.get("/properties/:id", async (req: Request<IdParams>, res) => {
  const property = await db.property.findUnique({
    where: { id: req.params.id },
    include: {
      photos: { orderBy: { order: "asc" } },
      owner: { select: { name: true, phone: true } },
    },
  });
  if (!property || !property.isActive) {
    return res.status(404).json({ message: "Properti tidak ditemukan" });
  }
  res.json(serializeProperty(property));
});

router.get("/my/properties", requireOwner, async (req: AuthRequest, res) => {
  const properties = await db.property.findMany({
    where: { ownerId: req.ownerId },
    orderBy: { createdAt: "desc" },
    include: { photos: { orderBy: { order: "asc" }, take: 1 } },
  });
  res.json(properties.map(serializeProperty));
});

router.get("/my/properties/:id", requireOwner, async (req: AuthRequestWithId, res) => {
  const property = await db.property.findUnique({
    where: { id: req.params.id },
    include: { photos: { orderBy: { order: "asc" } } },
  });
  if (!property || property.ownerId !== req.ownerId) {
    return res.status(404).json({ message: "Properti tidak ditemukan" });
  }
  res.json(serializeProperty(property));
});

router.post("/properties", requireOwner, async (req: AuthRequest, res) => {
  const error = validatePropertyBody(req.body);
  if (error) return res.status(400).json({ message: error });
  const { title, type, listingType, price, priceUnit, description, address, city, bedrooms, bathrooms, areaM2 } = req.body;
  const property = await db.property.create({
    data: {
      ownerId: req.ownerId!,
      title,
      type,
      listingType,
      price: BigInt(Math.round(Number(price))),
      priceUnit: priceUnit || "TOTAL",
      description,
      address,
      city,
      bedrooms: toNullableInt(bedrooms),
      bathrooms: toNullableInt(bathrooms),
      areaM2: toNullableInt(areaM2),
    },
  });
  res.status(201).json(serializeProperty(property));
});

router.put("/properties/:id", requireOwner, async (req: AuthRequestWithId, res) => {
  const existing = await db.property.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.ownerId !== req.ownerId) {
    return res.status(404).json({ message: "Properti tidak ditemukan" });
  }
  const error = validatePropertyBody(req.body);
  if (error) return res.status(400).json({ message: error });
  const { title, type, listingType, price, priceUnit, description, address, city, bedrooms, bathrooms, areaM2, isActive } = req.body;
  const property = await db.property.update({
    where: { id: req.params.id },
    data: {
      title,
      type,
      listingType,
      price: BigInt(Math.round(Number(price))),
      priceUnit: priceUnit || "TOTAL",
      description,
      address,
      city,
      bedrooms: toNullableInt(bedrooms),
      bathrooms: toNullableInt(bathrooms),
      areaM2: toNullableInt(areaM2),
      isActive: isActive === undefined ? existing.isActive : Boolean(isActive),
    },
  });
  res.json(serializeProperty(property));
});

router.delete("/properties/:id", requireOwner, async (req: AuthRequestWithId, res) => {
  const existing = await db.property.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.ownerId !== req.ownerId) {
    return res.status(404).json({ message: "Properti tidak ditemukan" });
  }
  const photos = await db.photo.findMany({ where: { propertyId: existing.id } });
  await db.property.delete({ where: { id: existing.id } });
  for (const photo of photos) {
    fs.unlink(path.join(uploadDir, path.basename(photo.url)), () => {});
  }
  res.status(204).end();
});

router.post("/properties/:id/photos", requireOwner, upload.array("photos", 10), async (req: AuthRequestWithId, res) => {
  const existing = await db.property.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.ownerId !== req.ownerId) {
    return res.status(404).json({ message: "Properti tidak ditemukan" });
  }
  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length === 0) {
    return res.status(400).json({ message: "Tidak ada file yang diunggah" });
  }
  const lastPhoto = await db.photo.findFirst({ where: { propertyId: existing.id }, orderBy: { order: "desc" } });
  let nextOrder = (lastPhoto?.order ?? -1) + 1;
  const photos = await db.$transaction(
    files.map((file) =>
      db.photo.create({ data: { propertyId: existing.id, url: `/uploads/${file.filename}`, order: nextOrder++ } })
    )
  );
  res.status(201).json(photos);
});

router.delete("/photos/:id", requireOwner, async (req: AuthRequestWithId, res) => {
  const photo = await db.photo.findUnique({ where: { id: req.params.id }, include: { property: true } });
  if (!photo || photo.property.ownerId !== req.ownerId) {
    return res.status(404).json({ message: "Foto tidak ditemukan" });
  }
  await db.photo.delete({ where: { id: photo.id } });
  fs.unlink(path.join(uploadDir, path.basename(photo.url)), () => {});
  res.status(204).end();
});

export default router;