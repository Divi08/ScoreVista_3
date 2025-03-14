
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth, onAuthChange, getUserProfile, updateUserProfile } from "@/lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  userProfile: any;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  userProfile: null,
  isDarkMode: false,
  toggleDarkMode: () => {},
  refreshUserProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Apply dark mode class to body
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference to localStorage
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error refreshing user profile:", error);
      }
    }
  };

  const value: AuthContextType = {
    currentUser,
    isLoading,
    userProfile,
    isDarkMode,
    toggleDarkMode,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
