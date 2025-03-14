
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Authentication context
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Index from "./pages/Index";
import WritingExercises from "./pages/WritingExercises";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import ExerciseDetail from "./pages/ExerciseDetail";
import NotFound from "./pages/NotFound";
import CompareRevisions from "./pages/CompareRevisions";
import TimedPractice from "./pages/TimedPractice";
import ModelAnswers from "./pages/ModelAnswers";
import RevisionChallenges from "./pages/RevisionChallenges";
import ReadingPractice from "./pages/ReadingPractice";

// Auth and Dashboard
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";
import DashboardLayout from "./components/dashboard/DashboardLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/features" element={<Features />} />
            
            {/* All protected routes now go through DashboardLayout */}
            <Route path="/dashboard" element={<AuthProtectedRoute><DashboardLayout /></AuthProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="exercises" element={<WritingExercises />} />
              <Route path="reading" element={<ReadingPractice />} />
              <Route path="ielts" element={<TimedPractice />} />
              <Route path="progress" element={<RevisionChallenges />} />
              <Route path="history" element={<ModelAnswers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="/dashboard/exercise/:exerciseId" element={<ExerciseDetail />} />
              <Route path="compare-revisions" element={<CompareRevisions />} />
            </Route>
            
            {/* Redirect old standalone protected routes to dashboard routes */}
            <Route path="/writing-exercises" element={<AuthProtectedRoute><Navigate to="/dashboard/exercises" replace /></AuthProtectedRoute>} />
            <Route path="/writing-exercises/:exerciseId" element={<AuthProtectedRoute><Navigate to="/dashboard/exercise/:exerciseId" replace /></AuthProtectedRoute>} />
            <Route path="/revision-tools/compare-revisions" element={<AuthProtectedRoute><Navigate to="/dashboard/compare-revisions" replace /></AuthProtectedRoute>} />
            <Route path="/revision-tools/timed-practice" element={<AuthProtectedRoute><Navigate to="/dashboard/ielts" replace /></AuthProtectedRoute>} />
            <Route path="/revision-tools/model-answers" element={<AuthProtectedRoute><Navigate to="/dashboard/history" replace /></AuthProtectedRoute>} />
            <Route path="/revision-tools/revision-challenges" element={<AuthProtectedRoute><Navigate to="/dashboard/progress" replace /></AuthProtectedRoute>} />
            
            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Auth Protected Route Component
const AuthProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

export default App;
