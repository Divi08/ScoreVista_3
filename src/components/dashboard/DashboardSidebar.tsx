
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  FileText, 
  BookOpen, 
  BarChart2, 
  History, 
  Settings,
  GraduationCap,
  Book // Add this import for the reading icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navItems = [
    {
      title: "Overview",
      icon: Home,
      path: "/dashboard",
      exact: true
    },
    {
      title: "Text Analysis",
      icon: FileText,
      path: "/dashboard/analysis",
    },
    {
      title: "Writing Exercises",
      icon: BookOpen,
      path: "/dashboard/exercises",
    },
    {
      title: "IELTS Practice",
      icon: GraduationCap,
      path: "/dashboard/ielts",
    },
    {
      title: "Reading Practice",
      icon: Book,
      path: "/dashboard/reading",
    },
    {
      title: "Progress",
      icon: BarChart2,
      path: "/dashboard/progress",
    },
    {
      title: "History",
      icon: History,
      path: "/dashboard/history",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <aside className="w-64 border-r bg-card h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 flex-1">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 px-3 font-normal",
                isActive(item.path, item.exact) && "bg-primary/10 text-primary font-medium"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Score Vista
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
