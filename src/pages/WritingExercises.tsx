import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, Edit, RotateCcw, Sparkles, Timer, Search, Filter } from "lucide-react";
import WritingExerciseCard from "@/components/WritingExerciseCard";
import RevisionToolCard from "@/components/RevisionToolCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export const exercisesData = [
  {
    id: 'task1-1',
    title: 'Graph Analysis',
    description: 'Describe the trends shown in the line graph about global temperature changes.',
    type: 'task1',
    timeLimit: 20,
    difficulty: 'intermediate',
    tags: ['graphs', 'climate', 'academic'],
  },
  {
    id: 'task2-1',
    title: 'Technology Impact',
    description: 'Discuss the positive and negative effects of technology on modern society.',
    type: 'task2',
    timeLimit: 40,
    difficulty: 'advanced',
    tags: ['technology', 'society', 'opinion'],
  },
  // Add more exercises as needed
];

// Revision tools database - updated with actual paths
const revisionToolsData = [
  {
    id: "compare-revisions",
    title: "Compare Revisions",
    description: "Upload multiple versions of your essay to see your progress and improvements over time.",
    icon: <RotateCcw className="w-5 h-5" />,
    path: "/revision-tools/compare-revisions"
  },
  {
    id: "timed-practice",
    title: "Timed Practice",
    description: "Practice writing under exam conditions with our customizable timer and prompts.",
    icon: <Timer className="w-5 h-5" />,
    path: "/revision-tools/timed-practice"
  },
  {
    id: "model-answers",
    title: "Model Answers",
    description: "Compare your writing with AI-generated model answers for any IELTS writing task.",
    icon: <Sparkles className="w-5 h-5" />,
    path: "/revision-tools/model-answers"
  },
  {
    id: "revision-challenges",
    title: "Revision Challenges",
    description: "Get targeted exercises to help you correct specific areas of weakness in your writing.",
    icon: <Check className="w-5 h-5" />,
    path: "/revision-tools/revision-challenges"
  },
];

const WritingExercises = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("exercises");
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // Filter exercises based on search term and filters
  const filteredExercises = exercisesData.filter(exercise => {
    // Apply search filter
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exercise.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply difficulty filter
    const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
    
    // Apply type filter
    const matchesType = typeFilter === "all" || exercise.type === typeFilter;
    
    return matchesSearch && matchesDifficulty && matchesType;
  });

  const handleStartExercise = (exerciseId: string) => {
    console.log("Starting exercise:", exerciseId);
    // Redirect to the exercise detail page
    navigate(`/dashboard/exercise/${exerciseId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 inline-block">
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                Writing Practice
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              Interactive Writing Exercises
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Improve your writing skills with guided practice exercises, real-time feedback, and revision tools.
            </p>
          </motion.div>

          <Tabs defaultValue="exercises" onValueChange={setActiveTab} className="w-full mb-10">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="exercises">Writing Prompts</TabsTrigger>
              <TabsTrigger value="revision">Revision Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="exercises">
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search exercises..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger className="w-[140px]">
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          <span>Difficulty</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[140px]">
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          <span>Type</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="task1">Task 1</SelectItem>
                          <SelectItem value="task2">Task 2</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {filteredExercises.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No exercises match your search criteria.</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setSearchTerm("");
                        setDifficultyFilter("all");
                        setTypeFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredExercises.map((exercise) => (
                  <WritingExerciseCard
                    key={exercise.id}
                    id={exercise.id}
                    title={exercise.title}
                    description={exercise.description}
                    type={exercise.type}
                    timeLimit={exercise.timeLimit}
                    difficulty={exercise.difficulty}
                    tags={exercise.tags}
                    onClick={() => handleStartExercise(exercise.id)}
                  />
                ))}
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button 
                  onClick={() => navigate("/dashboard/ielts")}
                  className="px-6"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Custom AI Prompt
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="revision">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {revisionToolsData.map((tool) => (
                  <RevisionToolCard
                    key={tool.id}
                    title={tool.title}
                    description={tool.description}
                    icon={tool.icon}
                    path={`/dashboard${tool.path.replace('/revision-tools', '')}`}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="rounded-xl border bg-card shadow-sm p-6 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Did you know?</h2>
            <p className="text-muted-foreground mb-4">
              {activeTab === "exercises" 
                ? "Regular practice with different IELTS task types is the most effective way to improve your writing score. Our prompts are designed to cover all the common IELTS topics and question formats."
                : "Reviewing and revising your work is just as important as the initial writing. Our revision tools help you identify patterns in your writing and track improvements over time."}
            </p>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-primary" />
                <span>Updated weekly</span>
              </div>
              <div className="flex items-center">
                <Edit className="w-4 h-4 mr-1.5 text-primary" />
                <span>AI-powered feedback</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default WritingExercises;
