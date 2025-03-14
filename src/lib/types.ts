export interface TextBlock {
  id: string;
  text: string;
  corrected?: string;
  issues?: TextIssue[];
}

export interface TextIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  original: string;
  suggestion: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

export type IssueType = 
  | 'grammar'
  | 'spelling'
  | 'punctuation'
  | 'style'
  | 'clarity'
  | 'vocabulary';

export type IssueSeverity = 'critical' | 'major' | 'minor' | 'suggestion';

export interface TextAnalysisResult {
  blocks: TextBlock[];
  metrics: TextMetrics;
  overallScore: number;
  ieltsFeedback?: string;
}

export interface TextMetrics {
  readabilityScore: number;
  grammarScore: number;
  clarityScore: number;
  vocabularyScore: number;
  styleConsistencyScore: number;
  sentenceVarietyScore: number;
  issuesByType: Record<IssueType, number>;
  issuesBySeverity: Record<IssueSeverity, number>;
  professorFeedback?: string;
  ieltsEstimate?: number;
}

// Interface for text patterns used in analysis
export interface TextPattern {
  pattern: RegExp;
  replacement: string;
  type: IssueType;
  explanation?: string;
}
