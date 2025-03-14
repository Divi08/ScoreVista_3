import { toast } from "sonner";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

interface PassageWithHeadings {
  passage: string;
  paragraphs: string[];
  headings: string[];
  correctHeadings: string[];
  gapFillWords: string[];
  gapFillAnswers: string[];
}

export const generateIELTSPassage = async (difficulty: string): Promise<PassageWithHeadings> => {
  const prompt = `Generate an IELTS reading passage with 7 paragraphs about any academic topic. 
  The difficulty level should be: ${difficulty}.

  Requirements:
  1. Content should be academic and factual
  2. Paragraphs should flow logically
  3. Content should be suitable for IELTS reading test
  4. After the passage, provide exactly 7 headings that match the paragraphs
  5. Use advanced vocabulary and complex sentence structures for higher difficulty levels
  6. Include specific examples, data, or research findings
  7. Make sure the content is unique and not repetitive
  8. For ${difficulty} level, use appropriate language complexity
  9. Include some key terms or phrases that could be used for gap-filling exercises

  Format your response exactly as follows:

  ## PASSAGE
  [First paragraph]
  [Second paragraph]
  [continue for all 7 paragraphs]

  ## HEADINGS
  1. [Heading for first paragraph]
  2. [Heading for second paragraph]
  [continue for all 7 headings]`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid API response format");
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    // Extract passage and headings
    const passageMatch = generatedText.match(/## PASSAGE\n([\s\S]*?)(?=\n## HEADINGS|$)/);
    const headingsMatch = generatedText.match(/## HEADINGS\n([\s\S]*?)$/);

    if (!passageMatch || !headingsMatch) {
      throw new Error("Failed to parse AI response");
    }

    // Split passage into paragraphs and add labels
    const rawParagraphs = passageMatch[1].trim().split('\n\n');
    const paragraphs = rawParagraphs.map((p, i) => p.trim());
    
    // Extract and process headings
    const headings = headingsMatch[1]
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    // Validate the response
    if (paragraphs.length !== 7 || headings.length !== 7) {
      throw new Error("Invalid number of paragraphs or headings generated");
    }

    // Create gap fill exercise (simplified version - you might want to enhance this)
    const gapFillWords = [];
    const gapFillAnswers = [];
    
    // For now, just using the first word of each paragraph as a gap
    paragraphs.forEach(para => {
      const firstWord = para.split(' ')[0];
      gapFillWords.push(firstWord);
      gapFillAnswers.push(firstWord);
    });

    return {
      passage: paragraphs.join('\n\n'),
      paragraphs,
      headings: shuffleArray(headings),
      correctHeadings: [...headings],
      gapFillWords,
      gapFillAnswers
    };

  } catch (error) {
    console.error("Error generating passage:", error);
    toast.error("Failed to generate passage. Retrying...");
    return generateIELTSPassage(difficulty);
  }
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
