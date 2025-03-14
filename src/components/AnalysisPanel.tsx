
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  LineChart, 
  Brain, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Download,
  ChevronRight,
  ChevronDown,
  GraduationCap
} from "lucide-react";
import { TextAnalysisResult, TextIssue, IssueType } from "@/lib/types";
import { getScoreLabel, exportAnalysisReport } from "@/lib/textAnalysis";
import { toast } from "sonner";
import BarChartComponent from "./BarChartComponent";

interface AnalysisPanelProps {
  analysis: TextAnalysisResult | null;
  originalText: string;
}

const AnalysisPanel = ({ analysis, originalText }: AnalysisPanelProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("metrics");

  if (!analysis) {
    return null;
  }

  const { metrics, overallScore, blocks, ieltsFeedback } = analysis;
  const allIssues = blocks.flatMap(block => block.issues || []);
  
  const scoreLabel = getScoreLabel(overallScore);
  
  const handleDownloadReport = () => {
    const report = exportAnalysisReport(analysis, originalText);
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "writing-analysis-report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Analysis report downloaded");
  };
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderMeters = () => {
    const meters = [
      { name: "Readability", value: metrics.readabilityScore, icon: <LineChart className="w-4 h-4" /> },
      { name: "Grammar", value: metrics.grammarScore, icon: <BarChart className="w-4 h-4" /> },
      { name: "Clarity", value: metrics.clarityScore, icon: <Brain className="w-4 h-4" /> },
      { name: "Style", value: metrics.styleConsistencyScore, icon: <Award className="w-4 h-4" /> },
      { name: "Vocabulary", value: metrics.vocabularyScore, icon: <BarChart className="w-4 h-4" /> },
    ];

    // Prepare data for bar chart
    const chartData = meters.map(meter => ({
      name: meter.name,
      value: meter.value,
      color: getScoreBackground(meter.value)
    }));

    return (
      <div className="space-y-6 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {meters.map((meter, index) => (
            <motion.div 
              key={meter.name}
              className="bg-secondary/50 rounded-lg p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-sm font-medium">
                  {meter.icon}
                  <span className="ml-2">{meter.name}</span>
                </div>
                <span className={`text-sm font-semibold ${getScoreColor(meter.value)}`}>
                  {meter.value}/100
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${getScoreBackground(meter.value)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${meter.value}%` }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        <BarChartComponent 
          data={chartData} 
          title="Quality Metrics"
          xAxisLabel="Metrics"
          yAxisLabel="Score"
          height={220}
        />
      </div>
    );
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-green-400";
    if (score >= 70) return "text-lime-500";  
    if (score >= 60) return "text-yellow-500";
    if (score >= 50) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };
  
  const getScoreBackground = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-green-400";
    if (score >= 70) return "bg-lime-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 50) return "bg-amber-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const renderIssuesByType = () => {
    const issueTypes: { type: IssueType; label: string; icon: JSX.Element }[] = [
      { type: "grammar", label: "Grammar", icon: <AlertCircle className="w-4 h-4 text-yellow-500" /> },
      { type: "spelling", label: "Spelling", icon: <AlertCircle className="w-4 h-4 text-red-500" /> },
      { type: "punctuation", label: "Punctuation", icon: <AlertCircle className="w-4 h-4 text-orange-500" /> },
      { type: "style", label: "Style", icon: <AlertCircle className="w-4 h-4 text-purple-500" /> },
      { type: "clarity", label: "Clarity", icon: <AlertCircle className="w-4 h-4 text-indigo-500" /> },
      { type: "vocabulary", label: "Vocabulary", icon: <AlertCircle className="w-4 h-4 text-green-500" /> },
    ];

    // Prepare data for bar chart
    const chartData = issueTypes.map((item) => ({
      name: item.label,
      value: metrics.issuesByType[item.type],
      color: item.type === "grammar" ? "#EAB308" :
             item.type === "spelling" ? "#EF4444" :
             item.type === "punctuation" ? "#F97316" :
             item.type === "style" ? "#A855F7" :
             item.type === "clarity" ? "#6366F1" : "#22C55E"
    }));

    return (
      <div className="space-y-6 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {issueTypes.map((item) => (
            <div key={item.type} className="flex items-center justify-between p-2 border-b border-border/50">
              <div className="flex items-center">
                {item.icon}
                <span className="text-sm ml-2">{item.label}</span>
              </div>
              <span className="text-sm font-medium">{metrics.issuesByType[item.type]}</span>
            </div>
          ))}
        </div>
        
        <BarChartComponent 
          data={chartData} 
          title="Issues by Type"
          xAxisLabel="Issue Types"
          yAxisLabel="Count"
          height={220}
        />
      </div>
    );
  };

  const renderIssuesList = () => {
    const criticalIssues = allIssues.filter(issue => issue.severity === 'critical');
    const majorIssues = allIssues.filter(issue => issue.severity === 'major');
    const minorIssues = allIssues.filter(issue => issue.severity === 'minor');
    const suggestions = allIssues.filter(issue => issue.severity === 'suggestion');
    
    return (
      <div className="space-y-3 mt-2">
        {renderIssueSection("Critical Issues", criticalIssues, "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300")}
        {renderIssueSection("Major Issues", majorIssues, "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300")}
        {renderIssueSection("Minor Issues", minorIssues, "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300")}
        {renderIssueSection("Suggestions", suggestions, "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300")}
      </div>
    );
  };
  
  const renderIssueSection = (title: string, issues: TextIssue[], colorClass: string) => {
    if (issues.length === 0) return null;
    
    return (
      <div className="rounded-lg border">
        <div className={`p-3 flex justify-between items-center font-medium text-sm rounded-t-lg ${colorClass}`}>
          <span>{title}</span>
          <span>{issues.length}</span>
        </div>
        <div className="p-3 text-sm max-h-40 overflow-y-auto">
          <ul className="space-y-2">
            {issues.map(issue => (
              <li key={issue.id} className="flex items-start gap-2">
                <div className="mt-0.5">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground mb-1">
                    <span className="line-through text-muted-foreground">{issue.original}</span>
                    {" → "}
                    <span className="font-medium">{issue.suggestion}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{issue.explanation}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  const renderIELTSFeedback = () => {
    if (!ieltsFeedback) return null;
    
    // Reformat the IELTS feedback to remove markdown headers and symbols
    const formattedFeedback = ieltsFeedback
      .replace(/##\s+([^\n]+)/g, '$1:') // Replace ## headers with just the text and a colon
      .replace(/\*\*([^\*]+)\*\*/g, '$1:') // Replace **bold** with just the text and a colon
      .replace(/\*/g, '') // Remove all asterisks
      .replace(/#/g, '') // Remove all hashtags
      .split('\n')
      .filter(line => line.trim() !== '')
      .join('\n');
    
    return (
      <div className="mt-2 space-y-3">
        <div className="rounded-lg border overflow-hidden">
          <div className="p-3 flex justify-between items-center font-medium text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-t-lg">
            <span className="flex items-center">
              <GraduationCap className="w-4 h-4 mr-2" />
              Professional IELTS Teacher Feedback
            </span>
          </div>
          <div className="p-4 text-sm max-h-96 overflow-y-auto prose prose-sm dark:prose-invert">
            <div className="whitespace-pre-line">{formattedFeedback}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="rounded-2xl border bg-card shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Brain className="w-5 h-5 text-primary mr-2" />
          <h2 className="font-medium">Analysis Results</h2>
        </div>
        <button
          onClick={handleDownloadReport}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          title="Download full report"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 pb-0">
        <motion.div
          className="bg-gradient-to-br from-secondary/70 to-secondary/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-primary border-r-transparent"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 * (overallScore / 100) }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              ></motion.div>
              <span className={`text-xl font-bold ${scoreLabel.color}`}>{overallScore}</span>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Overall Quality</div>
              <div className={`text-lg font-semibold ${scoreLabel.color}`}>{scoreLabel.label}</div>
              
              {/* IELTS Band Score - Prominently displayed here */}
              {metrics.ieltsEstimate && (
                <div className="flex flex-col mt-1">
                  <div className="text-xs text-muted-foreground">IELTS Band Score</div>
                  <div className="text-lg font-semibold text-purple-500 flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    {metrics.ieltsEstimate.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Issues</div>
              <div className="text-lg font-medium">{allIssues.length}</div>
            </div>
            <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Fixed</div>
              <div className="text-lg font-medium text-green-500">
                {allIssues.length} 
                <CheckCircle2 className="w-4 h-4 ml-1 inline-block" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="p-4">
        {ieltsFeedback && (
          <div>
            <button
              onClick={() => toggleSection("ielts-feedback")}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-left text-foreground font-medium"
            >
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-purple-500" />
                <span>IELTS Professional Feedback</span>
              </div>
              <div>
                {expandedSection === "ielts-feedback" ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </button>
            
            {expandedSection === "ielts-feedback" && renderIELTSFeedback()}
          </div>
        )}
        
        <div>
          <button
            onClick={() => toggleSection("metrics")}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-left text-foreground font-medium"
          >
            <div className="flex items-center">
              <BarChart className="w-4 h-4 mr-2 text-primary" />
              <span>Quality Metrics</span>
            </div>
            <div>
              {expandedSection === "metrics" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>
          
          {expandedSection === "metrics" && renderMeters()}
        </div>
        
        <div>
          <button
            onClick={() => toggleSection("issues-by-type")}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-left text-foreground font-medium"
          >
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-primary" />
              <span>Issues by Type</span>
            </div>
            <div>
              {expandedSection === "issues-by-type" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>
          
          {expandedSection === "issues-by-type" && renderIssuesByType()}
        </div>
        
        <div>
          <button
            onClick={() => toggleSection("issues-list")}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-left text-foreground font-medium"
          >
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-primary" />
              <span>Detailed Issues</span>
            </div>
            <div>
              {expandedSection === "issues-list" ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>
          
          {expandedSection === "issues-list" && renderIssuesList()}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisPanel;
