
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useAuth();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="h-9 w-9 rounded-full"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};

export default DarkModeToggle;
