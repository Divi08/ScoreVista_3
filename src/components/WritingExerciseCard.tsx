
import { motion } from "framer-motion";
import { Clock, ArrowRight, BarChart, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Difficulty = "beginner" | "intermediate" | "advanced";
type ExerciseType = "task1" | "task2";

interface WritingExerciseCardProps {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  timeLimit: number;
  difficulty: Difficulty;
  tags: string[];
  onClick: () => void;
}

const WritingExerciseCard = ({ 
  id,
  title, 
  description, 
  type, 
  timeLimit, 
  difficulty, 
  tags,
  onClick 
}: WritingExerciseCardProps) => {
  const getDifficultyColor = (difficulty: Difficulty) => {
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

  const getTypeIcon = (type: ExerciseType) => {
    switch (type) {
      case "task1":
        return <BarChart className="w-4 h-4" />;
      case "task2":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-xl border bg-card shadow-sm p-5 flex flex-col h-full"
    >
      <div className="flex justify-between mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getDifficultyColor(difficulty)}`}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
        <span className="flex items-center text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 mr-1" />
          {timeLimit} min
        </span>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 flex-1">{description}</p>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
            {getTypeIcon(type)}
            <span className="ml-1">{type === "task1" ? "Task 1" : "Task 2"}</span>
          </span>
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-secondary text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-auto">
        <Link to={`/writing-exercises/${id}`} onClick={onClick}>
          <Button variant="outline" className="w-full">
            Start Exercise
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default WritingExerciseCard;
