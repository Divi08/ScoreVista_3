
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { saveAnalysisResult } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploader from "@/components/ImageUploader";
import TextPasteArea from "@/components/TextPasteArea";
import TextEditor from "@/components/TextEditor";
import AnalysisPanel from "@/components/AnalysisPanel";
import { analyzeText } from "@/lib/textAnalysis";
import { TextAnalysisResult } from "@/lib/types";
import { toast } from "sonner";
import { FileText, Image } from "lucide-react";

const Analysis = () => {
  const { currentUser } = useAuth();
  const [extractedText, setExtractedText] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<TextAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [inputMethod, setInputMethod] = useState<string>("image");

  const handleAnalyzeText = async (text: string) => {
    // Add debug logging
    console.log("Attempting to analyze text:", text?.substring(0, 100));
    
    if (!text?.trim()) {
      toast.error("No text to analyze. Please upload an image or paste text first.");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Analyzing text...");

    try {
      const result = await analyzeText(text);
      setAnalysisResult(result);
      
      // Save analysis to Firebase only if user is logged in
      if (currentUser) {
        await saveAnalysisResult(currentUser.uid, {
          originalText: text,
          overallScore: result.overallScore,
          metrics: result.metrics,
          title: text.substring(0, 30) + "...",
          ieltsEstimate: result.metrics.ieltsEstimate || null,
        });
      }
      
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Text Analysis</h1>
        <p className="text-muted-foreground">
          Upload an image of your text or paste directly to get instant feedback
        </p>
      </div>
      
      <div className="space-y-8">
        <Tabs defaultValue="image" onValueChange={setInputMethod} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span>Upload Document</span>
            </TabsTrigger>
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Paste Text</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="image">
            <ImageUploader onTextExtracted={handleTextExtracted} />
          </TabsContent>
          
          <TabsContent value="paste">
            <TextPasteArea onTextSubmit={handleTextExtracted} />
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
  );
};

export default Analysis;
