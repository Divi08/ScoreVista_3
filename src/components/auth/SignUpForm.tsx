
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Award } from "lucide-react";
import { motion } from "framer-motion";

interface SignUpFormProps {
  onToggle: () => void;
}

const SignUpForm = ({ onToggle }: SignUpFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [targetScore, setTargetScore] = useState(7.0);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNextStep();
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(email, password, firstName, lastName, targetScore);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign up error:", error);
      if (error instanceof Error) {
        if (error.message.includes("auth/email-already-in-use")) {
          toast.error("Email is already in use. Please use a different email or sign in.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("An error occurred during sign up. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl">Create a Score Vista Account</CardTitle>
        <CardDescription>Enter your information to create an account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center py-4">
                <Award className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Set Your IELTS Goal</h3>
                <p className="text-sm text-muted-foreground">
                  What IELTS band score are you aiming for?
                </p>
              </div>
              
              <div className="space-y-8 px-4">
                <div className="text-center">
                  <span className="text-4xl font-bold">{targetScore.toFixed(1)}</span>
                  <span className="text-lg text-muted-foreground ml-2">/ 9.0</span>
                </div>
                
                <Slider
                  min={1}
                  max={9}
                  step={0.5}
                  value={[targetScore]}
                  onValueChange={(value) => setTargetScore(value[0])}
                  className="w-full"
                />
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Beginner<br/>1.0</span>
                  <span>Intermediate<br/>5.0</span>
                  <span>Advanced<br/>9.0</span>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          {step === 1 ? (
            <Button type="button" className="w-full" onClick={handleNextStep} disabled={isLoading}>
              Continue
            </Button>
          ) : (
            <div className="w-full space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => setStep(1)} 
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
          )}
          
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={onToggle}
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignUpForm;
