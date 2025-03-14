import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Copy, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGeminiFeedback } from "@/lib/geminiApi";
import { toast } from "sonner";

const ModelAnswers = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelAnswer, setModelAnswer] = useState("");
  const [explanations, setExplanations] = useState("");

  const handleGenerateModelAnswer = async () => {
    if (prompt.trim().length < 30) {
      toast.error("Please enter a longer prompt for better results");
      return;
    }

    setIsGenerating(true);
    toast.info("Generating model answer...");

    try {
      const aiPrompt = `
        As an IELTS examiner with 15+ years of experience, please write a high-quality model answer for the following IELTS writing prompt. 
        
        The answer should:
        - Score approximately Band 8-9
        - Demonstrate excellent grammar, vocabulary, and coherence
        - Follow standard IELTS format and requirements
        - Be realistic in length (250-300 words for Task 2, 180-200 for Task 1)
        
        IMPORTANT: After writing the model answer, provide a brief explanation of what makes this a high-scoring response, with focus on 3-4 key strengths. 
        
        FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:
        
        ## MODEL ANSWER
        (Write the complete model answer here)
        
        ## EXPLANATIONS
        (Provide 3-4 paragraphs explaining why this is a high-scoring response, highlighting specific language features, structure elements, and content strengths)
        
        WRITING PROMPT:
        "${prompt}"
      `;

      const response = await getGeminiFeedback(aiPrompt);
      
      const modelAnswerMatch = response.match(/## MODEL ANSWER\s*(.*?)(?=\s*##|$)/is);
      const explanationsMatch = response.match(/## EXPLANATIONS\s*(.*?)(?=\s*##|$)/is);
      
      const modelAnswerText = modelAnswerMatch?.[1]?.trim() || "Unable to generate model answer.";
      const explanationsText = explanationsMatch?.[1]?.trim() || "No explanations available.";
      
      setModelAnswer(modelAnswerText);
      setExplanations(explanationsText);
      
      toast.success("Model answer generated successfully!");
    } catch (error) {
      console.error("Error generating model answer:", error);
      toast.error("Failed to generate model answer. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
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
              
              <h1 className="text-3xl font-bold mb-2">Model Answers</h1>
              <p className="text-muted-foreground mb-4">
                Generate high-quality model answers for any IELTS writing prompt with detailed explanations.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="rounded-xl border bg-card shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Enter IELTS Writing Prompt</h2>
                
                <div className="space-y-4">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Paste or type an IELTS writing prompt here..."
                    className="min-h-[100px] font-sans text-base leading-relaxed p-4"
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleGenerateModelAnswer}
                      disabled={isGenerating || prompt.trim().length < 30}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isGenerating ? "Generating..." : "Generate Model Answer"}
                    </Button>
                  </div>
                </div>
              </div>
              
              {modelAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Tabs defaultValue="model">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="model">Model Answer</TabsTrigger>
                      <TabsTrigger value="analysis">Expert Analysis</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="model">
                      <div className="rounded-xl border bg-card shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold">Band 8-9 Model Response</h2>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopy(modelAnswer)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        
                        <div className="space-y-4 text-base leading-relaxed prose max-w-none dark:prose-invert prose-p:my-2">
                          {modelAnswer.split('\n\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="analysis">
                      <div className="rounded-xl border bg-card shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold">Why This Is a High-Scoring Response</h2>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleCopy(explanations)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        
                        <div className="space-y-4 text-base leading-relaxed">
                          {explanations.split('\n\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="rounded-xl border bg-muted/30 p-6 mt-6">
                    <div className="flex items-start gap-3">
                      <Code className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">Learning Tips</h3>
                        <ul className="space-y-2 text-muted-foreground">
                          <li>• Compare this model answer with your own writing to identify areas for improvement</li>
                          <li>• Pay attention to the paragraph structure and how ideas are connected</li>
                          <li>• Study the vocabulary and grammar patterns used in high-scoring responses</li>
                          <li>• Practice incorporating similar techniques into your own writing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ModelAnswers;
