
import { getGeminiFeedback } from './geminiApi';

type PromptType = 'task1' | 'task2';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type PromptTopic = 'environment' | 'technology' | 'education' | 'health' | 'society' | 'economy';

interface GeneratedPrompt {
  id: string;
  title: string;
  description: string;
  type: PromptType;
  timeLimit: number;
  difficulty: Difficulty;
  tags: string[];
  prompt: string;
  image?: string;
}

// Generate a unique ID for new prompts
const generateUniqueId = (type: PromptType, topic: string): string => {
  const timestamp = Date.now().toString(36);
  return `${type}-${topic.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
};

// Generate a new writing prompt using Gemini API
export const generateWritingPrompt = async (
  type: PromptType,
  difficulty: Difficulty,
  topic?: PromptTopic
): Promise<GeneratedPrompt> => {
  const topicToUse = topic || getRandomTopic();
  
  // Create a structured prompt for Gemini
  const aiPrompt = `
    As an IELTS examiner, create a realistic ${type === 'task1' ? 'Task 1' : 'Task 2'} writing prompt.
    
    REQUIREMENTS:
    - Difficulty level: ${difficulty}
    - Topic area: ${topicToUse}
    - ${type === 'task1' 
        ? 'Create a prompt about analyzing and describing data in a graph, chart, or process diagram.' 
        : 'Create an essay prompt that requires argumentation, discussion or providing solutions.'}
    - Include a clear, concise question or instruction.
    - Ensure the prompt is challenging but appropriate for the specified difficulty level.
    
    FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS WITH NO ADDITIONAL TEXT:
    
    ## TITLE
    (A brief, catchy title for the writing prompt)
    
    ## DESCRIPTION
    (A one-sentence description of what the task involves)
    
    ## TAGS
    (3-4 relevant keywords separated by commas)
    
    ## PROMPT
    (The full writing prompt as it would appear in an IELTS exam)
  `;

  try {
    // Get response from Gemini
    const response = await getGeminiFeedback(aiPrompt);
    
    // Parse response
    const titleMatch = response.match(/## TITLE\s*(.*?)(?=\s*##|$)/is);
    const descriptionMatch = response.match(/## DESCRIPTION\s*(.*?)(?=\s*##|$)/is);
    const tagsMatch = response.match(/## TAGS\s*(.*?)(?=\s*##|$)/is);
    const promptMatch = response.match(/## PROMPT\s*(.*?)(?=\s*##|$)/is);
    
    const title = titleMatch?.[1]?.trim() || `${topicToUse.charAt(0).toUpperCase() + topicToUse.slice(1)} ${type === 'task1' ? 'Analysis' : 'Essay'}`;
    const description = descriptionMatch?.[1]?.trim() || `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level ${type} exercise about ${topicToUse}.`;
    const tagsArray = tagsMatch?.[1]?.trim().split(',').map(tag => tag.trim()) || [topicToUse, difficulty, type];
    const promptText = promptMatch?.[1]?.trim() || "Please write a response to this prompt.";
    
    // Determine time limit based on task type
    const timeLimit = type === 'task1' ? 20 : 40;
    
    // Create the generated prompt
    return {
      id: generateUniqueId(type, title),
      title,
      description,
      type,
      timeLimit,
      difficulty,
      tags: tagsArray,
      prompt: promptText,
      // For Task 1 visual prompts, we'd need to generate or select images
      // This would require a separate implementation
    };
  } catch (error) {
    console.error("Error generating writing prompt:", error);
    
    // Fallback prompt if API fails
    return {
      id: generateUniqueId(type, topicToUse),
      title: `${topicToUse.charAt(0).toUpperCase() + topicToUse.slice(1)} ${type === 'task1' ? 'Analysis' : 'Discussion'}`,
      description: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} level writing exercise focusing on ${topicToUse}.`,
      type,
      timeLimit: type === 'task1' ? 20 : 40,
      difficulty,
      tags: [topicToUse, type, difficulty],
      prompt: type === 'task1' 
        ? `The chart shows data related to ${topicToUse}. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.`
        : `Write an essay discussing the impact of ${topicToUse} on modern society. Include relevant examples and provide your own perspective.`
    };
  }
};

// Get a random topic if none is specified
const getRandomTopic = (): PromptTopic => {
  const topics: PromptTopic[] = ['environment', 'technology', 'education', 'health', 'society', 'economy'];
  return topics[Math.floor(Math.random() * topics.length)];
};

// Check if a response answers the prompt
export const evaluateResponseRelevance = async (
  prompt: string,
  response: string
): Promise<{ relevant: boolean; feedback: string }> => {
  // Skip if response is too short
  if (response.trim().length < 50) {
    return { 
      relevant: false, 
      feedback: "Your response is too short to evaluate properly. Please write a more complete answer."
    };
  }

  // Create a structured prompt for Gemini
  const aiPrompt = `
    As an IELTS examiner, evaluate if the following response properly answers the given writing prompt.
    
    WRITING PROMPT:
    "${prompt}"
    
    STUDENT RESPONSE:
    "${response.substring(0, 1000)}" ${response.length > 1000 ? '...(truncated)' : ''}
    
    TASK:
    1. Determine if the response answers the question/prompt. 
    2. Provide brief, specific feedback on how well the response addresses the task.
    
    FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS WITH NO ADDITIONAL TEXT:
    
    ## RELEVANCE
    (YES or NO - Does the response answer the prompt?)
    
    ## FEEDBACK
    (2-3 sentences explaining why the response does or doesn't properly address the prompt)
  `;

  try {
    // Get response from Gemini
    const response = await getGeminiFeedback(aiPrompt);
    
    // Parse response
    const relevanceMatch = response.match(/## RELEVANCE\s*(.*?)(?=\s*##|$)/is);
    const feedbackMatch = response.match(/## FEEDBACK\s*(.*?)(?=\s*##|$)/is);
    
    const isRelevant = relevanceMatch?.[1]?.trim().toLowerCase().includes('yes') || false;
    const feedback = feedbackMatch?.[1]?.trim() || "Unable to evaluate response relevance.";
    
    return {
      relevant: isRelevant,
      feedback
    };
  } catch (error) {
    console.error("Error evaluating response relevance:", error);
    return {
      relevant: true, // Default to true in case of error
      feedback: "Unable to evaluate response relevance due to a system error."
    };
  }
};
