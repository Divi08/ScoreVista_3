import { TextAnalysisResult, TextBlock, TextIssue, TextMetrics, IssueType, IssueSeverity, TextPattern } from './types';
import { getGeminiFeedback, parseGeminiFeedback } from './geminiApi';

// Function to analyze text and provide feedback
export const analyzeText = async (text: string): Promise<TextAnalysisResult> => {
  // Get feedback from Gemini
  const geminiFeedback = await getGeminiFeedback(text);
  console.log("Generated feedback from Gemini:", geminiFeedback.substring(0, 100) + "...");
  
  // Parse Gemini feedback to get structured data
  const parsedGeminiFeedback = parseGeminiFeedback(geminiFeedback);
  
  // Create text blocks with AI-improved detection
  const blocks = createTextBlocks(text, parsedGeminiFeedback.correctedText || "");
  
  // Generate metrics based on the blocks and Gemini feedback
  const metrics = calculateTextMetrics(blocks, parsedGeminiFeedback.errorAnalysis || "", parsedGeminiFeedback.assessment || "");
  
  // Calculate overall score - give more weight to the IELTS band from Gemini
  let overallScore = calculateOverallScore(metrics);
  
  // If Gemini provided an IELTS band score, adjust our overall score
  if (parsedGeminiFeedback.estimatedIELTSBand) {
    console.log("Estimated IELTS band from Gemini:", parsedGeminiFeedback.estimatedIELTSBand);
    
    // IELTS is 1-9, our score is 0-100, scale accordingly
    const adjustedScore = Math.round((parsedGeminiFeedback.estimatedIELTSBand / 9) * 100);
    
    // Blend our score with the Gemini-derived score (give more weight to Gemini)
    overallScore = Math.round((overallScore * 0.2) + (adjustedScore * 0.8));
    
    console.log("Adjusted overall score:", overallScore);
  }

  return {
    blocks,
    metrics: {
      ...metrics,
      ieltsEstimate: parsedGeminiFeedback.estimatedIELTSBand || undefined,
      professorFeedback: geminiFeedback,
    },
    overallScore,
    ieltsFeedback: parsedGeminiFeedback.fullFeedback,
  };
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
  // Collect all issues
  const allIssues = blocks.flatMap(block => block.issues || []);
  
  // Count issues by type and severity
  const issuesByType: Record<IssueType, number> = {
    grammar: 0,
    spelling: 0,
    punctuation: 0,
    style: 0,
    clarity: 0,
    vocabulary: 0
  };
  
  const issuesBySeverity: Record<IssueSeverity, number> = {
    critical: 0,
    major: 0,
    minor: 0,
    suggestion: 0
  };
  
  allIssues.forEach(issue => {
    issuesByType[issue.type] += 1;
    issuesBySeverity[issue.severity] += 1;
  });
  
  // Calculate total text length
  const totalText = blocks.reduce((acc, block) => acc + block.text.length, 0);
  
  // Calculate baseline scores based on issues found
  const baselineScore = Math.max(50, 100 - (allIssues.length * 5));
  
  // Calculate scores with more balanced logic
  const grammarScore = calculateScoreForMetric(
    issuesByType.grammar, 
    totalText, 
    3.0, 
    errorAnalysis.includes("grammar"), 
    assessment.includes("grammar"),
    baselineScore
  );
  
  const clarityScore = calculateScoreForMetric(
    issuesByType.clarity, 
    totalText, 
    4.0, 
    errorAnalysis.includes("unclear") || errorAnalysis.includes("clarity"), 
    assessment.includes("clear") || assessment.includes("coherent"),
    baselineScore
  );
  
  const vocabularyScore = calculateScoreForMetric(
    issuesByType.vocabulary, 
    totalText, 
    2.5, 
    errorAnalysis.includes("vocabulary") || errorAnalysis.includes("word choice"), 
    assessment.includes("vocabulary") || assessment.includes("lexical"),
    baselineScore
  );
  
  const styleConsistencyScore = calculateScoreForMetric(
    issuesByType.style, 
    totalText, 
    2.0, 
    errorAnalysis.includes("style") || errorAnalysis.includes("formal"), 
    assessment.includes("style") || assessment.includes("consistent"),
    baselineScore
  );
  
  // Readability includes multiple factors
  const readabilityScore = calculateReadabilityScore(
    issuesByType.grammar, 
    issuesByType.clarity, 
    issuesByType.punctuation,
    totalText,
    assessment,
    baselineScore
  );
  
  // Sentence variety based on analysis
  const sentenceVarietyScore = calculateSentenceVarietyScore(blocks, assessment, baselineScore);
  
  return {
    readabilityScore,
    grammarScore,
    clarityScore,
    vocabularyScore,
    styleConsistencyScore,
    sentenceVarietyScore,
    issuesByType,
    issuesBySeverity,
    professorFeedback: "" // This will be filled in by the calling function
  };
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
  
  // Base score calculation with better scaling for text length
  let score = baselineScore - Math.min(30, (issues * weight * 100) / effectiveLength);
  
  // Adjust based on explicit mentions in feedback
  if (mentionedInErrors) {
    score = Math.max(40, score - 10);
  }
  
  if (mentionedPositively) {
    score = Math.min(95, score + 10);
  }
  
  // Add small random factor for natural variation
  const randomFactor = Math.random() * 3 - 1.5; // -1.5 to +1.5
  
  // Ensure minimum score
  return Math.max(40, Math.min(100, Math.round(score + randomFactor)));
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
  // Base readability calculation with minimum floor
  const baseReadability = baselineScore - Math.min(30, (grammarIssues * 2.5 + clarityIssues * 3 + punctuationIssues) * (100 / Math.max(textLength, 100)));
  
  // Adjust based on assessment keywords
  let adjustedScore = baseReadability;
  
  if (assessment.toLowerCase().includes("cohesive") || assessment.toLowerCase().includes("coherent")) {
    adjustedScore += 8;
  }
  
  if (assessment.toLowerCase().includes("clear") || assessment.toLowerCase().includes("well-structured")) {
    adjustedScore += 5;
  }
  
  if (assessment.toLowerCase().includes("difficult to follow") || assessment.toLowerCase().includes("lacks clarity")) {
    adjustedScore -= 10;
  }
  
  if (assessment.toLowerCase().includes("confusing") || assessment.toLowerCase().includes("unclear")) {
    adjustedScore -= 8;
  }
  
  // Ensure minimum score
  return Math.max(40, Math.min(100, Math.round(adjustedScore)));
};

// Calculate sentence variety score
const calculateSentenceVarietyScore = (
  blocks: TextBlock[], 
  assessment: string,
  baselineScore: number
): number => {
  // Get all text
  const allText = blocks.map(block => block.text).join(" ");
  
  // Count sentences by splitting on typical sentence endings
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length < 2) {
    return Math.max(60, baselineScore - 10); // Default score if very few sentences
  }
  
  // Calculate average sentence length and variation
  const avgLength = sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length;
  
  // Calculate variety based on length differences
  const lengthVariation = sentences.reduce((sum, s) => {
    return sum + Math.abs(s.trim().length - avgLength);
  }, 0) / sentences.length;
  
  // More balanced variety score
  let varietyScore = baselineScore + Math.min(15, lengthVariation / 3);
  
  // Adjust based on assessment
  if (assessment.toLowerCase().includes("varied sentence") || assessment.toLowerCase().includes("good variety")) {
    varietyScore += 8;
  }
  
  if (assessment.toLowerCase().includes("repetitive") || assessment.toLowerCase().includes("monotonous")) {
    varietyScore -= 10;
  }
  
  return Math.max(40, Math.min(100, Math.round(varietyScore)));
};

// Calculate overall score from metrics with more weight on critical aspects
const calculateOverallScore = (metrics: TextMetrics): number => {
  return Math.round(
    (
      metrics.readabilityScore * 0.15 +
      metrics.grammarScore * 0.30 + // Increased weight for grammar
      metrics.clarityScore * 0.25 + // Increased weight for clarity
      metrics.styleConsistencyScore * 0.15 +
      metrics.vocabularyScore * 0.15
    )
  );
};

// Format a score for display with an appropriate label
export const getScoreLabel = (score: number): { color: string; label: string } => {
  if (score >= 90) return { color: 'text-green-500', label: 'Excellent' };
  if (score >= 80) return { color: 'text-green-400', label: 'Very Good' };
  if (score >= 70) return { color: 'text-lime-500', label: 'Good' };
  if (score >= 60) return { color: 'text-yellow-500', label: 'Satisfactory' };
  if (score >= 50) return { color: 'text-amber-500', label: 'Needs Improvement' };
  if (score >= 40) return { color: 'text-orange-500', label: 'Poor' };
  return { color: 'text-red-500', label: 'Critical Issues' };
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

