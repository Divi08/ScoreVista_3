import { generateIELTSPassage } from '@/lib/ieltsPassageGenerator';

// In your component:
const handleGeneratePassage = async (topic: string) => {
  try {
    const passage = await generateIELTSPassage(topic);
    // Handle the generated passage
  } catch (error) {
    console.error("Failed to generate passage:", error);
    toast.error("Failed to generate passage");
  }
};