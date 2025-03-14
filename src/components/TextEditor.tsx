
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Copy, Download } from "lucide-react";
import { TextBlock } from "@/lib/types";
import { toast } from "sonner";

interface TextEditorProps {
  blocks: TextBlock[];
  originalText: string;
}

const TextEditor = ({ blocks, originalText }: TextEditorProps) => {
  const [activeTab, setActiveTab] = useState<"original" | "corrected">("original");
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(null);

  // Deduplicate blocks and ensure we have unique text blocks
  const processedBlocks = blocks.reduce((unique: TextBlock[], block) => {
    // Only add if this text isn't already included
    if (!unique.some(b => b.text === block.text)) {
      unique.push(block);
    }
    return unique;
  }, []);

  const handleCopyText = () => {
    const textToCopy = activeTab === "original" 
      ? originalText 
      : processedBlocks.map(block => block.corrected || block.text).join('\n\n');
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast.success("Text copied to clipboard"))
      .catch(() => toast.error("Failed to copy text"));
  };

  const handleDownloadText = () => {
    const textToDownload = activeTab === "original" 
      ? originalText 
      : processedBlocks.map(block => block.corrected || block.text).join('\n\n');
    
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} text downloaded`);
  };

  const getHighlightColor = (type: string) => {
    switch (type) {
      case "grammar":
        return "bg-yellow-100 border-b border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700";
      case "spelling":
        return "bg-red-100 border-b border-red-300 dark:bg-red-900/30 dark:border-red-700";
      case "punctuation":
        return "bg-orange-100 border-b border-orange-300 dark:bg-orange-900/30 dark:border-orange-700";
      case "style":
        return "bg-purple-100 border-b border-purple-300 dark:bg-purple-900/30 dark:border-purple-700";
      case "clarity":
        return "bg-indigo-100 border-b border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700";
      case "vocabulary":
        return "bg-green-100 border-b border-green-300 dark:bg-green-900/30 dark:border-green-700";
      default:
        return "bg-blue-100 border-b border-blue-300 dark:bg-blue-900/30 dark:border-blue-700";
    }
  };

  // Render a text block with highlighted issues
  const renderTextBlock = (block: TextBlock) => {
    if (activeTab === "corrected") {
      return (
        <div className="my-4">
          <p className="whitespace-pre-wrap">{block.corrected || block.text}</p>
          {block.corrected && block.corrected !== block.text && (
            <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
              <span className="font-medium">Original: </span>
              <span className="italic">{block.text}</span>
            </div>
          )}
        </div>
      );
    }

    if (!block.issues || block.issues.length === 0) {
      return <p className="my-4 whitespace-pre-wrap">{block.text}</p>;
    }

    // Sort issues by start index to process them in order
    const sortedIssues = [...block.issues].sort((a, b) => a.startIndex - b.startIndex);
    
    let lastIndex = 0;
    const parts = [];

    sortedIssues.forEach((issue, index) => {
      // Add text before the issue
      if (issue.startIndex > lastIndex) {
        parts.push(
          <span key={`pre-${index}`} className="whitespace-pre-wrap">
            {block.text.substring(lastIndex, issue.startIndex)}
          </span>
        );
      }

      // Add the highlighted issue
      parts.push(
        <span
          key={`issue-${issue.id}`}
          className={`px-0.5 -mx-0.5 rounded cursor-help relative ${
            getHighlightColor(issue.type)
          } ${highlightedIssueId === issue.id ? "ring-2 ring-primary" : ""}`}
          title={`${issue.explanation}\nSuggestion: ${issue.suggestion}`}
          onMouseEnter={() => setHighlightedIssueId(issue.id)}
          onMouseLeave={() => setHighlightedIssueId(null)}
        >
          {block.text.substring(issue.startIndex, issue.endIndex)}
          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 rounded shadow-lg bg-white dark:bg-gray-800 text-xs w-60 z-10 ${highlightedIssueId === issue.id ? 'block' : 'hidden'}`}>
            <div className="font-medium mb-1">{issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Issue:</div>
            <div className="mb-1">{issue.explanation}</div>
            <div className="font-medium">Suggestion: <span className="text-primary">{issue.suggestion}</span></div>
          </div>
        </span>
      );

      lastIndex = issue.endIndex;
    });

    // Add any remaining text after the last issue
    if (lastIndex < block.text.length) {
      parts.push(
        <span key="post-issues" className="whitespace-pre-wrap">
          {block.text.substring(lastIndex)}
        </span>
      );
    }

    return <p className="my-4">{parts}</p>;
  };

  // Generate full corrected text for the corrected tab
  const getCorrectedText = () => {
    const correctedContent = processedBlocks.map(block => block.corrected || block.text).join('\n\n');
    return correctedContent;
  };

  return (
    <motion.div
      className="rounded-2xl border bg-card shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
    >
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-primary mr-2" />
          <h2 className="font-medium">Text Content</h2>
        </div>
        
        <div className="flex items-center">
          <div className="bg-secondary rounded-lg p-1 flex items-center mr-2">
            <button
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === "original"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("original")}
            >
              Original
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeTab === "corrected"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("corrected")}
            >
              Corrected
            </button>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={handleCopyText}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              title="Copy text"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadText}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              title="Download text"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-card/50 min-h-[200px] max-h-[400px] overflow-y-auto">
        {processedBlocks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <p>No text to display</p>
          </div>
        ) : (
          <div className="text-foreground">
            {activeTab === "corrected" ? (
              // Show corrected text as a cohesive document, not as separated blocks
              <div className="whitespace-pre-wrap">
                {processedBlocks.map((block, index) => (
                  <div key={block.id || index}>
                    {renderTextBlock(block)}
                  </div>
                ))}
              </div>
            ) : (
              // Show original text with issues highlighted
              processedBlocks.map((block, index) => (
                <div key={block.id || index}>
                  {renderTextBlock(block)}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {activeTab === "original" && processedBlocks.length > 0 && processedBlocks.some(block => block.issues?.length > 0) && (
        <div className="p-3 bg-muted/50 border-t text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 bg-background rounded">
              <span className="w-2 h-2 mr-1.5 rounded-full bg-yellow-400"></span>
              Grammar
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-background rounded">
              <span className="w-2 h-2 mr-1.5 rounded-full bg-red-400"></span>
              Spelling
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-background rounded">
              <span className="w-2 h-2 mr-1.5 rounded-full bg-orange-400"></span>
              Punctuation
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-background rounded">
              <span className="w-2 h-2 mr-1.5 rounded-full bg-purple-400"></span>
              Style
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-background rounded">
              <span className="w-2 h-2 mr-1.5 rounded-full bg-indigo-400"></span>
              Clarity
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-background rounded">
              <span className="w-2 h-2 mr-1.5 rounded-full bg-green-400"></span>
              Vocabulary
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TextEditor;
