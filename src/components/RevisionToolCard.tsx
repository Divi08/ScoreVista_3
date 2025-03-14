
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface RevisionToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const RevisionToolCard = ({ title, description, icon, path }: RevisionToolCardProps) => {
  // Make sure any paths starting with /revision-tools are redirected to /dashboard
  const formattedPath = path.startsWith("/revision-tools") 
    ? `/dashboard${path.replace('/revision-tools', '')}` 
    : path;
    
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-xl border bg-card shadow-sm p-6 flex flex-col h-full"
    >
      <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center mb-4">
        <div className="text-primary">
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 flex-1">{description}</p>
      
      <Link to={formattedPath} className="mt-auto">
        <Button 
          variant="outline" 
          className="w-full"
        >
          Open Tool
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </motion.div>
  );
};

export default RevisionToolCard;
