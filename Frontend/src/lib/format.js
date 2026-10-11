const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

export const formatMoney = (n) => currency.format(n || 0);

// Dates are stored as UTC midnight, so read them in UTC to avoid off-by-one days.
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

export const monthKey = (value) => toDateInput(value).slice(0, 7); // "YYYY-MM"

export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
};
