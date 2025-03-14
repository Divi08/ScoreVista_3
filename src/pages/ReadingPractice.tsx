import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateIELTSPassage } from "@/lib/ieltsPassageGenerator";
import { Loader2, RefreshCw, Save, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { saveReadingPractice, getUserReadingPractices } from "@/lib/firebase";

const ReadingPractice = () => {
  const { currentUser } = useAuth();
  
  const [passage, setPassage] = useState<PassageWithHeadings | null>(null);
  const [activeTab, setActiveTab] = useState("read");
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [selectedHeadings, setSelectedHeadings] = useState<string[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [gapFillAnswers, setGapFillAnswers] = useState<string[]>([]);
  const [showGapFillAnswers, setShowGapFillAnswers] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedPractices, setSavedPractices] = useState<any[]>([]);
  const [isLoadingPractices, setIsLoadingPractices] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved practices from Firebase when component mounts
  useEffect(() => {
    if (currentUser) {
      loadSavedPractices();
    }
  }, [currentUser]);

  const loadSavedPractices = async () => {
    if (!currentUser) return;
    
    setIsLoadingPractices(true);
    try {
      const practices = await getUserReadingPractices(currentUser.uid);
      setSavedPractices(practices);
    } catch (error) {
      console.error("Error loading saved practices:", error);
      toast.error("Failed to load saved practices");
    } finally {
      setIsLoadingPractices(false);
    }
  };

  const handleLoadPractice = (savedPractice: any) => {
    try {
      setPassage(savedPractice.passage);
      setSelectedHeadings(savedPractice.userProgress.selectedHeadings);
      setGapFillAnswers(savedPractice.userProgress.gapFillAnswers);
      setDifficulty(savedPractice.difficulty);
      toast.success("Practice loaded successfully!");
    } catch (error) {
      console.error("Error loading practice:", error);
      toast.error("Failed to load practice");
    }
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
  };

  const handleGeneratePassage = async () => {
    setIsLoading(true);
    try {
      const generated = await generateIELTSPassage(difficulty);
      setPassage(generated);
      setSelectedHeadings(new Array(7).fill(""));
      setShowAnswers(false);
      toast.success("New passage generated successfully!");
    } catch (error) {
      console.error("Error generating passage:", error);
      toast.error("Failed to generate passage. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePractice = async () => {
    if (!passage || !currentUser) return;

    setIsSaving(true);
    try {
      const practiceData = {
        userId: currentUser.uid,
        difficulty,
        passage: {
          paragraphs: passage.paragraphs,
          headings: passage.headings,
          correctHeadings: passage.correctHeadings
        },
        userProgress: {
          selectedHeadings,
          gapFillAnswers
        }
      };

      await saveReadingPractice(currentUser.uid, practiceData);
      await loadSavedPractices(); // Reload the list
      setIsSaved(true);
      toast.success("Practice saved successfully!");
    } catch (error) {
      console.error("Error saving practice:", error);
      toast.error("Failed to save practice");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold">IELTS Reading Practice</h1>
        
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Select value={difficulty} onValueChange={handleDifficultyChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleGeneratePassage}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Generate Passage
                </>
              )}
            </Button>

            {currentUser && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Open Saved
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Saved Reading Practices</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] pr-4">
                    {isLoadingPractices ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : savedPractices.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No saved practices found
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {savedPractices.map((practice) => (
                          <Card
                            key={practice.id}
                            className="p-4 cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => handleLoadPractice(practice)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">
                                  {format(practice.createdAt.toDate(), 'PPP')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Difficulty: {practice.difficulty}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {practice.passage.paragraphs[0].substring(0, 100)}...
                            </p>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {passage && (
            <Button
              variant="outline"
              onClick={handleSavePractice}
              disabled={isSaving || isSaved || !currentUser}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isSaved ? "Saved" : "Save Practice"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : passage ? (
        <Card className="p-6 animate-in fade-in duration-500">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="read">Read Essay</TabsTrigger>
              <TabsTrigger value="match">Match Titles</TabsTrigger>
              <TabsTrigger value="gaps">Fill in the Blanks</TabsTrigger>
            </TabsList>

            <TabsContent value="read">
              <div className="space-y-6">
                {passage.paragraphs.map((paragraph, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold">Paragraph {String.fromCharCode(65 + index)}</h3>
                    <p>{paragraph}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="match">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Title Matching Exercise</h2>
                <p className="text-muted-foreground">
                  Read each paragraph and select the most appropriate title from the options below.
                </p>
                
                {passage.paragraphs.map((paragraph, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded">
                    <h3 className="font-semibold">Paragraph {String.fromCharCode(65 + index)}</h3>
                    <p className="mb-4">{paragraph}</p>
                    <Select
                      value={selectedHeadings[index] || ""}
                      onValueChange={(value) => {
                        const newHeadings = [...selectedHeadings];
                        newHeadings[index] = value;
                        setSelectedHeadings(newHeadings);
                      }}
                      disabled={showAnswers}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a title" />
                      </SelectTrigger>
                      <SelectContent>
                        {passage.headings.map((heading, i) => (
                          <SelectItem key={i} value={heading}>
                            {heading}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showAnswers && (
                      <p className={selectedHeadings[index] === passage.correctHeadings[index] 
                        ? "text-green-600" 
                        : "text-red-600"}>
                        Correct title: {passage.correctHeadings[index]}
                      </p>
                    )}
                  </div>
                ))}
                
                <Button 
                  onClick={() => setShowAnswers(true)}
                  disabled={selectedHeadings.includes("") || showAnswers}
                  className="mt-4"
                >
                  Check Answers
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="gaps">
              <div className="space-y-8">
                <div className="bg-muted p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">Fill in the Blanks</h2>
                  <p className="text-muted-foreground">
                    Select the correct word to complete each sentence from the passage.
                  </p>
                </div>

                {passage?.paragraphs.slice(0, 5).map((paragraph, index) => {
                  // Extract first 1-2 sentences from the paragraph
                  const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [];
                  const excerpt = sentences.slice(0, 2).join(' ');
                  
                  // Create a gap by removing a content word
                  const words = excerpt.split(' ');
                  const contentWords = words.filter(word => 
                    word.length > 4 && 
                    !['however', 'therefore', 'because', 'although'].includes(word.toLowerCase())
                  );
                  const wordToReplace = contentWords[Math.floor(Math.random() * contentWords.length)];
                  const gapIndex = words.findIndex(w => w === wordToReplace);
                  
                  // Generate options including the correct word
                  const options = [
                    wordToReplace,
                    ...contentWords.filter(w => w !== wordToReplace).slice(0, 3)
                  ].slice(0, 4).sort(() => Math.random() - 0.5);

                  const sentenceWithGap = [
                    ...words.slice(0, gapIndex),
                    '[_____]',
                    ...words.slice(gapIndex + 1)
                  ].join(' ');

                  return (
                    <Card key={index} className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="font-bold text-lg">{index + 1}.</span>
                          <p className="text-lg">{sentenceWithGap}</p>
                        </div>

                        <RadioGroup
                          className="gap-3"
                          value={gapFillAnswers[index]}
                          onValueChange={(value) => {
                            const newAnswers = [...gapFillAnswers];
                            newAnswers[index] = value;
                            setGapFillAnswers(newAnswers);
                          }}
                          disabled={showGapFillAnswers}
                        >
                          {options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={option} 
                                id={`option-${index}-${optionIndex}`}
                              />
                              <Label 
                                htmlFor={`option-${index}-${optionIndex}`} 
                                className="text-base"
                              >
                                {option}
                              </Label>
                              {showGapFillAnswers && (
                                <span className="ml-2">
                                  {option === wordToReplace ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  )}
                                </span>
                              )}
                            </div>
                          ))}
                        </RadioGroup>

                        {showGapFillAnswers && (
                          <div className={`mt-4 p-3 rounded-md ${
                            gapFillAnswers[index] === wordToReplace 
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          }`}>
                            <p className="font-medium">
                              {gapFillAnswers[index] === wordToReplace 
                                ? "Correct!" 
                                : `Incorrect. The correct answer is: ${wordToReplace}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}

                <div className="flex justify-center mt-6">
                  <Button
                    onClick={() => setShowGapFillAnswers(true)}
                    disabled={gapFillAnswers.length !== 5 || showGapFillAnswers}
                    size="lg"
                  >
                    Check Answers
                  </Button>
                </div>

                {showGapFillAnswers && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Your Score</h3>
                    <p className="text-lg">
                      {gapFillAnswers.filter((answer, index) => 
                        answer === passage?.paragraphs[index].split(' ')[
                          Math.floor(passage?.paragraphs[index].split(' ').length / 2)
                        ]
                      ).length} out of 5 correct
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      ) : (
        <div className="text-center animate-in fade-in duration-500">
          <p>Select a difficulty level to generate a new passage.</p>
        </div>
      )}
    </div>
  );
};

export default ReadingPractice;