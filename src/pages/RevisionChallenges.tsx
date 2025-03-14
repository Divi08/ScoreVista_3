import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, RefreshCw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getGeminiFeedback } from "@/lib/geminiApi";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface Challenge {
  id: string;
  title: string;
  description: string;
  focusArea: string;
  example: string;
  exercise: string;
}

const RevisionChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    generateChallenges();
  }, []);

  const generateChallenges = async () => {
    setIsLoadingChallenges(true);
    toast.info("Generating revision challenges...");

    try {
      const prompt = `
        Generate exactly 5 IELTS writing revision challenges.
        
        FORMAT EACH CHALLENGE EXACTLY AS FOLLOWS with titles, headings and content:

        ## CHALLENGE TITLE
        Taming Run-On Sentences

        ## DESCRIPTION
        This challenge helps you avoid run-on sentences, which can make your writing confusing.

        ## FOCUS AREA
        Sentence Structure and Punctuation

        ## EXAMPLE
        Incorrect: Many students struggle with IELTS writing it requires practice and dedication.
        Corrected: Many students struggle with IELTS writing. It requires practice and dedication.

        ## EXERCISE
        Rewrite the following run-on sentence into two or more correct sentences: The exam is challenging proper preparation is essential for success time management is also key.
        
        ---
        
        (Continue with the next challenge after the separator)
      `;

      const response = await getGeminiFeedback(prompt);
      console.log("Received challenge response:", response);
      
      const challengeTexts = response.split("---").map(text => text.trim());
      const parsedChallenges: Challenge[] = [];
      
      if (challengeTexts.length === 0) {
        throw new Error("No challenges returned from API");
      }
      
      challengeTexts.forEach((text, index) => {
        const titleMatch = text.match(/## CHALLENGE TITLE\s*([\s\S]*?)(?=\s*##|$)/i);
        const descriptionMatch = text.match(/## DESCRIPTION\s*([\s\S]*?)(?=\s*##|$)/i);
        const focusAreaMatch = text.match(/## FOCUS AREA\s*([\s\S]*?)(?=\s*##|$)/i);
        const exampleMatch = text.match(/## EXAMPLE\s*([\s\S]*?)(?=\s*##|$)/i);
        const exerciseMatch = text.match(/## EXERCISE\s*([\s\S]*?)(?=\s*##|$)/i);
        
        const altTitleMatch = text.match(/\*\*Title:\*\*\s*([\s\S]*?)(?=\s*\*\*|\s*##|$)/i);
        const altDescriptionMatch = text.match(/\*\*Description:\*\*\s*([\s\S]*?)(?=\s*\*\*|\s*##|$)/i);
        const altFocusAreaMatch = text.match(/\*\*Focus Area:\*\*\s*([\s\S]*?)(?=\s*\*\*|\s*##|$)/i);
        const altExampleMatch = text.match(/\*\*Example:\*\*\s*([\s\S]*?)(?=\s*\*\*|\s*##|$)/i);
        const altExerciseMatch = text.match(/\*\*Exercise:\*\*\s*([\s\S]*?)(?=\s*\*\*|\s*##|$)/i);
        
        const title = 
          (titleMatch ? titleMatch[1].trim() : 
          (altTitleMatch ? altTitleMatch[1].trim() : null));
          
        if (title) {
          parsedChallenges.push({
            id: `challenge-${index + 1}`,
            title: title,
            description: (descriptionMatch ? descriptionMatch[1].trim() : 
                        (altDescriptionMatch ? altDescriptionMatch[1].trim() : 
                        "Improve your writing skills with this targeted exercise.")),
            focusArea: (focusAreaMatch ? focusAreaMatch[1].trim() : 
                      (altFocusAreaMatch ? altFocusAreaMatch[1].trim() : 
                      "Writing skills")),
            example: (exampleMatch ? exampleMatch[1].trim() : 
                    (altExampleMatch ? altExampleMatch[1].trim() : 
                    "Examples will help you understand the concept better.")),
            exercise: (exerciseMatch ? exerciseMatch[1].trim() : 
                     (altExerciseMatch ? altExerciseMatch[1].trim() : 
                     "Practice by writing a short paragraph applying the skills described above."))
          });
        }
      });
      
      console.log("Parsed challenges:", parsedChallenges);
      
      if (parsedChallenges.length === 0) {
        console.error("Failed to parse any challenges from response");
        throw new Error("Failed to parse challenges");
      }
      
      setChallenges(parsedChallenges);
      toast.success("Challenges generated successfully!");
    } catch (error) {
      console.error("Error generating challenges:", error);
      toast.error("Failed to generate challenges. Using fallback challenges.");
      
      const fallbackChallenges: Challenge[] = [
        {
          id: "challenge-1",
          title: "Mastering Cohesive Devices",
          description: "Improve your use of linking words and phrases to create coherent paragraphs.",
          focusArea: "Cohesion and Coherence",
          example: "Incorrect: I like studying English. I want to travel abroad. I need it for my job.\nCorrected: I like studying English because I want to travel abroad and need it for my job.",
          exercise: "Rewrite the following sentences using appropriate cohesive devices: The economy is growing rapidly. Inflation is becoming a problem. The government needs to take action."
        },
        {
          id: "challenge-2",
          title: "Sentence Variety Challenge",
          description: "Practice creating different sentence structures to improve your writing style.",
          focusArea: "Sentence Structure Variety",
          example: "Monotonous: Education is important. Education helps people get jobs. Education improves society.\nImproved: Education is important because it not only helps people secure employment but also contributes to societal improvement.",
          exercise: "Rewrite this paragraph with more varied sentence structures: Technology is changing fast. People use technology every day. Technology makes life easier. Some people think technology is bad."
        },
        {
          id: "challenge-3",
          title: "Academic Vocabulary Expansion",
          description: "Elevate your writing by incorporating more sophisticated vocabulary.",
          focusArea: "Lexical Resource",
          example: "Basic: Climate change is a big problem that affects many countries.\nImproved: Climate change represents a significant global challenge with far-reaching implications for numerous nations.",
          exercise: "Upgrade the vocabulary in the following sentence: Many people think that cities are good places to live because they have lots of things to do and many job options."
        },
        {
          id: "challenge-4",
          title: "Taming Run-On Sentences",
          description: "Learn to identify and fix sentences that combine multiple thoughts without proper punctuation.",
          focusArea: "Sentence Structure and Punctuation",
          example: "Incorrect: Many students struggle with writing they often combine multiple clauses without proper punctuation.\nCorrected: Many students struggle with writing. They often combine multiple clauses without proper punctuation.",
          exercise: "Rewrite the following run-on sentence into two or more correct sentences: The dog barked loudly the cat ran under the bed the owner sighed."
        },
        {
          id: "challenge-5",
          title: "Building Better Cohesion",
          description: "This challenge focuses on using cohesive devices to connect ideas smoothly.",
          focusArea: "Cohesion and Coherence",
          example: "Incorrect: The traffic was heavy. I arrived late.\nCorrected: Because the traffic was heavy, I arrived late. / The traffic was heavy; therefore, I arrived late.",
          exercise: "Connect the following sentences using a suitable cohesive device: The prompt was difficult. I managed to complete the essay."
        }
      ];
      
      setChallenges(fallbackChallenges);
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const handleSelectChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setUserAnswer("");
    setFeedback("");
  };

  const handleRefreshChallenges = () => {
    generateChallenges();
  };

  const handleSubmitAnswer = async () => {
    if (!selectedChallenge || userAnswer.trim().length < 20) {
      toast.error("Please write a longer answer");
      return;
    }

    setIsSubmitting(true);
    toast.info("Analyzing your answer...");

    try {
      const prompt = `
        Evaluate this student's answer to the following writing exercise. Provide constructive feedback.
        
        EXERCISE FOCUS: ${selectedChallenge.focusArea}
        
        EXERCISE: ${selectedChallenge.exercise}
        
        STUDENT'S ANSWER: "${userAnswer}"
        
        Please provide:
        1. Whether the answer effectively addresses the specific focus area
        2. What the student did well
        3. Specific suggestions for improvement
        4. A corrected or improved version if appropriate
        
        Format your feedback in a helpful, encouraging tone.
      `;

      const response = await getGeminiFeedback(prompt);
      setFeedback(response);
      toast.success("Feedback generated!");
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
              
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Revision Challenges</h1>
                  <p className="text-muted-foreground">
                    Targeted exercises to help you improve specific areas of your writing skills.
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshChallenges}
                  disabled={isLoadingChallenges}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh Challenges
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {isLoadingChallenges ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full inline-block mb-4"></div>
                  <p className="text-muted-foreground">Generating personalized revision challenges...</p>
                </div>
              ) : selectedChallenge ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedChallenge(null)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to Challenges
                    </Button>
                  </div>
                  
                  <div className="rounded-xl border bg-card shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {selectedChallenge.focusArea}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{selectedChallenge.title}</h2>
                    <p className="text-base text-muted-foreground mb-4">{selectedChallenge.description}</p>
                    
                    <div className="rounded-lg border bg-muted/30 p-4 mb-4">
                      <h3 className="font-medium mb-2">Example:</h3>
                      <p className="whitespace-pre-line">{selectedChallenge.example}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Your Challenge:</h3>
                      <p className="mb-4">{selectedChallenge.exercise}</p>
                      
                      <Textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Write your answer here..."
                        className="min-h-[150px] font-sans text-base leading-relaxed p-4"
                      />
                      
                      <div className="flex justify-end mt-3">
                        <Button 
                          onClick={handleSubmitAnswer}
                          disabled={isSubmitting || userAnswer.trim().length < 20}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {isSubmitting ? "Analyzing..." : "Submit For Feedback"}
                        </Button>
                      </div>
                    </div>
                    
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-lg border p-4 bg-muted/30"
                      >
                        <h3 className="font-medium mb-3">Feedback:</h3>
                        <div className="prose max-w-none dark:prose-invert">
                          <p className="whitespace-pre-line">{feedback}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {challenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ y: -4 }}
                      className="rounded-xl border bg-card shadow-sm p-5 flex flex-col h-full"
                    >
                      <div className="mb-3">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          {challenge.focusArea}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
                      <p className="text-muted-foreground mb-4 flex-1">{challenge.description}</p>
                      
                      <Button 
                        variant="outline" 
                        className="mt-auto"
                        onClick={() => handleSelectChallenge(challenge)}
                      >
                        Start Challenge
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default RevisionChallenges;
