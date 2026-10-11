import { Suspense, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ListOrdered, BarChart3, User, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "@/components/mode-toggle";
import PageState from "@/components/PageState";
import { prefetchPages } from "@/lazyPages";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ListOrdered },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
              isActive && "bg-accent font-medium"
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Logged in: warm up the other pages in the background.
  useEffect(() => prefetchPages(), []);

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r p-4 md:flex">
        <div className="mb-6 px-3 font-semibold">Finance Tracker</div>
        <NavLinks />
        <div className="mt-auto space-y-2">
          <p className="truncate px-3 text-sm text-muted-foreground">{user?.name}</p>
          <div className="flex items-center gap-1">
            <ModeToggle />
            <Button variant="ghost" className="flex-1 justify-start" onClick={logout}>
              <LogOut /> Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="flex items-center justify-between border-b px-4 py-2 md:hidden">
        <span className="font-semibold">Finance Tracker</span>
        <div className="flex items-center gap-1">
          <ModeToggle align="end" />
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
        </div>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-4">
          <SheetHeader className="p-0">
            <SheetTitle>Finance Tracker</SheetTitle>
          </SheetHeader>
          <NavLinks onNavigate={() => setOpen(false)} />
          <Button variant="ghost" className="mt-auto justify-start" onClick={logout}>
            <LogOut /> Log out
          </Button>
        </SheetContent>
      </Sheet>

      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Sidebar stays visible while a page's code loads */}
          <Suspense fallback={<PageState loading />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
