
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/firebase";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Lock, BellRing, Target, Moon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DarkModeToggle from "@/components/DarkModeToggle";

const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional(),
});

const goalsFormSchema = z.object({
  targetScore: z.number().min(1).max(9),
  weeklyGoal: z.number().min(1).max(30),
});

const Settings = () => {
  const { currentUser, userProfile, refreshUserProfile, isDarkMode, toggleDarkMode } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
      email: currentUser?.email || "",
    },
  });
  
  const goalsForm = useForm<z.infer<typeof goalsFormSchema>>({
    resolver: zodResolver(goalsFormSchema),
    defaultValues: {
      targetScore: userProfile?.targetScore || 7.0,
      weeklyGoal: userProfile?.weeklyGoal || 5,
    },
  });
  
  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    if (!currentUser) return;
    
    setIsUpdating(true);
    try {
      await updateUserProfile(currentUser.uid, {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`
      });
      await refreshUserProfile();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const onGoalsSubmit = async (data: z.infer<typeof goalsFormSchema>) => {
    if (!currentUser) return;
    
    setIsUpdating(true);
    try {
      await updateUserProfile(currentUser.uid, {
        targetScore: data.targetScore,
        weeklyGoal: data.weeklyGoal
      });
      await refreshUserProfile();
      toast.success("Goals updated successfully");
    } catch (error) {
      console.error("Error updating goals:", error);
      toast.error("Failed to update goals");
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
          <TabsTrigger value="goals" className="flex-1">Goals</TabsTrigger>
          <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="name@example.com" 
                              {...field} 
                              disabled 
                            />
                          </FormControl>
                          <FormDescription>
                            Email cannot be changed once account is created
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your password periodically to keep your account secure
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => toast.info("Password reset feature coming soon")}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Study Goals
              </CardTitle>
              <CardDescription>
                Set your IELTS targets and weekly study goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...goalsForm}>
                <form onSubmit={goalsForm.handleSubmit(onGoalsSubmit)} className="space-y-6">
                  <FormField
                    control={goalsForm.control}
                    name="targetScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target IELTS Score</FormLabel>
                        <div className="space-y-0.5">
                          <div className="text-2xl font-bold">{field.value}</div>
                          <FormControl>
                            <Slider
                              min={1}
                              max={9}
                              step={0.5}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1.0</span>
                            <span>5.0</span>
                            <span>9.0</span>
                          </div>
                        </div>
                        <FormDescription>
                          Your target IELTS band score
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={goalsForm.control}
                    name="weeklyGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weekly Exercise Goal</FormLabel>
                        <div className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <div className="text-2xl font-bold">{field.value}</div>
                            <div className="text-sm text-muted-foreground">exercises per week</div>
                          </div>
                          <FormControl>
                            <Slider
                              min={1}
                              max={30}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1</span>
                            <span>15</span>
                            <span>30</span>
                          </div>
                        </div>
                        <FormDescription>
                          How many writing exercises you aim to complete each week
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Save Goals"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Moon className="h-5 w-5 mr-2 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label 
                      htmlFor="dark-mode" 
                      className="text-base font-medium"
                    >
                      Dark Mode
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Turn on dark mode to reduce eye strain in low light
                    </p>
                  </div>
                  <DarkModeToggle />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label 
                      htmlFor="notifications" 
                      className="text-base font-medium"
                    >
                      Notifications
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about your progress
                    </p>
                  </div>
                  <Switch id="notifications" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
