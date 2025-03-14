
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { User, LogIn } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Determine if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <motion.header 
      className="w-full py-6 px-4 sm:px-6 flex items-center justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/logo.png" 
            alt="ScoreVista Logo" 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-medium tracking-tight">
            <span className="font-bold">Score</span>Vista
          </h1>
        </Link>
      </motion.div>

      <motion.nav 
        className="hidden md:flex space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Link 
          to="/" 
          className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
            isActive('/') 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-foreground hover:bg-secondary"
          }`}
        >
          Home
        </Link>
        <Link 
          to="/features" 
          className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
            isActive('/features') 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-foreground hover:bg-secondary"
          }`}
        >
          Features
        </Link>
        <Link 
          to="/about" 
          className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
            isActive('/about') 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-foreground hover:bg-secondary"
          }`}
        >
          About
        </Link>
        <Link 
          to="/contact" 
          className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
            isActive('/contact') 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-foreground hover:bg-secondary"
          }`}
        >
          Contact
        </Link>
      </motion.nav>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex items-center space-x-2"
      >
        <DarkModeToggle />
        
        {currentUser ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center"
          >
            <User className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/auth")}
            className="flex items-center"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </motion.div>
    </motion.header>
  );
};

export default Header;
