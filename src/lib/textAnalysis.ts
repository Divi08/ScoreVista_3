import { TextAnalysisResult, TextBlock, TextIssue, TextMetrics, IssueType, IssueSeverity, TextPattern } from './types';
import { getGeminiFeedback, parseGeminiFeedback } from './geminiApi';

// Function to analyze text and provide feedback
export const analyzeText = async (text: string): Promise<TextAnalysisResult> => {
  try {
    // Input validation with detailed logging
    if (!text || typeof text !== 'string') {
      console.error("Input validation failed:", { text, type: typeof text });
      throw new Error('Invalid input: Text must be a non-empty string');
    }
    console.log("Input validation passed, text length:", text.length);

    // Get feedback from Gemini with error handling
    let geminiFeedback;
    try {
      console.log("Requesting Gemini feedback...");
      geminiFeedback = await getGeminiFeedback(text);
      if (!geminiFeedback) {
        throw new Error("Gemini returned empty feedback");
      }
      console.log("Gemini feedback received successfully, length:", geminiFeedback.length);
    } catch (error) {
      console.error("Gemini API error details:", {
        error: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      throw new Error(`Failed to get AI feedback: ${error.message}`);
    }

    // Parse Gemini feedback with validation
    let parsedGeminiFeedback;
    try {
      console.log("Parsing Gemini feedback...");
      parsedGeminiFeedback = parseGeminiFeedback(geminiFeedback);
      console.log("Parsed feedback structure:", {
        keys: Object.keys(parsedGeminiFeedback),
        hasCorrections: Boolean(parsedGeminiFeedback.correctedText),
        hasAnalysis: Boolean(parsedGeminiFeedback.errorAnalysis)
      });
    } catch (error) {
      console.error("Feedback parsing error details:", {
        error: error.message,
        feedback: geminiFeedback?.substring(0, 100) + "..."
      });
      throw new Error(`Failed to parse AI feedback: ${error.message}`);
    }

    // Create text blocks with error handling
    let blocks;
    try {
      console.log("Creating text blocks...");
      blocks = createTextBlocks(text, parsedGeminiFeedback.correctedText || "");
      console.log("Text blocks created:", {
        count: blocks.length,
        firstBlock: blocks[0]?.text?.substring(0, 50) + "..."
      });
    } catch (error) {
      console.error("Block creation error details:", {
        error: error.message,
        originalText: text.substring(0, 100) + "...",
        correctedText: parsedGeminiFeedback.correctedText?.substring(0, 100) + "..."
      });
      throw new Error(`Failed to analyze text structure: ${error.message}`);
    }

    // Calculate metrics with validation
    let metrics;
    try {
      console.log("Calculating metrics...");
      metrics = calculateTextMetrics(
        blocks,
        parsedGeminiFeedback.errorAnalysis || "",
        parsedGeminiFeedback.assessment || ""
      );
      console.log("Metrics calculated successfully:", Object.keys(metrics));
    } catch (error) {
      console.error("Metrics calculation error:", error);
      // Try fallback metrics calculation
      metrics = {
        grammarScore: 70,
        vocabularyScore: 70,
        styleConsistencyScore: 70,
        sentenceVarietyScore: 70,
        issuesByType: {},
        issuesBySeverity: {},
        grammarSubcategories: {},
        professorFeedback: "Analysis completed with limited metrics."
      };
    }

    // Calculate overall score with enhanced fallback
    let overallScore = 0;
    try {
      overallScore = calculateOverallScore(metrics);
      
      if (parsedGeminiFeedback.estimatedIELTSBand) {
        const adjustedScore = Math.round((parsedGeminiFeedback.estimatedIELTSBand / 9) * 100);
        overallScore = Math.round((overallScore * 0.2) + (adjustedScore * 0.8));
      }
      console.log("Score calculated:", { overallScore, ieltsEstimate: parsedGeminiFeedback.estimatedIELTSBand });
    } catch (error) {
      console.error("Score calculation error:", error);
      overallScore = calculateFallbackScore(blocks, metrics);
    }

    // Return complete analysis result with null instead of undefined for ieltsEstimate
    return {
      blocks,
      metrics: {
        ...metrics,
        ieltsEstimate: parsedGeminiFeedback.estimatedIELTSBand || null, // Changed from undefined to null
        professorFeedback: geminiFeedback || "Analysis completed with limited feedback.",
      },
      overallScore,
      ieltsFeedback: parsedGeminiFeedback.fullFeedback || generateFallbackFeedback(blocks, metrics),
    };

  } catch (error) {
    // Enhanced error logging
    console.error("Text analysis failed:", {
      error: error.message,
      stack: error.stack,
      textLength: text?.length,
      textSample: text?.substring(0, 100) + "..."
    });
    
    // Return a fallback result with null values instead of undefined
    return {
      blocks: [],
      metrics: {
        grammarScore: 70,
        vocabularyScore: 70,
        styleConsistencyScore: 70,
        sentenceVarietyScore: 70,
        issuesByType: {},
        issuesBySeverity: {},
        grammarSubcategories: {},
        ieltsEstimate: null,
        professorFeedback: "Analysis failed: " + error.message
      },
      overallScore: 70,
      ieltsFeedback: "Analysis could not be completed."
    };
  }
};

// Fallback scoring method if primary scoring fails
const calculateFallbackScore = (blocks: TextBlock[], metrics: TextMetrics): number => {
  try {
    const text = blocks.map(b => b.text).join(' ');
    const wordCount = text.split(/\s+/).length;
    const errorCount = blocks.reduce((count, block) => 
      count + (block.issues?.length || 0), 0);
    
    // Basic score calculation
    let score = 70; // Start with baseline
    
    // Deduct points for errors
    score -= Math.min(30, errorCount * 2);
    
    // Adjust for text length
    if (wordCount < 150) score -= 10;
    if (wordCount > 350) score -= 5;
    
    return Math.max(40, Math.min(100, score));
  } catch (error) {
    console.error("Fallback scoring error:", error);
    return 50; // Ultimate fallback
  }
};

// Generate basic feedback if main feedback generation fails
const generateFallbackFeedback = (blocks: TextBlock[], metrics: TextMetrics): string => {
  try {
    const issues = blocks.flatMap(block => block.issues || []);
    const grammarIssues = issues.filter(i => i.type === 'grammar');
    const vocabularyIssues = issues.filter(i => i.type === 'vocabulary');
    
    let feedback = "## Writing Assessment\n\n";
    
    // Basic feedback based on issues found
    if (grammarIssues.length > 0) {
      feedback += "**Grammar**: Some grammatical improvements needed. ";
      feedback += `Found ${grammarIssues.length} grammar-related issues.\n\n`;
    }
    
    if (vocabularyIssues.length > 0) {
      feedback += "**Vocabulary**: Consider expanding vocabulary range. ";
      feedback += `Found ${vocabularyIssues.length} vocabulary-related suggestions.\n\n`;
    }
    
    return feedback;
  } catch (error) {
    console.error("Fallback feedback generation error:", error);
    return "Analysis completed. Detailed feedback unavailable.";
  }
};

// Create text blocks with analysis
const createTextBlocks = (originalText: string, correctedText: string): TextBlock[] => {
  if (!originalText.trim()) {
    return [];
  }
  
  // Split text into paragraphs/blocks with better paragraph detection
  const originalBlocks = originalText.split(/\n(?:\s*\n)+/)
    .filter(block => block.trim().length > 0)
    .map(block => block.trim());
  
  // Split corrected text if available with the same logic
  let correctedBlocks: string[] = [];
  if (correctedText) {
    correctedBlocks = correctedText.split(/\n(?:\s*\n)+/)
      .filter(block => block.trim().length > 0)
      .map(block => block.trim());
      
    // If corrected blocks are different in number than original,
    // use a more sophisticated matching algorithm
    if (correctedBlocks.length !== originalBlocks.length) {
      correctedBlocks = matchBlocksToOriginal(originalBlocks, correctedText);
    }
  }
  
  // Create blocks with more selective issue detection 
  return originalBlocks.map((block, index) => {
    const blockId = `block-${index}`;
    
    // Get corrected block, handling array bounds
    const correctedBlock = index < correctedBlocks.length ? correctedBlocks[index] : "";
    
    return createTextBlock(blockId, block, correctedBlock);
  });
};

// Match corrected text blocks to original blocks using similarity
const matchBlocksToOriginal = (originalBlocks: string[], correctedText: string): string[] => {
  // If there's just one original block, return the entire corrected text
  if (originalBlocks.length === 1) {
    return [correctedText.trim()];
  }
  
  const correctedBlocks: string[] = Array(originalBlocks.length).fill("");
  
  // Try to match each original block to a portion of the corrected text
  for (let i = 0; i < originalBlocks.length; i++) {
    const originalBlock = originalBlocks[i];
    
    // Look for similar content in the corrected text
    let bestMatch = "";
    let bestSimilarity = 0;
    
    // Split corrected text into potential blocks
    const potentialMatches = correctedText.split(/\n(?:\s*\n)+/);
    
    for (const potential of potentialMatches) {
      const similarity = calculateSimilarity(originalBlock, potential);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = potential;
      }
    }
    
    // Only use match if it's reasonably similar
    if (bestSimilarity > 0.4) {
      correctedBlocks[i] = bestMatch;
    }
  }
  
  return correctedBlocks;
};

// Calculate similarity between two text blocks (0-1)
const calculateSimilarity = (text1: string, text2: string): number => {
  const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 0);
  const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 0);
  
  // Count matching words
  const wordSet1 = new Set(words1);
  const wordSet2 = new Set(words2);
  let matches = 0;
  
  for (const word of wordSet1) {
    if (wordSet2.has(word)) {
      matches++;
    }
  }
  
  // Calculate Jaccard similarity
  const union = wordSet1.size + wordSet2.size - matches;
  return union > 0 ? matches / union : 0;
};

// Create a text block with enhanced error detection
const createTextBlock = (id: string, text: string, correctedText: string): TextBlock => {
  // Generate issues only if there's a corrected version different from the original
  const issues: TextIssue[] = [];
  
  if (correctedText && correctedText !== text) {
    // More selective issue detection - focus on significant differences
    detectSignificantIssues(text, correctedText, issues, id);
  }

  return {
    id,
    text,
    corrected: correctedText || undefined,
    issues: issues.length > 0 ? issues : undefined
  };
};

// Helper to detect significant issues by comparing original and corrected text
const detectSignificantIssues = (originalText: string, correctedText: string, issues: TextIssue[], blockId: string) => {
  // Compare texts by words to identify meaningful changes (using a more robust tokenization approach)
  const originalWords = originalText.split(/(\s+|[.,!?;:"'()\[\]{}])/).filter(token => token.trim());
  const correctedWords = correctedText.split(/(\s+|[.,!?;:"'()\[\]{}])/).filter(token => token.trim());
  
  // Find a reasonable number of changes, don't mark every small difference
  let maxIssuesToFind = Math.min(5, Math.ceil(originalWords.length / 15)); // ~1 issue per 15 words max
  let foundIssues = 0;
  
  // Track current position in the original text
  let currentPos = 0;
  
  // Find significant multi-word differences using a sliding window approach
  for (let i = 0; i < originalWords.length && foundIssues < maxIssuesToFind; i++) {
    // Skip whitespace and punctuation-only tokens
    if (!originalWords[i].trim() || /^[.,!?;:"'()\[\]{}]$/.test(originalWords[i])) continue;
    
    // Find matching position in original text
    const wordPos = originalText.indexOf(originalWords[i], currentPos);
    if (wordPos < 0) continue; // Shouldn't happen, but just in case
    
    // Look for significant multi-word differences
    if (i < originalWords.length - 2 && i < correctedWords.length - 2) {
      const originalPhrase = originalWords.slice(i, i + 3).join("");
      const correctedPhrase = correctedWords.slice(i, i + 3).join("");
      
      // If phrases differ significantly
      if (originalPhrase !== correctedPhrase && 
          !areMinorVariants(originalPhrase, correctedPhrase) &&
          levenshteinDistance(originalPhrase, correctedPhrase) > 2) {
        
        // Find the actual phrase in the original text
        const phraseInText = originalText.substring(wordPos, 
                              originalText.indexOf(originalWords[i + 2], wordPos) + originalWords[i + 2].length);
        
        // Find corresponding corrected phrase
        const correctedPhraseInText = correctedWords.slice(i, i + 3).join(" ");
        
        // Add the issue
        issues.push({
          id: `issue-${blockId}-${issues.length}`,
          type: determineIssueType(phraseInText, correctedPhraseInText),
          severity: "minor", // Adjust severity based on how much they differ
          original: phraseInText,
          suggestion: correctedPhraseInText,
          explanation: generateExplanation(determineIssueType(phraseInText, correctedPhraseInText), 
                                          phraseInText, correctedPhraseInText),
          startIndex: wordPos,
          endIndex: wordPos + phraseInText.length
        });
        
        // Update counters
        foundIssues++;
        i += 2; // Skip ahead
        currentPos = wordPos + phraseInText.length;
        continue;
      }
    }
    
    // If we didn't find a multi-word difference, check individual words
    if (i < correctedWords.length && 
        originalWords[i] !== correctedWords[i] && 
        !areMinorVariants(originalWords[i], correctedWords[i]) &&
        levenshteinDistance(originalWords[i], correctedWords[i]) > 1) {
      
      // Add the issue for this word
      issues.push({
        id: `issue-${blockId}-${issues.length}`,
        type: determineIssueType(originalWords[i], correctedWords[i]),
        severity: getSeverityForType(determineIssueType(originalWords[i], correctedWords[i])),
        original: originalWords[i],
        suggestion: correctedWords[i],
        explanation: generateExplanation(determineIssueType(originalWords[i], correctedWords[i]), 
                                        originalWords[i], correctedWords[i]),
        startIndex: wordPos,
        endIndex: wordPos + originalWords[i].length
      });
      
      foundIssues++;
    }
    
    // Update position
    currentPos = wordPos + originalWords[i].length;
  }
  
  // If we found very few issues but the texts are quite different, add a general structure issue
  if (foundIssues < 2 && levenshteinDistance(originalText, correctedText) > originalText.length / 10) {
    issues.push({
      id: `issue-structure-${blockId}`,
      type: "clarity",
      severity: "suggestion",
      original: originalText,
      suggestion: correctedText,
      explanation: "Consider restructuring this paragraph for better clarity or flow.",
      startIndex: 0,
      endIndex: originalText.length
    });
  }
};

// Calculate Levenshtein distance between two strings (helper function for comparing text similarity)
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
};

// Helper to check if two words are just minor variants (capitalization, plural/singular)
const areMinorVariants = (word1: string, word2: string): boolean => {
  // Check for capitalization differences
  if (word1.toLowerCase() === word2.toLowerCase()) return true;
  
  // Check for common plural forms
  if (word1.toLowerCase() + 's' === word2.toLowerCase() || 
      word1.toLowerCase() === word2.toLowerCase() + 's') return true;
  
  // Check for very similar words (1 character difference)
  if (Math.abs(word1.length - word2.length) <= 1 && 
      (word1.includes(word2) || word2.includes(word1))) return true;
      
  return false;
};

// Determine the type of issue based on word comparison
const determineIssueType = (original: string, corrected: string): IssueType => {
  // Check for punctuation issues
  if (original.match(/[.,!?;:]/) || corrected.match(/[.,!?;:]/)) {
    return "punctuation";
  }
  
  // Check for spelling (similar words)
  const similarStartLength = getSimilarStartLength(original.toLowerCase(), corrected.toLowerCase());
  if (similarStartLength > 2 && similarStartLength > original.length / 2) {
    return "spelling";
  }
  
  // Check for missing/extra words (completely different length)
  if (Math.abs(original.length - corrected.length) > original.length / 2) {
    return "clarity";
  }
  
  // Check for vocabulary issues (completely different words)
  if (levenshteinDistance(original.toLowerCase(), corrected.toLowerCase()) > Math.min(original.length, corrected.length) / 2) {
    return "vocabulary";
  }
  
  // Check for style issues
  if (original.length > 5 && corrected.length > 5 && 
      similarStartLength >= 3 && 
      original.toLowerCase() !== corrected.toLowerCase()) {
    return "style";
  }
  
  // Default to grammar for other cases
  return "grammar";
};

// Helper to find length of similar start of two strings
const getSimilarStartLength = (str1: string, str2: string): number => {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
    i++;
  }
  return i;
};

// Generate explanation for the issue
const generateExplanation = (type: IssueType, original: string, suggestion: string): string => {
  switch (type) {
    case 'grammar':
      return `Grammatical error: "${original}" should be "${suggestion}".`;
    case 'spelling':
      return `Spelling error: "${original}" should be "${suggestion}".`;
    case 'punctuation':
      return `Punctuation error: "${original}" should be "${suggestion}".`;
    case 'clarity':
      return `Clarity issue: Replace "${original}" with "${suggestion}" for better readability.`;
    case 'style':
      return `Style improvement: Replace "${original}" with "${suggestion}".`;
    case 'vocabulary':
      return `Vocabulary: Replace "${original}" with the more precise "${suggestion}".`;
    default:
      return `Correction: "${original}" → "${suggestion}".`;
  }
};

// Determine severity based on issue type with stricter criteria
const getSeverityForType = (type: IssueType): IssueSeverity => {
  switch (type) {
    case 'grammar':
      return 'critical'; // Upgraded from major to critical
    case 'spelling':
      return 'major'; // Upgraded from minor to major
    case 'punctuation':
      return 'major'; // Upgraded from minor to major
    case 'clarity':
      return 'critical'; // Upgraded from major to critical
    case 'style':
      return 'major'; // Upgraded from suggestion to major
    case 'vocabulary':
      return 'major'; // Upgraded from minor to major
    default:
      return 'major';
  }
};

// Calculate text metrics based on the analysis and feedback
const calculateTextMetrics = (
  blocks: TextBlock[], 
  errorAnalysis: string, 
  assessment: string
): TextMetrics => {
  const allIssues = blocks.flatMap(block => block.issues || []);
  
  // Enhanced issue tracking
  const issuesByType: Record<IssueType, number> = {
    grammar: 0,
    spelling: 0,
    punctuation: 0,
    style: 0,
    clarity: 0,
    vocabulary: 0
  };
  
  // Track subcategories for grammar issues
  const grammarSubcategories: Record<string, number> = {
    'subject-verb': 0,
    'verb-tense': 0,
    'articles': 0,
    'prepositions': 0,
    'word-order': 0,
    'modals': 0
  };

  allIssues.forEach(issue => {
    issuesByType[issue.type] += 1;
    
    // Detailed grammar analysis
    if (issue.type === 'grammar') {
      const subCategory = determineGrammarSubcategory(issue);
      if (subCategory) {
        grammarSubcategories[subCategory] += 1;
      }
    }
  });

  // Calculate text statistics
  const text = blocks.map(b => b.text).join(' ');
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).length;
  
  // Enhanced metrics calculation
  return {
    readabilityScore: calculateEnhancedReadabilityScore(blocks, wordCount, sentenceCount),
    grammarScore: calculateDetailedGrammarScore(grammarSubcategories, wordCount),
    clarityScore: calculateClarityScore(blocks, issuesByType.clarity),
    vocabularyScore: calculateVocabularyScore(blocks, issuesByType.vocabulary),
    styleConsistencyScore: calculateStyleScore(blocks, issuesByType.style),
    sentenceVarietyScore: calculateSentenceVarietyScore(blocks, assessment),
    issuesByType,
    issuesBySeverity: calculateIssueSeverity(allIssues),
    grammarSubcategories,
    professorFeedback: ""
  };
};

const determineGrammarSubcategory = (issue: TextIssue): string | null => {
  const original = issue.original.toLowerCase();
  const suggestion = issue.suggestion.toLowerCase();
  
  // Enhanced grammar pattern recognition
  if (original.endsWith('s') !== suggestion.endsWith('s')) {
    return 'subject-verb';
  }
  if (/ed|ing/.test(original) !== /ed|ing/.test(suggestion)) {
    return 'verb-tense';
  }
  if (/(a|an|the)/.test(original) !== /(a|an|the)/.test(suggestion)) {
    return 'articles';
  }
  if (/in|on|at|to|for|with|by/.test(original) !== /in|on|at|to|for|with|by/.test(suggestion)) {
    return 'prepositions';
  }
  // Add more patterns

  return null;
};

// Calculate metric score with improved balancing
const calculateScoreForMetric = (
  issues: number, 
  textLength: number, 
  weight: number,
  mentionedInErrors: boolean,
  mentionedPositively: boolean,
  baselineScore: number
): number => {
  // Prevent division by zero and ensure minimum text length
  const effectiveLength = Math.max(textLength, 100);
  
  // More aggressive penalty for issues based on text length
  const issueDensity = (issues / effectiveLength) * 1000; // Issues per 1000 characters
  
  // Base score calculation with stricter scaling
  let score = baselineScore - Math.min(40, (issueDensity * weight));
  
  // More significant adjustments based on feedback
  if (mentionedInErrors) {
    score = Math.max(30, score - 15);
  }
  
  if (mentionedPositively) {
    score = Math.min(90, score + 8); // Cap positive adjustments lower
  }
  
  // Small random variation for natural results
  const randomFactor = Math.random() * 2 - 1; // -1 to +1
  
  return Math.max(30, Math.min(95, Math.round(score + randomFactor)));
};

// Calculate readability score
const calculateReadabilityScore = (
  grammarIssues: number, 
  clarityIssues: number, 
  punctuationIssues: number,
  textLength: number,
  assessment: string,
  baselineScore: number
): number => {
  const effectiveLength = Math.max(textLength, 100);
  
  // Calculate issue density per 1000 characters
  const issueDensity = ((grammarIssues * 2 + clarityIssues * 1.5 + punctuationIssues) / effectiveLength) * 1000;
  
  // More aggressive base readability calculation
  const baseReadability = Math.max(40, 
    baselineScore - Math.min(35, issueDensity * 2.5)
  );
  
  let adjustedScore = baseReadability;
  const assessmentLower = assessment.toLowerCase();
  
  // More nuanced assessment adjustments
  if (assessmentLower.includes("excellent") || assessmentLower.includes("outstanding")) {
    adjustedScore += 10;
  } else if (assessmentLower.includes("good") || assessmentLower.includes("well")) {
    adjustedScore += 5;
  } else if (assessmentLower.includes("average") || assessmentLower.includes("fair")) {
    adjustedScore -= 5;
  } else if (assessmentLower.includes("poor") || assessmentLower.includes("weak")) {
    adjustedScore -= 10;
  }
  
  // Additional penalties for specific issues
  if (assessmentLower.includes("difficult to follow")) adjustedScore -= 12;
  if (assessmentLower.includes("confusing")) adjustedScore -= 15;
  if (assessmentLower.includes("incoherent")) adjustedScore -= 20;
  
  // Cap maximum score more strictly
  return Math.max(30, Math.min(92, Math.round(adjustedScore)));
};

// Calculate sentence variety score
const calculateSentenceVarietyScore = (
  blocks: TextBlock[], 
  assessment: string,
  baselineScore: number
): number => {
  const allText = blocks.map(block => block.text).join(" ");
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length < 3) {
    return Math.max(40, baselineScore - 20); // Larger penalty for very short texts
  }
  
  // Calculate sentence length statistics
  const lengths = sentences.map(s => s.trim().length);
  const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
  const stdDev = Math.sqrt(
    lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length
  );
  
  // Score based on length variation (standard deviation)
  let varietyScore = baselineScore;
  
  // Penalize both too little and too much variation
  if (stdDev < 10) {
    varietyScore -= 15; // Too monotonous
  } else if (stdDev > 40) {
    varietyScore -= 10; // Too erratic
  } else if (stdDev >= 15 && stdDev <= 30) {
    varietyScore += 5; // Ideal range
  }
  
  // Analyze sentence beginnings
  const beginnings = sentences.map(s => s.trim().split(' ')[0].toLowerCase());
  const uniqueBeginnings = new Set(beginnings).size;
  const beginningVariety = uniqueBeginnings / sentences.length;
  
  if (beginningVariety < 0.4) varietyScore -= 10; // Too repetitive starts
  if (beginningVariety > 0.7) varietyScore += 5; // Good variety
  
  // Assessment-based adjustments
  const assessmentLower = assessment.toLowerCase();
  if (assessmentLower.includes("monotonous") || assessmentLower.includes("repetitive")) {
    varietyScore -= 15;
  }
  if (assessmentLower.includes("varied") || assessmentLower.includes("diverse")) {
    varietyScore = Math.min(90, varietyScore + 8);
  }
  
  return Math.max(30, Math.min(90, Math.round(varietyScore)));
};

// Calculate overall score from metrics with more weight on critical aspects
const calculateOverallScore = (metrics: TextMetrics): number => {
  // More balanced weighting system
  const weights = {
    grammar: 0.25,      // Critical for accuracy
    clarity: 0.25,      // Essential for communication
    readability: 0.20,  // Important for flow
    vocabulary: 0.15,   // Word choice importance
    style: 0.15        // Writing style consistency
  };

  const weightedScore = Math.round(
    metrics.grammarScore * weights.grammar +
    metrics.clarityScore * weights.clarity +
    metrics.readabilityScore * weights.readability +
    metrics.vocabularyScore * weights.vocabulary +
    metrics.styleConsistencyScore * weights.style
  );

  // Apply penalties for very low scores in critical areas
  let finalScore = weightedScore;
  if (metrics.grammarScore < 50) {
    finalScore = Math.max(30, finalScore - 15);
  }
  if (metrics.clarityScore < 50) {
    finalScore = Math.max(30, finalScore - 10);
  }

  // Cap maximum score more strictly
  return Math.min(95, Math.max(30, finalScore));
};

// Format a score for display with an appropriate label
export const getScoreLabel = (score: number): { color: string; label: string } => {
  if (score >= 90) return { color: 'text-green-500', label: 'Outstanding' };
  if (score >= 85) return { color: 'text-green-500', label: 'Excellent' };
  if (score >= 80) return { color: 'text-green-400', label: 'Very Good' };
  if (score >= 75) return { color: 'text-green-400', label: 'Good' };
  if (score >= 70) return { color: 'text-yellow-500', label: 'Above Average' };
  if (score >= 65) return { color: 'text-yellow-500', label: 'Satisfactory' };
  if (score >= 60) return { color: 'text-yellow-400', label: 'Fair' };
  if (score >= 50) return { color: 'text-orange-500', label: 'Needs Improvement' };
  if (score >= 40) return { color: 'text-red-400', label: 'Poor' };
  return { color: 'text-red-500', label: 'Very Poor' };
};

// Export corrected text
export const exportCorrectedText = (blocks: TextBlock[]): string => {
  return blocks.map(block => block.corrected || block.text).join('\n\n');
};

// Export analysis report
export const exportAnalysisReport = (
  analysis: TextAnalysisResult, 
  originalText: string
): string => {
  const { blocks, metrics, overallScore, ieltsFeedback } = analysis;
  const scoreLabel = getScoreLabel(overallScore);
  
  // Format date
  const date = new Date().toLocaleString();
  
  // Build the report
  let report = `# Writing Analysis Report\n\n`;
  report += `Generated: ${date}\n\n`;
  report += `## Overall Assessment\n\n`;
  report += `Quality Score: ${overallScore}/100 (${scoreLabel.label})\n\n`;
  
  // Add metrics section
  report += `## Metrics\n\n`;
  report += `* Readability: ${metrics.readabilityScore}/100\n`;
  report += `* Grammar: ${metrics.grammarScore}/100\n`;
  report += `* Clarity: ${metrics.clarityScore}/100\n`;
  report += `* Style Consistency: ${metrics.styleConsistencyScore}/100\n`;
  report += `* Vocabulary Usage: ${metrics.vocabularyScore}/100\n\n`;

  // Add IELTS feedback if available
  if (ieltsFeedback) {
    report += `## Professional IELTS Feedback\n\n${ieltsFeedback}\n\n`;
    
    if (metrics.ieltsEstimate) {
      report += `Estimated IELTS Band: ${metrics.ieltsEstimate}\n\n`;
    }
  }
  
  // Add issues breakdown
  report += `## Issues Summary\n\n`;
  report += `* Critical Issues: ${metrics.issuesBySeverity.critical}\n`;
  report += `* Major Issues: ${metrics.issuesBySeverity.major}\n`;
  report += `* Minor Issues: ${metrics.issuesBySeverity.minor}\n`;
  report += `* Suggestions: ${metrics.issuesBySeverity.suggestion}\n\n`;
  
  // Add details of each issue
  report += `## Detailed Feedback\n\n`;
  
  blocks.forEach((block, index) => {
    if (block.issues && block.issues.length > 0) {
      report += `### Paragraph ${index + 1}\n\n`;
      report += `Original: "${block.text}"\n\n`;
      report += `Corrected: "${block.corrected}"\n\n`;
      
      report += `Issues:\n\n`;
      block.issues.forEach(issue => {
        report += `* ${issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} (${issue.severity}): `;
        report += `"${issue.original}" → "${issue.suggestion}"\n`;
        report += `  * ${issue.explanation}\n\n`;
      });
    }
  });
  
  // Add original and corrected text sections
  report += `## Original Text\n\n${originalText}\n\n`;
  report += `## Corrected Text\n\n${exportCorrectedText(blocks)}\n\n`;
  
  return report;
};

const generateIELTSFeedback = (
  blocks: TextBlock[],
  metrics: TextMetrics,
  overallScore: number
): string => {
  const allIssues = blocks.flatMap(block => block.issues || []);
  const grammarIssues = allIssues.filter(i => i.type === 'grammar');
  const vocabularyIssues = allIssues.filter(i => i.type === 'vocabulary');
  const cohesionIssues = allIssues.filter(i => i.type === 'clarity');

  // Calculate IELTS-specific subscores
  const taskAchievement = Math.min(9, (overallScore / 100) * 9);
  const coherenceCohesion = calculateCoherenceScore(blocks, cohesionIssues);
  const lexicalResource = calculateLexicalScore(blocks, vocabularyIssues);
  const grammaticalRange = calculateGrammaticalScore(blocks, grammarIssues);

  // Generate concise, focused feedback
  let feedback = '## IELTS Writing Assessment\n\n';

  // Task Achievement
  feedback += '**Task Achievement**: ';
  feedback += `${taskAchievement.toFixed(1)} - `;
  feedback += generateTaskAchievementFeedback(taskAchievement, blocks);

  // Coherence and Cohesion
  feedback += '\n\n**Coherence & Cohesion**: ';
  feedback += `${coherenceCohesion.toFixed(1)} - `;
  feedback += generateCoherenceFeedback(coherenceCohesion, cohesionIssues);

  // Lexical Resource
  feedback += '\n\n**Lexical Resource**: ';
  feedback += `${lexicalResource.toFixed(1)} - `;
  feedback += generateLexicalFeedback(lexicalResource, vocabularyIssues);

  // Grammatical Range and Accuracy
  feedback += '\n\n**Grammatical Range**: ';
  feedback += `${grammaticalRange.toFixed(1)} - `;
  feedback += generateGrammaticalFeedback(grammaticalRange, grammarIssues);

  // Key Areas for Improvement
  feedback += '\n\n## Key Areas for Improvement\n';
  const improvements = generateKeyImprovements(allIssues);
  improvements.forEach(imp => {
    feedback += `* ${imp}\n`;
  });

  return feedback;
};

const calculateGrammaticalScore = (blocks: TextBlock[], grammarIssues: TextIssue[]): number => {
  const text = blocks.map(b => b.text).join(' ');
  const wordCount = text.split(/\s+/).length;
  
  // Calculate error density (per 100 words)
  const errorDensity = (grammarIssues.length / wordCount) * 100;
  
  // Analyze grammar complexity
  const complexStructures = countComplexStructures(text);
  const varietyScore = calculateGrammaticalVariety(text);
  
  // More strict scoring for grammar
  let score = 9;
  if (errorDensity > 0.5) score -= 1;
  if (errorDensity > 1) score -= 1.5;
  if (errorDensity > 2) score -= 2;
  if (errorDensity > 3) score -= 2.5;
  
  // Bonus for complex structures
  score += Math.min(1, complexStructures * 0.2);
  
  // Penalty for lack of variety
  if (varietyScore < 0.6) score -= 1;
  
  return Math.max(4, Math.min(9, score));
};

const generateGrammaticalFeedback = (score: number, issues: TextIssue[]): string => {
  const commonErrors = categorizeGrammarErrors(issues);
  let feedback = '';

  if (score >= 8) {
    feedback = 'Uses a wide range of structures with flexibility and accuracy. Minor errors in complex structures only.';
  } else if (score >= 7) {
    feedback = 'Uses a variety of complex structures. Some errors in complex sentences, but meaning clear.';
  } else if (score >= 6) {
    feedback = 'Mix of complex and simple structures. Frequent errors but meaning generally clear.';
  } else {
    feedback = 'Limited range of structures with frequent errors that obscure meaning.';
  }

  // Add specific error patterns
  if (commonErrors.length > 0) {
    feedback += '\nCommon errors include: ' + commonErrors.slice(0, 3).join(', ');
  }

  return feedback;
};

const categorizeGrammarErrors = (issues: TextIssue[]): string[] => {
  const patterns: Record<string, number> = {};
  
  issues.forEach(issue => {
    // Analyze error patterns
    if (issue.original.toLowerCase() !== issue.suggestion.toLowerCase()) {
      if (issue.original.endsWith('s') && !issue.suggestion.endsWith('s')) {
        patterns['subject-verb agreement'] = (patterns['subject-verb agreement'] || 0) + 1;
      }
      if (issue.original.includes('the') !== issue.suggestion.includes('the')) {
        patterns['article usage'] = (patterns['article usage'] || 0) + 1;
      }
      if (/ed|ing/.test(issue.original) !== /ed|ing/.test(issue.suggestion)) {
        patterns['verb tense'] = (patterns['verb tense'] || 0) + 1;
      }
      // Add more pattern recognition here
    }
  });

  return Object.entries(patterns)
    .sort(([,a], [,b]) => b - a)
    .map(([pattern]) => pattern);
};

const generateDetailedIssueExplanation = (issue: TextIssue): string => {
  let explanation = '';
  
  switch (issue.type) {
    case 'grammar':
      explanation = generateGrammarExplanation(issue);
      break;
    case 'vocabulary':
      explanation = generateVocabularyExplanation(issue);
      break;
    case 'clarity':
      explanation = generateClarityExplanation(issue);
      break;
    // Add other cases
  }

  return explanation;
};

const generateGrammarExplanation = (issue: TextIssue): string => {
  const original = issue.original.toLowerCase();
  const suggestion = issue.suggestion.toLowerCase();

  // More detailed grammar explanations
  if (original.endsWith('s') !== suggestion.endsWith('s')) {
    return `Subject-verb agreement error. The verb should ${suggestion.endsWith('s') ? 'match' : 'not match'} the subject's number.`;
  }
  if (/ed|ing/.test(original) !== /ed|ing/.test(suggestion)) {
    return `Incorrect verb tense. Use ${/ed/.test(suggestion) ? 'past tense' : 'present participle'} in this context.`;
  }
  // Add more specific grammar explanations

  return issue.explanation;
};

// Make sure this is exported and at the top of the file
export const calculateEnhancedReadabilityScore = (
  blocks: TextBlock[],
  wordCount: number,
  sentenceCount: number
): number => {
  try {
    const avgWordsPerSentence = wordCount / Math.max(1, sentenceCount);
    let score = 100;
    
    if (avgWordsPerSentence > 25) score -= 10;
    if (avgWordsPerSentence < 8) score -= 5;
    if (blocks.length < 2) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error("Readability calculation error:", error);
    return 70;
  }
};

