import express from "express";
import protect from "../middleware/auth.js";
import adminOnly from "../middleware/admin.js";
import { getAdminOverview } from "../controller/adminController.js";

const router = express.Router();

router.get(
  "/overview",
  protect,
  adminOnly,
  getAdminOverview
);

export default router;