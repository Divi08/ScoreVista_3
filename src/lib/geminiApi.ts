
import { toast } from "sonner";

// Gemini API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

// Interface for Gemini API response
interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  promptFeedback?: {
    blockReason?: string;
  };
}

// Function to analyze text with Gemini and get IELTS-style feedback
export const getGeminiFeedback = async (prompt: string): Promise<string> => {
  const formattedPrompt = `Analyze this text and provide detailed IELTS-style feedback. Format your response exactly as follows:

## CORRECTED TEXT
[Provide the text with all errors corrected while maintaining the original meaning]

## CRITICAL ERROR ANALYSIS
[List and explain all grammatical, vocabulary, and structural errors found]

## LANGUAGE ASSESSMENT
[Evaluate the overall language use, including vocabulary range, grammatical complexity, and coherence]

## IELTS BAND SCORE ANALYSIS
Task Achievement: [Score /9]
Coherence and Cohesion: [Score /9]
Lexical Resource: [Score /9]
Grammatical Range and Accuracy: [Score /9]
Overall Band Estimate: [Score /9]

[Continue with your original prompt content here]
${prompt}`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 8192,
          stopSequences: []
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response structure:', data);
      throw new Error("Invalid response structure from Gemini API");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    return rawText.trim();
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw error;
  }
};

// Function to parse the feedback into a structured format for our application
export const parseGeminiFeedback = (feedback: string) => {
  // Extract the corrected text from the feedback
  const correctedTextMatch = feedback.match(/## CORRECTED TEXT:\s*([^#]*?)(?=\s*##|$)/is);
  const correctedText = correctedTextMatch ? correctedTextMatch[1].trim() : null;
  
  // Extract the error analysis
  const errorAnalysisMatch = feedback.match(/## CRITICAL ERROR ANALYSIS:\s*([^#]*?)(?=\s*##|$)/is);
  const errorAnalysis = errorAnalysisMatch ? errorAnalysisMatch[1].trim() : null;
  
  // Extract the assessment
  const assessmentMatch = feedback.match(/## LANGUAGE ASSESSMENT:\s*([^#]*?)(?=\s*##|$)/is);
  const assessment = assessmentMatch ? assessmentMatch[1].trim() : null;
  
  // Extract IELTS band scores
  const ieltsMatch = feedback.match(/## IELTS BAND SCORE ANALYSIS:[\s\S]*?Overall Band Estimate: (\d+(?:\.\d+)?)/is);
  const estimatedScore = ieltsMatch ? parseFloat(ieltsMatch[1]) : null;
  
  // Return the structured feedback
  return {
    fullFeedback: feedback,
    correctedText: correctedText,
    errorAnalysis: errorAnalysis,
    assessment: assessment,
    estimatedIELTSBand: estimatedScore,
  };
};

export const generateIELTSPassage = async (topic: string, difficulty: string) => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Your request body here
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in generateIELTSPassage:', error);
    throw error;
  }
};
