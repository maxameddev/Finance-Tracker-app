import { lazy } from "react";

// App pages are code-split: each one loads only when its route is visited.
// Recharts is imported only by Dashboard and Reports, so it ends up in a
// separate chunk shared by those two pages, never in the initial bundle.
const loaders = {
  Dashboard: () => import("@/pages/Dashboard"),
  Transactions: () => import("@/pages/Transactions"),
  Reports: () => import("@/pages/Reports"),
  Profile: () => import("@/pages/Profile"),
};

export const Dashboard = lazy(loaders.Dashboard);
export const Transactions = lazy(loaders.Transactions);
export const Reports = lazy(loaders.Reports);
export const Profile = lazy(loaders.Profile);

// Called once the user is logged in: fetch the remaining pages in the
// background when the browser is idle, so switching pages stays instant.
// Skipped when the user has data-saver turned on.
export function prefetchPages() {
  if (navigator.connection?.saveData) return () => {};
  const run = () => Object.values(loaders).forEach((load) => load().catch(() => {}));
  if ("requestIdleCallback" in window) {
    const id = requestIdleCallback(run, { timeout: 3000 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(run, 2000);
  return () => clearTimeout(id);
}
