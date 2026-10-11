import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import PageState from "@/components/PageState";
import { axisProps, tooltipProps, legendProps, COLORS } from "@/components/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api";
import { currentMonthKey, formatMoney, monthKey, monthLabel } from "@/lib/format";

// Last N month keys ("YYYY-MM"), oldest first.
function lastMonths(n) {
  const [y, m] = currentMonthKey().split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

export default function Reports() {
  const { data, loading, error, reload } = useFetch(async () => {
    const [transactions, summary] = await Promise.all([api.getTransactions(), api.getSummary()]);
    return { transactions, summary };
  });

  // Chart 1: income vs expenses for the last 6 months (computed from /transactions).
  const monthly = useMemo(() => {
    const rows = Object.fromEntries(lastMonths(6).map((k) => [k, { month: monthLabel(k), income: 0, expense: 0 }]));
    for (const t of data?.transactions || []) {
      const row = rows[monthKey(t.date)];
      if (row) row[t.type] += t.amount;
    }
    return Object.values(rows);
  }, [data]);

  // Breakdown: all-time totals per category (from /transactions/monthly-summary).
  const categories = useMemo(() => {
    const map = {};
    for (const { _id, total } of data?.summary || []) {
      map[_id.category] ??= { category: _id.category, income: 0, expense: 0 };
      map[_id.category][_id.type] = total;
    }
    return Object.values(map).sort((a, b) => b.expense - a.expense);
  }, [data]);

  const totals = categories.reduce(
    (acc, c) => ({ income: acc.income + c.income, expense: acc.expense + c.expense }),
    { income: 0, expense: 0 }
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      {loading || error ? (
        <PageState loading={loading} error={error} onRetry={reload} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Income vs expenses</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} barGap={2}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" {...axisProps} />
                    <YAxis {...axisProps} axisLine={false} width={60} />
                    <Tooltip {...tooltipProps} formatter={(v, name) => [formatMoney(v), name]} />
                    <Legend {...legendProps} />
                    <Bar dataKey="income" name="Income" fill={COLORS.income} radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={32} />
                    <Bar dataKey="expense" name="Expenses" fill={COLORS.expense} radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="pb-0">
            <CardHeader>
              <CardTitle>By category</CardTitle>
              <CardDescription>All-time totals</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Category</TableHead>
                    <TableHead className="text-right">Income</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="pr-6 text-right">% of spending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        No data yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((c) => (
                      <TableRow key={c.category}>
                        <TableCell className="pl-6">{c.category}</TableCell>
                        <TableCell className="text-right">{formatMoney(c.income)}</TableCell>
                        <TableCell className="text-right">{formatMoney(c.expense)}</TableCell>
                        <TableCell className="pr-6 text-right">
                          {totals.expense ? Math.round((c.expense / totals.expense) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {categories.length > 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell className="pl-6">Total</TableCell>
                      <TableCell className="text-right">{formatMoney(totals.income)}</TableCell>
                      <TableCell className="text-right">{formatMoney(totals.expense)}</TableCell>
                      <TableCell className="pr-6 text-right">100%</TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
