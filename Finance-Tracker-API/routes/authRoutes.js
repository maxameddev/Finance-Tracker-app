import express from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  profile,
  uploadProfilePicture,
} from "../controller/authController.js";

import validate from "../middleware/validate.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/authValidator.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

router.post("/register", authLimiter, validate(registerSchema), register);

router.post("/login", authLimiter, validate(loginSchema), login);

router.get("/profile", protect, profile);

router.post(
  "/profile-picture",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture
);

export default router;
