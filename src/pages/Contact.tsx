
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success("Your message has been sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitting(false);
    }, 1500);
  };

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
                Get In Touch
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-6"
            >
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Get In Touch</h2>
                <p className="text-muted-foreground mb-6">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">support@clarityhelper.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Office</p>
                      <p className="text-sm text-muted-foreground">123 Writing Ave, Education City, CA 94103</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">How accurate is the AI feedback?</h3>
                    <p className="text-sm text-muted-foreground">Our AI provides professional-grade feedback based on IELTS standards and academic writing principles.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Can I use this for my IELTS preparation?</h3>
                    <p className="text-sm text-muted-foreground">Yes! Our platform is specifically designed to help with IELTS writing preparation.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Is there a limit to how many texts I can analyze?</h3>
                    <p className="text-sm text-muted-foreground">The free tier includes 5 analyses per month. Premium users enjoy unlimited analyses.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Your name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea 
                    id="message" 
                    placeholder="How can we help you?" 
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
