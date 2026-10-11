import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toDateInput } from "@/lib/format";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({ title: "", amount: "", type: "expense", category: "", date: today() });

// Mirrors validators/transactionValidator.js -> createTransactionSchema
function validate(form) {
  const errors = {};
  const title = form.title.trim();
  if (title.length < 2) errors.title = "Title must be at least 2 characters";
  if (title.length > 100) errors.title = "Title is too long";
  const amount = Number(form.amount);
  if (form.amount === "" || Number.isNaN(amount)) errors.amount = "Amount must be a number";
  else if (amount <= 0) errors.amount = "Amount must be greater than 0";
  if (!["income", "expense"].includes(form.type)) errors.type = "Type must be income or expense";
  if (form.category.trim().length < 2) errors.category = "Category is required";
  return errors;
}

/**
 * Add / edit dialog. Pass `transaction` to edit, or null to create.
 * Calls onSaved(savedTransaction) on success.
 */
export default function TransactionDialog({ open, onOpenChange, transaction, categories, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setError("");
    setForm(
      transaction
        ? {
            title: transaction.title,
            amount: String(transaction.amount),
            type: transaction.type,
            category: transaction.category,
            date: toDateInput(transaction.date),
          }
        : emptyForm()
    );
  }, [open, transaction]);

  // Keep a legacy category selectable when editing an old transaction.
  const options =
    form.category && !categories.includes(form.category) ? [...categories, form.category] : categories;

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined })); // clear that field's error on edit
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount), // backend requires a JSON number
      type: form.type,
      category: form.category,
      ...(form.date && { date: form.date }),
    };

    setSaving(true);
    setError("");
    try {
      const res = transaction
        ? await api.updateTransaction(transaction._id, payload)
        : await api.createTransaction(payload);
      onSaved(res.transaction);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
      setErrors(Object.fromEntries((err.errors || []).map((x) => [x.field, x.message])));
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (name) =>
    errors[name] && <p className="text-sm text-destructive">{errors[name]}</p>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
              aria-invalid={!!errors.title}
            />
            {fieldError("title")}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => set("amount")(e.target.value)}
                aria-invalid={!!errors.amount}
              />
              {fieldError("amount")}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={set("type")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              {fieldError("type")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={set("category")}>
                <SelectTrigger className="w-full" aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {options.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("category")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => set("date")(e.target.value)} />
              {fieldError("date")}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
