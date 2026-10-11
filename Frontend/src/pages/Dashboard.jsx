import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import PageState from "@/components/PageState";
import { axisProps, tooltipProps, COLORS } from "@/components/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/lib/api";
import { currentMonthKey, formatMoney, monthKey } from "@/lib/format";

function StatCard({ title, value }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function Dashboard() {
  const { data: transactions, loading, error, reload } = useFetch(api.getTransactions);

  const stats = useMemo(() => {
    const list = transactions || [];
    const thisMonth = currentMonthKey();
    let balance = 0;
    let income = 0;
    let expenses = 0;
    const byCategory = {};

    for (const t of list) {
      balance += t.type === "income" ? t.amount : -t.amount;
      if (monthKey(t.date) !== thisMonth) continue;
      if (t.type === "income") income += t.amount;
      else {
        expenses += t.amount;
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      }
    }

    const chart = Object.entries(byCategory)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    return { balance, income, expenses, chart };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {loading || error ? (
        <PageState loading={loading} error={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Total balance" value={formatMoney(stats.balance)} />
            <StatCard title="Income this month" value={formatMoney(stats.income)} />
            <StatCard title="Expenses this month" value={formatMoney(stats.expenses)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Spending by category</CardTitle>
              <CardDescription>Expenses this month</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.chart.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No expenses recorded this month.
                </p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chart}>
                      <CartesianGrid vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="category" {...axisProps} />
                      <YAxis {...axisProps} axisLine={false} width={60} />
                      <Tooltip {...tooltipProps} formatter={(v) => [formatMoney(v), "Spent"]} />
                      <Bar dataKey="total" fill={COLORS.expense} radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
