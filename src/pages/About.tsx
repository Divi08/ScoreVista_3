
import { motion } from "framer-motion";
import { Info, Award, GraduationCap, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
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
                About Us
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              The Writing Assistance Platform
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed to help you improve your writing skills with AI-powered feedback and guidance.
            </p>
          </motion.div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-card rounded-xl border p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-primary/10 text-primary">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
                  <p className="text-muted-foreground">
                    ClarityHelper was created to make writing improvement accessible to everyone. Our platform 
                    uses advanced AI to analyze writing, provide personalized feedback, and offer tailored 
                    exercises to help writers at all levels improve their skills. Whether you're preparing for 
                    the IELTS exam, writing academic papers, or simply want to enhance your everyday writing,
                    our tools are designed to help you communicate more effectively.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-card rounded-xl border p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-primary/10 text-primary">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Our Approach</h2>
                  <p className="text-muted-foreground mb-4">
                    We combine advanced natural language processing with educational best practices to deliver
                    a learning experience that's both effective and engaging. Our feedback is designed to be
                    constructive, actionable, and tailored to each individual's needs.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Personalized Feedback</h3>
                        <p className="text-sm text-muted-foreground">Tailored to your specific writing style and goals</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Targeted Exercises</h3>
                        <p className="text-sm text-muted-foreground">Focus on areas where you need the most improvement</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Progress Tracking</h3>
                        <p className="text-sm text-muted-foreground">See how your writing improves over time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">IELTS-Focused</h3>
                        <p className="text-sm text-muted-foreground">Special attention to IELTS writing requirements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-card rounded-xl border p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-primary/10 text-primary">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3">Our Technology</h2>
                  <p className="text-muted-foreground">
                    We leverage the latest advancements in AI and natural language processing to provide 
                    accurate, helpful feedback on your writing. Our system is continuously learning and
                    improving, ensuring that the guidance you receive is always up-to-date with the latest
                    standards in English writing and IELTS assessment criteria.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
