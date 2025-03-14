
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer 
      className="w-full py-6 px-4 sm:px-6 mt-8 border-t"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <div className="mb-4 md:mb-0">
          <p>© 2023 ClarityHelper AI. All rights reserved.</p>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#" className="hover:text-foreground transition-colors duration-200">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground transition-colors duration-200">
            Terms
          </a>
          <a href="#" className="hover:text-foreground transition-colors duration-200">
            Support
          </a>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
