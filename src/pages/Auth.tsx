
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { motion } from "framer-motion";
import DarkModeToggle from "@/components/DarkModeToggle";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    navigate("/dashboard");
    return null;
  }

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="w-full py-6 px-4 sm:px-6 flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm" />
              <span className="text-xl font-bold text-primary relative z-10">S</span>
            </div>
            <h1 className="text-xl font-medium tracking-tight">
              <span className="font-bold">Score</span>Vista
            </h1>
          </Link>
        </motion.div>
        
        <DarkModeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            key={isSignIn ? "signin" : "signup"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isSignIn ? (
              <SignInForm onToggle={toggleForm} />
            ) : (
              <SignUpForm onToggle={toggleForm} />
            )}
          </motion.div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Score Vista. All rights reserved.
      </footer>
    </div>
  );
};

export default Auth;
