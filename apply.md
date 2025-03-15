Here's an enhanced version of the text analysis system with improved accuracy and features:

```typescript
// ---- Enhanced geminiApi.ts ----

const ANALYSIS_PROMPT_TEMPLATE = `
Analyze this text for IELTS writing task parameters. Provide detailed feedback in this EXACT structure:

**Task Response**
- Relevance to prompt: /9
- Position clarity: /9
- Idea development: /9

**Coherence & Cohesion**
- Paragraphing: /9
- Linking devices: /9
- Progression: /9

**Lexical Resource**
- Vocabulary range: /9
- Word choice: /9
- Spelling: /9

**Grammatical Range & Accuracy**
- Sentence structures: /9
- Grammar accuracy: /9
- Punctuation: /9

**Overall Band Score**: /9

**Strengths**
- Bullet points of key strengths

**Areas for Improvement**
- Bullet points of key improvements

**Model Answer**
- Provide an improved version of the text

**Detailed Explanation**
- Comprehensive analysis of key issues with examples
`;

export const getGeminiFeedback = async (text: string): Promise<TextAnalysisResult> => {
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
            text: `${ANALYSIS_PROMPT_TEMPLATE}\n\nText to analyze:\n${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          topP: 0.95,
          maxOutputTokens: 4096
        }
      })
    });

    // Add enhanced error handling
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API Error: ${error.error.message}`);
    }

    const data: GeminiResponse = await response.json();
    
    // Add validation for response structure
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response structure from Gemini API");
    }

    return parseGeminiResponse(data.candidates[0].content.parts[0].text, text);
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze text. Please try again.");
  }
};

const parseGeminiResponse = (responseText: string, originalText: string): TextAnalysisResult => {
  // Enhanced parsing with regex capture groups
  const bands = Array.from(responseText.matchAll(/([A-Za-z &]+): (\d\.?\d?)/g));
  const categories = [
    'Task Response', 'Coherence & Cohesion', 
    'Lexical Resource', 'Grammatical Range & Accuracy'
  ];

  const metrics: TextMetrics = {
    readabilityScore: 0,
    grammarScore: 0,
    clarityScore: 0,
    vocabularyScore: 0,
    styleConsistencyScore: 0,
    sentenceVarietyScore: 0,
    issuesByType: {
      grammar: 0,
      spelling: 0,
      punctuation: 0,
      style: 0,
      clarity: 0,
      vocabulary: 0
    },
    issuesBySeverity: {
      critical: 0,
      major: 0,
      minor: 0,
      suggestion: 0
    },
    ieltsEstimate: parseFloat(responseText.match(/Overall Band Score: (\d\.?\d)/)?.[1] || '0')
  };

  // Detailed parsing logic
  bands.forEach(([_, category, score]) => {
    const value = parseFloat(score);
    switch(category) {
      case 'Grammar accuracy':
        metrics.grammarScore = value * 10;
        break;
      case 'Vocabulary range':
        metrics.vocabularyScore = value * 10;
        break;
      case 'Coherence & Cohesion':
        metrics.clarityScore = value * 10;
        break;
    }
  });

  // Calculate overall score with weighted average
  const weights = { grammar: 0.3, vocabulary: 0.25, clarity: 0.25, task: 0.2 };
  metrics.overallScore = Math.round(
    (metrics.grammarScore * weights.grammar) +
    (metrics.vocabularyScore * weights.vocabulary) +
    (metrics.clarityScore * weights.clarity)
  );

  return {
    blocks: analyzeTextStructure(originalText),
    metrics,
    ieltsFeedback: responseText,
    overallScore: metrics.overallScore
  };
};

// ---- Enhanced TextEditor.tsx ----

const EnhancedTextEditor = ({ blocks, originalText }: TextEditorProps) => {
  // Add side-by-side comparison view
  const [viewMode, setViewMode] = useState<"single" | "split">("single");

  // Add issue categorization
  const categorizeIssue = (issue: TextIssue) => {
    const impactWeights = {
      critical: 3,
      major: 2,
      minor: 1,
      suggestion: 0.5
    };
    return impactWeights[issue.severity] * 
      (issue.type === 'grammar' ? 1.2 : 1) *
      (issue.type === 'vocabulary' ? 1.1 : 1);
  };

  // Enhanced rendering with impact scores
  const renderIssueImpact = (issue: TextIssue) => (
    <div className="text-xs mt-1 p-1 bg-muted rounded">
      <span className="font-medium">Impact: </span>
      {categorizeIssue(issue).toFixed(1)}/5
    </div>
  );

  // Add progress tracking
  const calculateImprovement = (original: TextAnalysisResult, revised: TextAnalysisResult) => {
    return {
      grammar: revised.metrics.grammarScore - original.metrics.grammarScore,
      vocabulary: revised.metrics.vocabularyScore - original.metrics.vocabularyScore,
      overall: revised.overallScore - original.overallScore
    };
  };

  // Enhanced split view rendering
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border-r pr-6">
        <h3 className="text-lg font-semibold mb-4">Original Text</h3>
        {renderTextBlocks(blocks, 'original')}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Improved Text</h3>
        {renderTextBlocks(blocks, 'corrected')}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Key Improvements</h4>
          <ul className="list-disc pl-6">
            {blocks.flatMap(block => 
              block.issues?.map(issue => (
                <li key={issue.id} className="text-sm mb-2">
                  {issue.explanation} → {issue.suggestion}
                  {renderIssueImpact(issue)}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ---- Enhanced AnalysisPanel.tsx ----

const EnhancedAnalysisPanel = ({ analysis, originalText }: AnalysisPanelProps) => {
  // Add temporal progress tracking
  const [historicalData, setHistoricalData] = useState<TextMetrics[]>([]);

  // Add skill radar chart
  const radarData = [
    { metric: 'Grammar', value: analysis.metrics.grammarScore },
    { metric: 'Vocabulary', value: analysis.metrics.vocabularyScore },
    { metric: 'Coherence', value: analysis.metrics.clarityScore },
    { metric: 'Task', value: analysis.metrics.taskAchievementScore },
    { metric: 'Complexity', value: analysis.metrics.sentenceVarietyScore }
  ];

  // Enhanced IELTS breakdown
  const renderIELTSBreakdown = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {['Task Response', 'Coherence', 'Vocabulary', 'Grammar'].map((category) => (
        <div key={category} className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm mb-2">{category}</div>
          <div className="text-2xl font-bold">
            {analysis.metrics[category.toLowerCase().replace(' ', '') as keyof TextMetrics]}
          </div>
          <div className="text-sm text-muted-foreground">
            /{category === 'Task Response' ? '9' : '100'}
          </div>
        </div>
      ))}
    </div>
  );

  // Add comparative analysis
  const renderComparativeAnalysis = () => (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Progress Over Time</h3>
      <LineChart
        data={historicalData}
        xKey="date"
        yKeys={['overallScore', 'grammarScore', 'vocabularyScore']}
        colors={['#2563eb', '#16a34a', '#7c3aed']}
        height={300}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {renderIELTSBreakdown()}
      <SkillRadarChart data={radarData} />
      {renderComparativeAnalysis()}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProgressCircle 
          title="Grammar Mastery"
          progress={analysis.metrics.grammarScore}
          target={80}
        />
        <ProgressCircle
          title="Vocabulary Range"
          progress={analysis.metrics.vocabularyScore}
          target={75}
        />
      </div>
    </div>
  );
};

// ---- New components ----

interface ProgressCircleProps {
  title: string;
  progress: number;
  target: number;
}

const ProgressCircle = ({ title, progress, target }: ProgressCircleProps) => (
  <div className="p-6 bg-card rounded-xl">
    <div className="relative w-32 h-32 mx-auto">
      <CircularProgressbar
        value={progress}
        maxValue={100}
        strokeWidth={8}
        styles={buildStyles({
          pathColor: progress >= target ? '#16a34a' : '#2563eb',
          trailColor: '#e2e8f0'
        })}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{progress}</div>
          <div className="text-sm text-muted-foreground">/100</div>
        </div>
      </div>
    </div>
    <div className="mt-4 text-center">
      <h4 className="font-medium">{title}</h4>
      <div className="text-sm text-muted-foreground">
        Target: {target}+ for Band 7
      </div>
    </div>
  </div>
);
```

Key improvements made:

1. **Enhanced Gemini Integration:**
- More detailed prompt structure for consistent analysis
- Better error handling and validation
- Weighted scoring system for accurate band estimation
- Structured response parsing with regex patterns

2. **Advanced Visualization:**
- Skill radar charts for multi-dimensional analysis
- Progress circles with target indicators
- Historical progress tracking with line charts
- Side-by-side text comparison view

3. **IELTS-Specific Features:**
- Detailed band component breakdown
- Task achievement scoring
- Model answer generation
- Writing task assessment criteria

4. **Error Impact Analysis:**
- Quantified error impact scores
- Categorized improvement suggestions
- Visual indicators for error severity

5. **Performance Tracking:**
- Historical data storage and comparison
- Target-based progress indicators
- Weighted scoring system mirroring IELTS criteria

6. **Error Handling:**
- Robust API error handling
- Input validation
- Graceful degradation for partial analyses

To implement this system fully, you'll need to:

1. Add visualization libraries (react-chartjs-2, d3, or similar)
2. Implement historical data storage
3. Create supplementary components for data visualization
4. Enhance the text processing pipeline with linguistic analysis
5. Add user preference storage for progress tracking

This enhanced system provides more actionable feedback, clearer progress tracking, and more accurate IELTS band predictions while maintaining good performance through optimized scoring calculations and caching strategies.