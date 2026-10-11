import express from "express";
import protect from "../middleware/auth.js";
import { getCategories } from "../controller/categoryController.js";

const router = express.Router();

router.get("/", protect, getCategories);

export default router;