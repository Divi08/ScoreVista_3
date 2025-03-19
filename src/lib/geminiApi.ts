import { toast } from "sonner";

// Gemini API key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Fix the API endpoint to use the correct model name
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

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
export const getGeminiFeedback = async (text: string): Promise<string> => {
  try {
    // Create an improved prompt for Gemini with English teacher context
    const prompt = `
      You are a professional English teacher and IELTS examiner with 15+ years of experience. You will analyze text and provide helpful, precise feedback.
      
      CRITICAL INSTRUCTIONS:
      - Focus ONLY on actual errors and meaningful improvements. Do not invent problems if the text is correct.
      - Be concise and precise in your feedback.
      - Only highlight significant errors that impact meaning or clarity.
      - Group similar errors rather than listing every instance.
      - For academic texts, maintain flexibility on stylistic choices.
      - PRESERVE the original paragraph structure in your corrected version.
      - DO NOT mark correct usage as errors.
      - DO NOT repeat the original text excessively. Only include ONE corrected version.
      - Be realistic about IELTS scoring - be fair in your assessment.
      - FOCUS on grammar, coherence, lexical resource, and task achievement.
      - KEEP your explanations brief and actionable.
      
      FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:
      
      ## CORRECTED TEXT:
      (The fully corrected version of the text, preserving original paragraph structure)
      
      ## ERROR ANALYSIS:
      (List only 2-3 significant errors grouped by type with brief explanations)
      
      ## ASSESSMENT:
      (1-2 sentences on strengths, followed by 1-2 sentences on key areas to improve)
      
      ## IELTS ESTIMATE:
      (Estimated band score from 1-9 with a one-sentence justification)
      
      TEXT TO ANALYZE:
      "${text.trim()}"
    `;

    console.log("Calling Gemini API with text:", text.substring(0, 50) + "...");

    // Call Gemini API with the updated endpoint
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.05, // Lower temperature for more consistent results
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as GeminiResponse;

    // Check if the response was blocked
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Content blocked by Gemini: ${data.promptFeedback.blockReason}`);
    }

    // Extract the feedback from the API response
    if (data.candidates && data.candidates.length > 0) {
      const feedback = data.candidates[0].content.parts[0].text;
      console.log("Received Gemini feedback successfully");
      return feedback;
    } else {
      throw new Error("No feedback received from Gemini");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    toast.error(`Failed to get AI feedback: ${error instanceof Error ? error.message : "Unknown error"}`);
    return "Unable to generate AI feedback at this time. Please try again later.";
  }
};

// Function to parse the Gemini feedback into a structured format for our application
export const parseGeminiFeedback = (feedback: string) => {
  // Extract the corrected text from the feedback
  const correctedTextMatch = feedback.match(/## CORRECTED TEXT:\s*([^#]*?)(?=\s*##|$)/is);
  const correctedText = correctedTextMatch ? correctedTextMatch[1].trim() : null;
  
  // Extract the error analysis
  const errorAnalysisMatch = feedback.match(/## ERROR ANALYSIS:\s*([^#]*?)(?=\s*##|$)/is);
  const errorAnalysis = errorAnalysisMatch ? errorAnalysisMatch[1].trim() : null;
  
  // Extract the assessment
  const assessmentMatch = feedback.match(/## ASSESSMENT:\s*([^#]*?)(?=\s*##|$)/is);
  const assessment = assessmentMatch ? assessmentMatch[1].trim() : null;
  
  // Extract estimated IELTS band score
  const bandScoreMatch = feedback.match(/## IELTS ESTIMATE:.*?(\d+(?:\.\d+)?)/is);
  const estimatedScore = bandScoreMatch ? parseFloat(bandScoreMatch[1]) : null;
  
  // Return the structured feedback
  return {
    fullFeedback: feedback,
    correctedText: correctedText,
    errorAnalysis: errorAnalysis,
    assessment: assessment,
    estimatedIELTSBand: estimatedScore,
  };
};
