import { Router } from "express";
import healthRouter from "../features/health/healthRoutes";
import authRouter from "../features/auth/authRoutes";
import propertiesRouter from "../features/properties/propertiesRoutes";

const router = Router();
router.use("/", healthRouter);
router.use("/", authRouter);
router.use("/", propertiesRouter);

export default router;