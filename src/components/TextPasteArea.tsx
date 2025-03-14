
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface TextPasteAreaProps {
  onTextSubmit: (text: string) => void;
}

const TextPasteArea = ({ onTextSubmit }: TextPasteAreaProps) => {
  const [text, setText] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = () => {
    if (text.trim().length < 10) {
      toast.error("Please enter at least 10 characters to analyze.");
      return;
    }
    onTextSubmit(text);
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste or type your text here..."
        className="min-h-[200px] font-sans text-base leading-relaxed p-4"
        value={text}
        onChange={handleTextChange}
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={text.trim().length < 10}
          className="px-6"
        >
          Analyze
        </Button>
      </div>
    </div>
  );
};

export default TextPasteArea;
