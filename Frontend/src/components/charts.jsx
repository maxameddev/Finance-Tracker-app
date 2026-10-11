// Shared Recharts styling so charts follow the shadcn theme (light + dark).
export const axisProps = {
  stroke: "var(--border)",
  tick: { fill: "var(--muted-foreground)", fontSize: 12 },
  tickLine: false,
};

export const tooltipProps = {
  cursor: { fill: "var(--muted)" },
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--popover-foreground)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--popover-foreground)" },
  itemStyle: { color: "var(--popover-foreground)" },
};

// Legend text in the normal text color (the swatch carries the series color).
export const legendProps = {
  wrapperStyle: { fontSize: 12 },
  formatter: (value) => <span style={{ color: "var(--foreground)" }}>{value}</span>,
};

export const COLORS = {
  income: "var(--chart-2)",
  expense: "var(--chart-1)",
};
