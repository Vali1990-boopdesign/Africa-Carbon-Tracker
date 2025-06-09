import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-10 w-10 bg-surface-container-high border-border hover:bg-surface-container-highest transition-all duration-200 relative overflow-hidden"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-foreground transition-all duration-300" />
      ) : (
        <Sun className="h-4 w-4 text-foreground transition-all duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}