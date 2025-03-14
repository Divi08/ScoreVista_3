
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  BarChart, 
  FileText, 
  Clock, 
  RotateCcw, 
  Timer, 
  Sparkles, 
  Check,
  Brain,
  Target,
  Star
} from "lucide-react";

const Features = () => {
  const navigate = useNavigate();

  const featuresList = [
    {
      title: "Writing Exercises",
      description: "Practice with IELTS Task 1 and Task 2 writing prompts categorized by difficulty level and type.",
      icon: <FileText className="w-6 h-6 text-primary" />,
      color: "bg-primary/10",
    },
    {
      title: "Live Analysis",
      description: "Get instant feedback on your writing with our AI-powered analysis tool that highlights areas for improvement.",
      icon: <Brain className="w-6 h-6 text-violet-500" />,
      color: "bg-violet-100 dark:bg-violet-900/30",
    },
    {
      title: "Visual Data Interpretation",
      description: "Practice with interactive bar charts, line graphs, and process diagrams for Task 1 preparation.",
      icon: <BarChart className="w-6 h-6 text-blue-500" />,
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Progress Tracking",
      description: "Monitor your improvement over time with detailed analytics and performance metrics.",
      icon: <Target className="w-6 h-6 text-green-500" />,
      color: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Compare Revisions",
      description: "Upload multiple versions of your essay to see your progress and improvements over time.",
      icon: <RotateCcw className="w-6 h-6 text-amber-500" />,
      color: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Timed Practice",
      description: "Simulate exam conditions with our customizable timer and practice writing under pressure.",
      icon: <Timer className="w-6 h-6 text-red-500" />,
      color: "bg-red-100 dark:bg-red-900/30",
    },
    {
      title: "Model Answers",
      description: "Compare your writing with AI-generated model answers to understand what high-scoring responses look like.",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      color: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      title: "Revision Challenges",
      description: "Get targeted exercises to help you correct specific areas of weakness in your writing.",
      icon: <Check className="w-6 h-6 text-emerald-500" />,
      color: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Everything You Need to Improve Your IELTS Score
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              ScoreVista provides a comprehensive set of tools to help you practice, analyze, and perfect your IELTS writing skills.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {featuresList.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex gap-4 p-6 rounded-xl border bg-card"
              >
                <div className={`p-3 rounded-lg ${feature.color} flex-shrink-0`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="px-8"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Today
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Join thousands of students who have improved their IELTS scores with ScoreVista
            </p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Features;
