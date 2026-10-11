import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

// shadcn's recommended ModeToggle: sun in light mode, moon in dark mode,
// with Light / Dark / System options. (Animation removed to keep it simple.)
export function ModeToggle({ align = "start" }) {
  const { theme, setTheme } = useTheme();

  const item = (value, label) => (
    <DropdownMenuItem onClick={() => setTheme(value)}>
      {label}
      {theme === value && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {item("light", "Light")}
        {item("dark", "Dark")}
        {item("system", "System")}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
