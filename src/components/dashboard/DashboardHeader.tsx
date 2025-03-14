
import { useNavigate } from "react-router-dom";
import { logOut, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { User, LogOut, Settings } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <header className="bg-card border-b h-16 flex items-center px-6">
      <div className="flex-1 flex items-center">
        <div 
          className="relative w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden mr-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm" />
          <span className="text-xl font-bold text-primary relative z-10">S</span>
        </div>
        <h1 
          className="text-xl font-medium tracking-tight cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <span className="font-bold">Score</span>Vista
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{currentUser?.displayName || "Account"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
