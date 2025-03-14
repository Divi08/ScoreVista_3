
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Image, Check, ChevronRight, BookText, RotateCcw, BarChart, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import TextPasteArea from "@/components/TextPasteArea";
import TextEditor from "@/components/TextEditor";
import AnalysisPanel from "@/components/AnalysisPanel";
import { analyzeText } from "@/lib/textAnalysis";
import { TextAnalysisResult } from "@/lib/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [extractedText, setExtractedText] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<TextAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [inputMethod, setInputMethod] = useState<string>("image");

  const handleAnalyzeText = async (text: string) => {
    if (!text.trim()) {
      toast.error("No text to analyze. Please upload an image or paste text first.");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Analyzing text...");

    try {
      const result = await analyzeText(text);
      setAnalysisResult(result);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Text analysis error:", error);
      toast.error("Failed to analyze text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
    handleAnalyzeText(text);
  };

  const handleTextSubmitted = (text: string) => {
    setExtractedText(text);
    handleAnalyzeText(text);
  };
  
  const handleWritingExercisesClick = () => {
    if (currentUser) {
      navigate("/writing-exercises");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "AI Writing Analysis",
      description: "Get instant feedback on grammar, style, and clarity from our AI assistant."
    },
    {
      icon: <BookText className="w-5 h-5" />,
      title: "Writing Exercises",
      description: "Practice with IELTS-style writing prompts and timed sessions."
    },
    {
      icon: <RotateCcw className="w-5 h-5" />,
      title: "Revision Tools",
      description: "Track your progress and see improvements with multiple revisions."
    },
    {
      icon: <BarChart className="w-5 h-5" />,
      title: "IELTS Scoring",
      description: "Receive estimated IELTS band scores and targeted improvement advice."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 sm:px-6">
          <motion.div 
            className="container mx-auto max-w-6xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="inline-block mb-4 bg-primary/10 px-4 py-1.5 rounded-full">
                  <span className="text-sm font-medium text-primary">AI-Powered Writing Assistant</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Enhance Your <span className="text-primary">Writing</span> with Score Vista
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                  Upload an image of your text or paste directly to get instant feedback on grammar, style, and clarity. Perfect for IELTS preparation and academic writing.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <a href="#analysis-tool">
                      Try It Now
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleWritingExercisesClick}>
                    Writing Exercises
                    <BookText className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="relative shadow-xl rounded-2xl overflow-hidden border bg-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-0"></div>
                  <div className="relative z-10 p-6">
                    <div className="bg-card border rounded-xl p-4 mb-3">
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                        <div className="text-sm font-medium">Grammar Analysis</div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-primary" style={{ width: "78%" }}></div>
                      </div>
                      <div className="text-xs text-right text-muted-foreground">78/100</div>
                    </div>
                    
                    <div className="bg-card border rounded-xl p-4 mb-3">
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                        <div className="text-sm font-medium">Clarity Score</div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-primary" style={{ width: "92%" }}></div>
                      </div>
                      <div className="text-xs text-right text-muted-foreground">92/100</div>
                    </div>
                    
                    <div className="bg-card border rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 rounded-full bg-primary/20 mr-2"></div>
                        <div className="text-sm font-medium">IELTS Estimate</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold">7.5</div>
                        <div className="text-sm text-muted-foreground">Band Score</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              </motion.div>
            </div>
          </motion.div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Features that help you write better</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Score Vista offers a comprehensive suite of tools to help improve your writing skills
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-card border rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/10 text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button variant="outline" onClick={handleWritingExercisesClick}>
                Explore All Features
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Analysis Tool Section */}
        <section id="analysis-tool" className="py-16 md:py-24 px-4 sm:px-6 scroll-mt-16">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Try Our AI Writing Analysis Tool</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Upload an image of your writing or paste text directly to get instant professional feedback
              </p>
            </div>
            
            <div className="space-y-8">
              <Tabs defaultValue="image" onValueChange={setInputMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="image">Upload Document</TabsTrigger>
                  <TabsTrigger value="paste">Paste Text</TabsTrigger>
                </TabsList>
                
                <TabsContent value="image">
                  <ImageUploader onTextExtracted={handleTextExtracted} />
                </TabsContent>
                
                <TabsContent value="paste">
                  <TextPasteArea onTextSubmit={handleTextSubmitted} />
                </TabsContent>
              </Tabs>
              
              {extractedText && (
                <>
                  <TextEditor 
                    blocks={analysisResult?.blocks || [{ id: "original", text: extractedText }]} 
                    originalText={extractedText}
                  />
                  
                  {isAnalyzing ? (
                    <div className="rounded-2xl border bg-card shadow-sm p-10 flex flex-col items-center justify-center">
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-lg font-medium">Analyzing your text...</p>
                      <p className="text-muted-foreground mt-2">
                        We're checking grammar, style, clarity, and providing a detailed IELTS assessment.
                      </p>
                    </div>
                  ) : (
                    analysisResult && <AnalysisPanel analysis={analysisResult} originalText={extractedText} />
                  )}
                </>
              )}
            </div>
          </div>
        </section>
        
        {/* Writing Exercises CTA */}
        <section className="py-16 px-4 sm:px-6 bg-primary/5">
          <div className="container mx-auto max-w-6xl">
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-4">Interactive Writing Exercises</h2>
                  <p className="text-muted-foreground mb-6">
                    Practice with our collection of IELTS-style writing prompts, timed sessions, and revision tools to improve your writing skills.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {[
                      "Guided writing prompts for IELTS Tasks 1 & 2",
                      "Timed writing sessions that mimic exam conditions",
                      "Revision tools to track your improvement",
                      "AI-generated model answers for comparison"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <Button onClick={handleWritingExercisesClick}>
                      Explore Writing Exercises
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/30 to-primary/5 p-8 md:p-12 flex items-center justify-center">
                  <div className="bg-card border rounded-xl p-6 w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BookText className="w-5 h-5 text-primary" />
                        <span className="font-medium">IELTS Task 2</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>40 min</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Technology in Education</h3>
                      <p className="text-sm text-muted-foreground">
                        To what extent do you agree that technology has improved the quality of education?
                      </p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleWritingExercisesClick}>Start Exercise</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
