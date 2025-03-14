import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Save, 
  Send, 
  Check, 
  BarChart as BarChartIcon,
  FileText,
  Timer
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeText } from "@/lib/textAnalysis";
import { TextAnalysisResult } from "@/lib/types";
import TextEditor from "@/components/TextEditor";
import AnalysisPanel from "@/components/AnalysisPanel";
import BarChartComponent from "@/components/BarChartComponent";
import { toast } from "sonner";
import { exercisesData } from './WritingExercises';

// Coffee consumption data for the bar chart exercise
const coffeeConsumptionData = [
  {
    name: "USA",
    "1990": 3.1,
    "2000": 3.8,
    "2020": 4.2,
    color: "#8884d8"
  },
  {
    name: "Brazil",
    "1990": 2.9,
    "2000": 3.2,
    "2020": 3.6,
    color: "#82ca9d"
  },
  {
    name: "Italy",
    "1990": 4.5,
    "2000": 4.7,
    "2020": 4.9,
    color: "#ffc658"
  },
  {
    name: "Ethiopia",
    "1990": 1.2,
    "2000": 1.5,
    "2020": 1.8,
    color: "#ff8042"
  },
  {
    name: "Japan",
    "1990": 2.1,
    "2000": 2.6,
    "2020": 2.9,
    color: "#8dd1e1"
  }
];

// Internet usage data for the line graph exercise
const internetUsageData = [
  {
    name: "North America",
    "2000": 30,
    "2010": 65,
    "2020": 90,
    color: "#8884d8"
  },
  {
    name: "Europe",
    "2000": 20,
    "2010": 60,
    "2020": 85,
    color: "#82ca9d"
  },
  {
    name: "Asia",
    "2000": 5,
    "2010": 30,
    "2020": 65,
    color: "#ffc658"
  },
  {
    name: "Africa",
    "2000": 2,
    "2010": 15,
    "2020": 35,
    color: "#ff8042"
  },
  {
    name: "South America",
    "2000": 10,
    "2010": 40,
    "2020": 75,
    color: "#8dd1e1"
  }
];

type ExerciseStatus = "not-started" | "in-progress" | "submitted" | "feedback";

const ExerciseDetail = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<any | null>(null);
  const [status, setStatus] = useState<ExerciseStatus>("not-started");
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("writing");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get exercise data
  useEffect(() => {
    const foundExercise = exercisesData.find(e => e.id === exerciseId);
    if (foundExercise) {
      setExercise(foundExercise);
      setTimeLeft(foundExercise.timeLimit * 60); // Convert to seconds
    } else {
      navigate("/writing-exercises");
      toast.error("Exercise not found");
    }
  }, [exerciseId, navigate]);

  // Word count calculation
  useEffect(() => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [text]);

  // Timer functionality
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          // Show warning when 5 minutes left
          if (newTime === 300) {
            setShowTimerWarning(true);
            toast.warning("5 minutes remaining!");
          }
          // Show warning when 1 minute left
          if (newTime === 60) {
            toast.warning("1 minute remaining!");
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Time's up
      setTimerActive(false);
      toast.warning("Time's up! Please submit your answer.");
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleStartExercise = () => {
    setStatus("in-progress");
    setTimerActive(true);
    toast.success("Exercise started! The timer has begun.");
  };

  const handlePauseTimer = () => {
    setTimerActive(false);
    toast.info("Timer paused");
  };

  const handleResumeTimer = () => {
    setTimerActive(true);
    toast.info("Timer resumed");
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully");
    // In a real app, you would save to a database or localStorage here
  };

  const handleSubmit = async () => {
    if (wordCount < 150) {
      toast.error("Your response is too short. Please write at least 150 words.");
      return;
    }

    setTimerActive(false);
    setStatus("submitted");
    setIsAnalyzing(true);
    toast.info("Analyzing your writing...");

    try {
      // Analyze the text
      const result = await analyzeText(text);
      setAnalysis(result);
      setStatus("feedback");
      setActiveTab("feedback");
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing text:", error);
      toast.error("Error analyzing your text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMinWordCount = () => {
    return exercise?.type === "task1" ? 150 : 250;
  };

  const getMaxWordCount = () => {
    return exercise?.type === "task1" ? 200 : 350;
  };

  const getWordCountColor = () => {
    const min = getMinWordCount();
    const max = getMaxWordCount();
    
    if (wordCount < min) return "text-red-500";
    if (wordCount > max) return "text-amber-500";
    return "text-green-500";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-500 bg-green-100 dark:bg-green-900/30";
      case "intermediate":
        return "text-amber-500 bg-amber-100 dark:bg-amber-900/30";
      case "advanced":
        return "text-red-500 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
    }
  };

  if (!exercise) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full inline-block mb-4"></div>
            <p>Loading exercise...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Exercise Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/writing-exercises')}
                  className="hover:bg-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="flex items-center text-xs text-muted-foreground">
                    {exercise.type === "task1" ? (
                      <BarChartIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <FileText className="w-4 h-4 mr-1" />
                    )}
                    {exercise.type === "task1" ? "Task 1" : "Task 2"}
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {exercise.timeLimit} minutes
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{exercise.title}</h1>
              <p className="text-muted-foreground mb-4">{exercise.description}</p>
              
              {status !== "not-started" && (
                <div className="rounded-lg border p-4 bg-card mb-4">
                  <h3 className="font-medium mb-2">Exercise Prompt:</h3>
                  <p>{exercise.prompt}</p>
                  
                  {exercise.chartData && (
                    <div className="mt-4">
                      <BarChartComponent 
                        data={exercise.chartData}
                        xAxisLabel={exercise.xAxisLabel}
                        yAxisLabel={exercise.yAxisLabel}
                        title={exercise.id.includes("bar-chart") ? "Coffee Consumption Over Three Decades" : "Internet Usage Across Regions (2000-2020)"}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Exercise Content */}
            {status === "not-started" ? (
              <motion.div 
                className="rounded-xl border bg-card shadow-sm p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-4">Ready to start the exercise?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  You will have {exercise.timeLimit} minutes to complete this {exercise.type === "task1" ? "Task 1" : "Task 2"} exercise. 
                  The timer will start as soon as you click the button below.
                </p>
                
                {exercise.chartData && (
                  <div className="mb-6">
                    <BarChartComponent 
                      data={exercise.chartData}
                      xAxisLabel={exercise.xAxisLabel}
                      yAxisLabel={exercise.yAxisLabel}
                      title={exercise.id.includes("bar-chart") ? "Coffee Consumption Over Three Decades" : "Internet Usage Across Regions (2000-2020)"}
                    />
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                  <div className="rounded-lg border p-3 px-5">
                    <div className="text-sm text-muted-foreground">Time Limit</div>
                    <div className="text-2xl font-semibold">{exercise.timeLimit} min</div>
                  </div>
                  <div className="rounded-lg border p-3 px-5">
                    <div className="text-sm text-muted-foreground">Word Count</div>
                    <div className="text-2xl font-semibold">
                      {getMinWordCount()}-{getMaxWordCount()}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 px-5">
                    <div className="text-sm text-muted-foreground">Exercise Type</div>
                    <div className="text-2xl font-semibold">
                      {exercise.type === "task1" ? "Task 1" : "Task 2"}
                    </div>
                  </div>
                </div>
                <Button size="lg" onClick={handleStartExercise}>
                  <Timer className="w-5 h-5 mr-2" />
                  Start Exercise
                </Button>
              </motion.div>
            ) : (
              <div>
                {/* Tabs for writing and feedback */}
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="writing" disabled={isAnalyzing}>
                        Writing
                      </TabsTrigger>
                      <TabsTrigger value="feedback" disabled={status !== "feedback" || isAnalyzing}>
                        Feedback
                      </TabsTrigger>
                    </TabsList>
                    
                    {status === "in-progress" && (
                      <div className="flex items-center gap-3">
                        <div className={`font-mono ${timeLeft < 300 ? 'text-red-500' : 'text-foreground'}`}>
                          <Timer className="w-4 h-4 inline-block mr-1" />
                          {formatTime(timeLeft)}
                        </div>
                        {timerActive ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handlePauseTimer}
                          >
                            Pause
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleResumeTimer}
                          >
                            Resume
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <TabsContent value="writing" className="mt-0">
                    {showTimerWarning && status === "in-progress" && (
                      <div className="mb-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>5 minutes remaining! Please finish your response and submit.</span>
                      </div>
                    )}
                    
                    {status === "submitted" && isAnalyzing && (
                      <div className="mb-4 p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                          <h3 className="font-medium">Analyzing your writing...</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Our AI is carefully reviewing your text and providing detailed feedback.
                        </p>
                        <Progress value={isAnalyzing ? 60 : 100} className="h-2" />
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={status === "in-progress" ? "Start writing your response here..." : ""}
                        className="min-h-[300px] font-sans text-base leading-relaxed p-4"
                        disabled={status !== "in-progress"}
                      />
                      
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <div>
                          <span className={`font-medium ${getWordCountColor()}`}>
                            {wordCount} words
                          </span>
                          <span className="text-muted-foreground ml-1">
                            (aim for {getMinWordCount()}-{getMaxWordCount()})
                          </span>
                        </div>
                        
                        {status === "in-progress" && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleSaveDraft}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save Draft
                            </Button>
                            <Button 
                              size="sm"
                              onClick={handleSubmit}
                              disabled={wordCount < 50}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                          </div>
                        )}
                        
                        {status === "feedback" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveTab("feedback")}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            View Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="feedback" className="mt-0">
                    {analysis && (
                      <div className="space-y-6">
                        <TextEditor blocks={analysis.blocks} originalText={text} />
                        <AnalysisPanel analysis={analysis} originalText={text} />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExerciseDetail;
