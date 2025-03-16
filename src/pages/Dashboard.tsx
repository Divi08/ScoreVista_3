
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  FileText, 
  BookOpen, 
  BarChart2, 
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  CheckCircle,
  BookText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import BarChartComponent from "@/components/BarChartComponent";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getRecentAnalyses } from "@/lib/firebase";

const Dashboard = () => {
  const { currentUser, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  // Use react-query to fetch and cache user data with real-time updates
  const { data: userProfile, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      const profile = await getUserProfile(currentUser.uid);
      return profile;
    },
    enabled: !!currentUser?.uid,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Use react-query to fetch recent analyses
  const { data: recentAnalyses } = useQuery({
    queryKey: ['recentAnalyses', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return [];
      return await getRecentAnalyses(currentUser.uid, 5);
    },
    enabled: !!currentUser?.uid,
  });

  // Refresh user profile data when the component mounts
  useEffect(() => {
    if (currentUser) {
      refreshUserProfile().then(() => {
        refetchProfile();
      });
    }
  }, [currentUser, refreshUserProfile, refetchProfile]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const calculateProgress = () => {
    if (!userProfile) return 0;
    const progress = userProfile.weeklyProgress || 0;
    const goal = userProfile.weeklyGoal || 5;
    return Math.min(Math.round((progress / goal) * 100), 100);
  };

  // Analytics data for charts with real data
  const generateScoreData = () => {
    // Use recent analyses data if available
    if (recentAnalyses && recentAnalyses.length > 0) {
      const analyseScores = recentAnalyses.map((analysis, index) => ({
        name: `Analysis ${index + 1}`,
        value: analysis.metrics?.ieltsEstimate || analysis.overallScore / 20, // Convert to IELTS scale if no estimate
        color: '#22c55e'
      }));

      return [
        ...analyseScores,
        { name: 'Your Target', value: userProfile?.targetScore || 7.0, color: '#4f46e5' },
      ];
    }

    // Default data if no activity
    return [
      { name: 'Your Target', value: userProfile?.targetScore || 7.0, color: '#4f46e5' },
      { name: 'Current', value: userProfile?.averageScore || 5.5, color: '#22c55e' },
      { name: 'Global Avg', value: 6.0, color: '#94a3b8' },
    ];
  };

  const progressPercentage = calculateProgress();

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {userProfile?.firstName || currentUser?.displayName?.split(' ')[0] || "User"}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your writing progress and recent activities.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-primary" />
              Exercises Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {userProfile?.exercisesCompleted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total writing exercises completed
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full" 
              onClick={() => navigate("/dashboard/exercises")}
            >
              Practice More
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="h-4 w-4 mr-2 text-primary" />
              Average IELTS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-3xl font-bold">
                {userProfile?.averageScore ? userProfile.averageScore.toFixed(1) : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground ml-2">
                /{userProfile?.targetScore || 7.0}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between mt-1">
                <span>Current</span>
                <span>Target: {userProfile?.targetScore || 7.0}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full" 
              onClick={() => navigate("/dashboard/analysis")}
            >
              Analyze Writing
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2 text-primary" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {progressPercentage}%
            </div>
            <Progress value={progressPercentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Complete {userProfile?.weeklyProgress || 0}/{userProfile?.weeklyGoal || 5} exercises this week
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full" 
              onClick={() => navigate("/dashboard/progress")}
            >
              View Progress
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              IELTS Writing Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent 
              data={generateScoreData()} 
              xAxisLabel="Tasks"
              yAxisLabel="IELTS Band Score"
              height={220}
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!userProfile?.recentActivity || userProfile.recentActivity.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No recent activity</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate("/dashboard/analysis")}
                >
                  Analyze Your First Text
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userProfile.recentActivity.slice(0, 3).map((activity: any) => (
                  <div key={activity.id} className="flex items-start border-b pb-3">
                    <div className={`p-2 rounded mr-3 ${
                      activity.type === 'analysis' 
                        ? 'bg-primary/10' 
                        : 'bg-blue-500/10'
                    }`}>
                      {activity.type === 'analysis' ? (
                        <FileText className="h-4 w-4 text-primary" />
                      ) : (
                        <BookText className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm truncate max-w-[200px]">
                          {activity.title}
                        </h4>
                        <div className="flex flex-col items-end">
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                            {activity.score ? `${activity.score}/100` : 'N/A'}
                          </span>
                          {activity.ieltsEstimate && (
                            <span className="text-xs text-purple-500 mt-1 font-medium">
                              IELTS: {parseFloat(activity.ieltsEstimate).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {activity.createdAt?.toDate
                            ? activity.createdAt.toDate().toLocaleDateString()
                            : new Date().toLocaleDateString()}
                        </span>
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        <span>
                          {activity.createdAt?.toDate
                            ? activity.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate("/dashboard/history")}
                >
                  View All Activity
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            Recommended Exercises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "IELTS Task 2: Technology",
                description: "Write an essay about the impact of technology on education",
                difficulty: "Medium",
                time: "40 min"
              },
              {
                title: "Grammar Practice: Tenses",
                description: "Improve your use of past, present and future tenses",
                difficulty: "Easy",
                time: "20 min"
              },
              {
                title: "Vocabulary Builder",
                description: "Expand your academic vocabulary with this exercise",
                difficulty: "Hard",
                time: "30 min"
              }
            ].map((exercise, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{exercise.title}</h4>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {exercise.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {exercise.time}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/dashboard/exercises")}
                  >
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
