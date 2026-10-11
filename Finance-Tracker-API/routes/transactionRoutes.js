import express from "express";
import protect from "../middleware/auth.js";
import validate from "../middleware/validate.js";

import {
  createTransaction,
  getTransactions,
  getMonthlySummary,
  updateTransaction,
  deleteTransaction,
} from "../controller/transactionController.js";

import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../validators/transactionValidator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  validate(createTransactionSchema),
  createTransaction
);

router.get("/monthly-summary", protect, getMonthlySummary);

router.get("/", protect, getTransactions);

router.put(
  "/:id",
  protect,
  validate(updateTransactionSchema),
  updateTransaction
);

router.delete("/:id", protect, deleteTransaction);

export default router;