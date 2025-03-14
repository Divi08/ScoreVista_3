
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, ArrowDownUp, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeText } from "@/lib/textAnalysis";
import { TextAnalysisResult } from "@/lib/types";
import { toast } from "sonner";

const CompareRevisions = () => {
  const [originalText, setOriginalText] = useState("");
  const [revisedText, setRevisedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    original: TextAnalysisResult | null;
    revised: TextAnalysisResult | null;
  }>({ original: null, revised: null });

  const handleCompare = async () => {
    if (originalText.trim().length < 50 || revisedText.trim().length < 50) {
      toast.error("Please provide longer texts for meaningful comparison (at least 50 characters each)");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Analyzing both versions...");

    try {
      // Analyze both versions
      const originalAnalysis = await analyzeText(originalText);
      const revisedAnalysis = await analyzeText(revisedText);

      setAnalysis({
        original: originalAnalysis,
        revised: revisedAnalysis
      });

      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing texts:", error);
      toast.error("Error analyzing your texts. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateImprovement = (original: number, revised: number): number => {
    return revised - original;
  };

  const getImprovementColor = (improvement: number): string => {
    if (improvement > 5) return "text-green-500";
    if (improvement > 0) return "text-lime-500";
    if (improvement === 0) return "text-amber-500";
    return "text-red-500";
  };

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(revisedText);
    setRevisedText(temp);
    toast.info("Texts swapped");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

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
            {/* Tool Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="hover:bg-secondary"
                >
                  <Link to="/writing-exercises">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Exercises
                  </Link>
                </Button>
              </div>
              
              <h1 className="text-3xl font-bold mb-2">Compare Revisions</h1>
              <p className="text-muted-foreground mb-4">
                Track your progress by comparing different versions of your writing and see specific improvements.
              </p>
            </div>
            
            {/* Tool Content */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Original Text</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopy(originalText)}
                      className="h-7 px-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder="Paste your original draft here..."
                    className="min-h-[300px] font-sans text-base leading-relaxed p-4"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Revised Text</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopy(revisedText)}
                      className="h-7 px-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={revisedText}
                    onChange={(e) => setRevisedText(e.target.value)}
                    placeholder="Paste your revised draft here..."
                    className="min-h-[300px] font-sans text-base leading-relaxed p-4"
                  />
                </div>
              </div>
              
              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleSwap}
                  disabled={isAnalyzing}
                >
                  <ArrowDownUp className="w-4 h-4 mr-2" />
                  Swap Texts
                </Button>
                <Button 
                  onClick={handleCompare}
                  disabled={isAnalyzing || originalText.trim().length < 50 || revisedText.trim().length < 50}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Compare Versions"}
                </Button>
              </div>
              
              {/* Results */}
              {analysis.original && analysis.revised && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-lg border bg-card shadow-sm p-6 mt-6"
                >
                  <h2 className="text-2xl font-bold mb-4">Comparison Results</h2>
                  
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Overall Score</h3>
                    <div className="grid grid-cols-3 gap-4 pb-4 border-b">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{analysis.original.overallScore}/100</div>
                        <div className="text-sm text-muted-foreground">Original</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{analysis.revised.overallScore}/100</div>
                        <div className="text-sm text-muted-foreground">Revised</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getImprovementColor(
                          calculateImprovement(analysis.original.overallScore, analysis.revised.overallScore)
                        )}`}>
                          {calculateImprovement(analysis.original.overallScore, analysis.revised.overallScore) > 0 ? '+' : ''}
                          {calculateImprovement(analysis.original.overallScore, analysis.revised.overallScore)}
                        </div>
                        <div className="text-sm text-muted-foreground">Change</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Metrics Comparison</h3>
                    <div className="space-y-4">
                      {Object.entries({
                        'Grammar': { original: analysis.original.metrics.grammarScore, revised: analysis.revised.metrics.grammarScore },
                        'Clarity': { original: analysis.original.metrics.clarityScore, revised: analysis.revised.metrics.clarityScore },
                        'Vocabulary': { original: analysis.original.metrics.vocabularyScore, revised: analysis.revised.metrics.vocabularyScore },
                        'Style': { original: analysis.original.metrics.styleConsistencyScore, revised: analysis.revised.metrics.styleConsistencyScore },
                        'Readability': { original: analysis.original.metrics.readabilityScore, revised: analysis.revised.metrics.readabilityScore },
                      }).map(([name, scores]) => (
                        <div key={name} className="flex items-center">
                          <div className="w-24 text-sm font-medium">{name}</div>
                          <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-1 text-sm font-mono text-right">{scores.original}</div>
                            <div className="col-span-4 h-2 rounded bg-secondary overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${scores.original}%` }}
                              ></div>
                            </div>
                            <div className="col-span-1 text-sm font-mono text-right">{scores.revised}</div>
                            <div className="col-span-4 h-2 rounded bg-secondary overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${scores.revised}%` }}
                              ></div>
                            </div>
                            <div className={`col-span-2 text-sm font-mono text-right ${getImprovementColor(
                              calculateImprovement(scores.original, scores.revised)
                            )}`}>
                              {calculateImprovement(scores.original, scores.revised) > 0 ? '+' : ''}
                              {calculateImprovement(scores.original, scores.revised)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {analysis.revised.metrics.ieltsEstimate && (
                    <div className="mb-6 p-4 rounded-lg bg-primary/10">
                      <h3 className="font-medium mb-2">IELTS Band Estimate</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {analysis.original.metrics.ieltsEstimate || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">Original</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {analysis.revised.metrics.ieltsEstimate}
                          </div>
                          <div className="text-sm text-muted-foreground">Revised</div>
                        </div>
                        <div className="text-center">
                          {analysis.original.metrics.ieltsEstimate && (
                            <div className={`text-lg font-semibold ${getImprovementColor(
                              calculateImprovement(
                                analysis.original.metrics.ieltsEstimate || 0, 
                                analysis.revised.metrics.ieltsEstimate || 0
                              )
                            )}`}>
                              {calculateImprovement(
                                analysis.original.metrics.ieltsEstimate || 0, 
                                analysis.revised.metrics.ieltsEstimate || 0
                              ) > 0 ? '+' : ''}
                              {calculateImprovement(
                                analysis.original.metrics.ieltsEstimate || 0, 
                                analysis.revised.metrics.ieltsEstimate || 0
                              ).toFixed(1)}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">Change</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Tabs defaultValue="original">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="original">Original Feedback</TabsTrigger>
                      <TabsTrigger value="revised">Revised Feedback</TabsTrigger>
                    </TabsList>
                    <TabsContent value="original" className="p-4 mt-2 rounded-lg bg-muted/50">
                      <p className="whitespace-pre-line">{analysis.original.ieltsFeedback}</p>
                    </TabsContent>
                    <TabsContent value="revised" className="p-4 mt-2 rounded-lg bg-muted/50">
                      <p className="whitespace-pre-line">{analysis.revised.ieltsFeedback}</p>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CompareRevisions;
