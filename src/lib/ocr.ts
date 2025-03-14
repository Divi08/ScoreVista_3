
import { toast } from "sonner";

// Function to extract text from an image using Gemini 2.0 Flash
export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  // Check if the file is a valid image or PDF type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!validTypes.includes(imageFile.type)) {
    toast.error("Invalid file type. Please upload an image (JPEG, PNG) or PDF.");
    throw new Error("Invalid file type");
  }

  try {
    toast.info("Processing your document...");
    
    // Convert image file to base64
    const base64Data = await fileToBase64(imageFile);
    
    // Format based on file type
    let mimeType = imageFile.type;
    
    // Show a more specific progress message
    toast.info("Reading text from your document...");
    
    // Send the image to Gemini for text extraction
    const extractedText = await extractTextWithGemini(base64Data, mimeType);
    
    // Check if any text was extracted
    if (!extractedText || extractedText.trim() === '') {
      toast.warning("No text could be detected in the document");
      return "";
    }
    
    toast.success("Text extracted successfully!");
    return extractedText;
  } catch (error) {
    console.error("OCR error:", error);
    toast.error(`Failed to extract text: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract base64 data without the prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject("Failed to convert file to base64");
      }
    };
    reader.onerror = () => reject("Error reading file");
    reader.readAsDataURL(file);
  });
};

// Function to extract text from an image using Gemini 2.0 Flash
const extractTextWithGemini = async (base64Image: string, mimeType: string): Promise<string> => {
  const apiKey = "AIzaSyB1I9CJYdw69ZvPHMNt9vmdlTiuc90MEmc"; // Gemini API key
  const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";
  
  // Prepare the prompt for high-quality text extraction
  const prompt = `
    Perform precise optical character recognition (OCR) on this image.
    Extract ALL text content exactly as it appears, preserving:
    - Original paragraph structure
    - Correct capitalization
    - Punctuation
    - Line breaks
    - Bullet points and numbering

    Focus ONLY on extracting the text content. Do not include any analysis, commentary, 
    or description of the image - I only need the raw text.
    
    If no text is visible in the image, respond with "No text detected in the image."
  `;
  
  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.1, // Lower temperature for more precise extraction
          max_output_tokens: 8192, // Allow for longer documents
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error response:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini text extraction response received");

    // Extract the text from the response
    if (data.candidates && data.candidates.length > 0) {
      const textContent = data.candidates[0].content.parts[0].text;
      
      // Clean up any potential Gemini formatting artifacts
      const cleanedText = textContent
        .replace(/^["']|["']$/g, '') // Remove quotes at beginning/end
        .replace(/No text detected in the image/i, ''); // Replace with empty string if no text detected
      
      return cleanedText.trim();
    } else {
      console.error("Invalid response format from Gemini:", data);
      throw new Error("Failed to extract text from the image");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

// Helper function to create a preview URL for the uploaded image
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject("Failed to create image preview");
      }
    };
    reader.onerror = () => reject("Error reading file");
    reader.readAsDataURL(file);
  });
};
