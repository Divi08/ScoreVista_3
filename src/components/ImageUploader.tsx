
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpCircle, FileText, Trash2, Image } from "lucide-react";
import { extractTextFromImage, createImagePreview } from "@/lib/ocr";
import { toast } from "sonner";

interface ImageUploaderProps {
  onTextExtracted: (text: string) => void;
}

const ImageUploader = ({ onTextExtracted }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    try {
      setFile(file);
      setIsProcessing(true);
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);
      
      toast.info("Processing your document with AI...");
      const extractedText = await extractTextFromImage(file);
      
      // Add debug logging
      console.log("Extracted text length:", extractedText?.length);
      console.log("First 100 chars:", extractedText?.substring(0, 100));
      
      if (!extractedText || extractedText.trim() === '') {
        toast.warning("No text could be detected in your document");
        onTextExtracted(""); // Pass empty string to parent
        return;
      }
      
      onTextExtracted(extractedText);
      toast.success("Text extracted successfully!");
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process the document. Please try another.");
      onTextExtracted(""); // Pass empty string to parent on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      await processFile(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      await processFile(selectedFile);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div 
        className={`p-1 rounded-2xl bg-gradient-to-br ${isDragging ? 'from-primary to-primary/70' : 'from-primary/30 to-primary/5'} transition-all duration-300`}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!file ? triggerFileInput : undefined}
          className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all duration-300 ${
            isDragging 
              ? 'border-primary bg-primary/5 cursor-copy' 
              : file 
                ? 'border-primary/30 bg-background' 
                : 'border-border bg-background/50 hover:bg-secondary/50 cursor-pointer'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/gif,application/pdf"
            className="hidden"
          />
          
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="upload"
                className="flex flex-col items-center space-y-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowUpCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Upload document for analysis</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Drag and drop an image or PDF, or click to browse
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Supports JPEG, PNG, and PDF</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                className="flex flex-col items-center w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative mb-4 rounded-lg overflow-hidden shadow-md">
                  {preview ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-h-48 max-w-full object-contain" 
                      />
                    </motion.div>
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-muted">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between w-full max-w-md">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium truncate max-w-[200px]">
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={removeFile}
                    className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-destructive"
                    aria-label="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isProcessing && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-medium">Reading text with AI...</p>
                <p className="text-xs text-muted-foreground max-w-xs text-center">
                  Our AI is analyzing your document to extract all text content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ImageUploader;
