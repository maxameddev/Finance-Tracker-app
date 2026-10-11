import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import DeleteTransactionDialog from "@/components/DeleteTransactionDialog";
import PageState from "@/components/PageState";
import TransactionDialog from "@/components/TransactionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api";
import { formatDate, formatMoney, toDateInput } from "@/lib/format";

const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);
const noFilters = { category: "all", type: "all", from: "", to: "" };

export default function Transactions() {
  const { data, setData, loading, error, reload } = useFetch(async () => {
    const [transactions, categories] = await Promise.all([api.getTransactions(), api.getCategories()]);
    return { transactions, categories };
  });

  const [filters, setFilters] = useState(noFilters);
  const [editing, setEditing] = useState(null); // transaction being edited
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const transactions = data?.transactions || [];
  const categories = data?.categories || [];

  // The backend has no query filters, so filter here.
  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const d = toDateInput(t.date);
        if (filters.category !== "all" && t.category !== filters.category) return false;
        if (filters.type !== "all" && t.type !== filters.type) return false;
        if (filters.from && d < filters.from) return false;
        if (filters.to && d > filters.to) return false;
        return true;
      }),
    [transactions, filters]
  );

  const setFilter = (field) => (value) => setFilters((f) => ({ ...f, [field]: value }));

  // Update the local list after changes instead of refetching (the API is rate-limited).
  const onSaved = (saved) =>
    setData((d) => ({
      ...d,
      transactions: [...d.transactions.filter((t) => t._id !== saved._id), saved].sort(byDateDesc),
    }));

  const onDeleted = (id) =>
    setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t._id !== id) }));

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <Button onClick={openAdd} disabled={loading || !!error}>
          <Plus /> Add
        </Button>
      </div>

      {loading || error ? (
        <PageState loading={loading} error={error} onRetry={reload} />
      ) : (
        <>
          {/* Filters */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={filters.category} onValueChange={setFilter("category")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={filters.type} onValueChange={setFilter("type")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="from" className="text-xs text-muted-foreground">From</Label>
              <Input id="from" type="date" value={filters.from} onChange={(e) => setFilter("from")(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to" className="text-xs text-muted-foreground">To</Label>
              <Input id="to" type="date" value={filters.to} onChange={(e) => setFilter("to")(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => setFilters(noFilters)}>
              Clear filters
            </Button>
          </div>

          <Card className="py-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-24 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        {transactions.length === 0 ? "No transactions yet." : "No transactions match these filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell className="pl-4">{formatDate(t.date)}</TableCell>
                        <TableCell>{t.title}</TableCell>
                        <TableCell>{t.category}</TableCell>
                        <TableCell>
                          <Badge variant={t.type === "income" ? "secondary" : "outline"}>{t.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {t.type === "expense" ? "-" : "+"}
                          {formatMoney(t.amount)}
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(t)} aria-label="Edit">
                            <Pencil />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleting(t)} aria-label="Delete">
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {transactions.length}
          </p>
        </>
      )}

      <TransactionDialog
        key={editing?._id ?? "new"} // separate instance per transaction, so a closing dialog never swallows the next open
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editing}
        categories={categories}
        onSaved={onSaved}
      />
      <DeleteTransactionDialog
        transaction={deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        onDeleted={onDeleted}
      />
    </div>
  );
}
