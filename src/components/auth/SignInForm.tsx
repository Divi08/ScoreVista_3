
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "@/lib/firebase";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SignInFormProps {
  onToggle: () => void;
}

const SignInForm = ({ onToggle }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      toast.success("Successfully signed in!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      if (error instanceof Error) {
        if (error.message.includes("auth/invalid-credential")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("An error occurred during sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Sign In to Score Vista</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={onToggle}
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignInForm;
