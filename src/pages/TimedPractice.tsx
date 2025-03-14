import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, AlertTriangle, Send, Timer, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { analyzeText } from "@/lib/textAnalysis";
import { TextAnalysisResult } from "@/lib/types";
import { toast } from "sonner";
import { generateWritingPrompt, evaluateResponseRelevance } from "@/lib/promptGenerator";

const TimedPractice = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"setup" | "in-progress" | "submitted" | "feedback">("setup");
  const [promptType, setPromptType] = useState<"task1" | "task2">("task2");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [timeLimit, setTimeLimit] = useState(40);
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [analysis, setAnalysis] = useState<TextAnalysisResult | null>(null);
  const [relevanceAnalysis, setRelevanceAnalysis] = useState<{ relevant: boolean; feedback: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLimit(promptType === "task1" ? 20 : 40);
  }, [promptType]);

  useEffect(() => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [text]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime === 300) {
            setShowTimerWarning(true);
            toast.warning("5 minutes remaining!");
          }
          if (newTime === 60) {
            toast.warning("1 minute remaining!");
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
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

  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    toast.info("Generating a new writing prompt...");

    try {
      const generatedPrompt = await generateWritingPrompt(promptType, difficulty);
      setPrompt(generatedPrompt.prompt);
      toast.success("New prompt generated successfully!");
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error("Failed to generate a prompt. Please try again.");
      setPrompt(promptType === "task1" 
        ? "The chart shows data about global internet usage. Describe the main features and make comparisons where relevant."
        : "Some people believe technology has improved education. To what extent do you agree or disagree? Provide reasons and examples."
      );
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleStartExercise = () => {
    if (!prompt) {
      toast.error("Please generate a prompt first");
      return;
    }

    setStatus("in-progress");
    setTimerActive(true);
    setTimeLeft(timeLimit * 60);
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
    const savedDraft = {
      text,
      prompt,
      timestamp: new Date().toISOString(),
      wordCount
    };
    
    const savedDrafts = JSON.parse(localStorage.getItem('writingDrafts') || '[]');
    savedDrafts.push(savedDraft);
    localStorage.setItem('writingDrafts', JSON.stringify(savedDrafts));
    
    toast.success("Draft saved successfully");
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
      const relevance = await evaluateResponseRelevance(prompt, text);
      setRelevanceAnalysis(relevance);
      
      const result = await analyzeText(text);
      setAnalysis(result);
      
      setStatus("feedback");
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing text:", error);
      toast.error("Error analyzing your text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMinWordCount = () => {
    return promptType === "task1" ? 150 : 250;
  };

  const getMaxWordCount = () => {
    return promptType === "task1" ? 200 : 350;
  };

  const getWordCountColor = () => {
    const min = getMinWordCount();
    const max = getMaxWordCount();
    
    if (wordCount < min) return "text-red-500";
    if (wordCount > max) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="hover:bg-secondary"
                >
                  <Link to="/dashboard/exercises">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Exercises
                  </Link>
                </Button>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">Timed Practice</h1>
              <p className="text-muted-foreground mb-4">
                Practice writing under exam conditions with customizable timer and AI-generated prompts.
              </p>
            </div>
            
            {status === "setup" ? (
              <motion.div 
                className="rounded-xl border bg-card shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-4">Setup Your Practice Session</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Task Type</label>
                      <Select value={promptType} onValueChange={(value) => setPromptType(value as "task1" | "task2")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="task1">Task 1 (Graph/Chart)</SelectItem>
                            <SelectItem value="task2">Task 2 (Essay)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulty</label>
                      <Select value={difficulty} onValueChange={(value) => setDifficulty(value as "beginner" | "intermediate" | "advanced")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time Limit</label>
                      <Select 
                        value={timeLimit.toString()} 
                        onValueChange={(value) => setTimeLimit(parseInt(value))}
                        disabled={true}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="20">20 minutes (Task 1)</SelectItem>
                            <SelectItem value="40">40 minutes (Task 2)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Time limit is fixed based on task type</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Writing Prompt</label>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleGeneratePrompt}
                        disabled={isGeneratingPrompt}
                        className="h-7 px-3"
                      >
                        {isGeneratingPrompt ? "Generating..." : "Generate Prompt"}
                      </Button>
                    </div>
                    <div className="rounded-lg border p-4 min-h-[100px] bg-card">
                      {isGeneratingPrompt ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin h-5 w-5 border-2 border-primary border-r-transparent rounded-full mr-2"></div>
                          <span>Generating prompt...</span>
                        </div>
                      ) : prompt ? (
                        <p>{prompt}</p>
                      ) : (
                        <p className="text-muted-foreground italic">
                          Click "Generate Prompt" to create a writing task based on your selections.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-center">
                    <Button 
                      size="lg" 
                      onClick={handleStartExercise}
                      disabled={!prompt || isGeneratingPrompt}
                    >
                      <Timer className="w-5 h-5 mr-2" />
                      Start Timed Practice
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div>
                <div className="space-y-6">
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
                  
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="font-medium mb-2">Exercise Prompt:</h3>
                    <p>{prompt}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Your Response</h3>
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
                    </div>
                  </div>
                  
                  {status === "feedback" && analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="rounded-lg border bg-card shadow-sm p-6 mt-6"
                    >
                      <h2 className="text-2xl font-bold mb-4">Writing Analysis</h2>
                      
                      {relevanceAnalysis && (
                        <div className={`mb-6 p-4 rounded-lg ${
                          relevanceAnalysis.relevant 
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" 
                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                        }`}>
                          <h3 className="font-medium mb-2">
                            {relevanceAnalysis.relevant 
                              ? "✓ Your response addresses the prompt" 
                              : "⚠ Your response may not fully address the prompt"}
                          </h3>
                          <p>{relevanceAnalysis.feedback}</p>
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <h3 className="font-medium mb-3">Overall Score</h3>
                        <div className="flex items-center gap-4">
                          <div className="rounded-full w-20 h-20 flex items-center justify-center bg-primary/10 border-4 border-primary">
                            <span className="text-2xl font-bold">{analysis.overallScore}</span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {analysis.metrics.ieltsEstimate 
                                ? `Estimated IELTS Band: ${analysis.metrics.ieltsEstimate}` 
                                : ""}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Based on grammar, vocabulary, coherence, and task achievement
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="font-medium mb-3">Performance by Category</h3>
                        <div className="space-y-4">
                          {Object.entries({
                            'Grammar': analysis.metrics.grammarScore,
                            'Clarity': analysis.metrics.clarityScore,
                            'Vocabulary': analysis.metrics.vocabularyScore,
                            'Style': analysis.metrics.styleConsistencyScore,
                            'Readability': analysis.metrics.readabilityScore,
                          }).map(([name, score]) => (
                            <div key={name} className="flex items-center">
                              <div className="w-24 text-sm font-medium">{name}</div>
                              <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-1 text-sm font-mono text-right">{score}</div>
                                <div className="col-span-10 h-2 rounded bg-secondary overflow-hidden">
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="font-medium mb-3">Professional Feedback</h3>
                        <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-line">
                          {analysis.ieltsFeedback}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button onClick={() => {
                          setStatus("setup");
                          setText("");
                          setPrompt("");
                        }}>
                          Start New Practice
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/revision-tools/compare-revisions")}>
                          Compare With Previous
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TimedPractice;
