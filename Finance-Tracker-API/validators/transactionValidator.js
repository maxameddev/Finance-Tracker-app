import { z } from "zod";

export const createTransactionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title is too long"),

  amount: z
    .number({
      error: "Amount must be a number",
    })
    .positive("Amount must be greater than 0"),

  type: z.enum(["income", "expense"], {
    error: "Type must be income or expense",
  }),

  category: z
    .string()
    .trim()
    .min(2, "Category is required"),

  date: z.coerce.date().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();