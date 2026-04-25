import { useEffect, useState } from "react";
import { useParams, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { analysisApi, type AnalysisResult, type AnalysisIssue } from "@/lib/api";
import { toast } from "sonner";
import {
  AlertTriangle, CheckCircle, Loader2,
  Filter, ChevronDown, ArrowLeft
} from "lucide-react";

const severityColors: Record<string, string> = {
  Critical: "bg-destructive/20 text-destructive",
  High: "bg-orange-500/20 text-orange-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Low: "bg-accent/20 text-accent",
};

const qualityColors: Record<string, string> = {
  Excellent: "text-accent",
  Good: "text-primary",
  NeedsWork: "text-yellow-400",
  Poor: "text-destructive",
};

const issueTypes = [
  "All", "SolidViolation", "ArchitectureViolation", "PatternMisuse",
  "DryViolation", "KissViolation", "YagniViolation", "AsyncViolation",
  "DiViolation", "Bug", "SecurityIssue", "PerformanceIssue", "BusinessLogicIssue",
  "ServiceInjectionIssue"
];

const severityLevels = ["All", "Critical", "High", "Medium", "Low"];

const AnalysisResultPage = () => {
  const { user } = useAuth();
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [filteredIssues, setFilteredIssues] = useState<AnalysisIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  const collectAllIssues = (r: AnalysisResult): AnalysisIssue[] => [
    ...(r.solidViolations || []),
    ...(r.architectureViolations || []),
    ...(r.patternMisuses || []),
    ...(r.dryViolations || []),
    ...(r.kissViolations || []),
    ...(r.yagniViolations || []),
    ...(r.asyncViolations || []),
    ...(r.diViolations || []),
    ...(r.bugs || []),
    ...(r.securityIssues || []),
    ...(r.performanceIssues || []),
    ...(r.businessLogicIssues || []),
    ...(r.serviceInjectionIssues || []),
  ];

  useEffect(() => {
    if (!user || !sessionId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const stateResult = location.state?.result as AnalysisResult | undefined;

        if (stateResult) {
          if (!cancelled) {
            setResult(stateResult);
            setLoading(false);
          }
          return;
        }

        const data = await analysisApi.getSession(sessionId);

        if (cancelled) return;

        if (data.status === "WaitingForContext") {
          const initial = await analysisApi.getInitialScan(sessionId);

          navigate(`/analysis/${sessionId}/questions`, {
            replace: true,
            state: { questions: initial.questions }
          });
          return;
        }

        setResult(data);
      } catch (err: any) {
        if (!cancelled) {
          toast.error(err?.message || "Failed to load results");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [sessionId, user, location.state, navigate]);

  useEffect(() => {
    if (!result || !sessionId) return;

    const loadFiltered = async () => {
      try {
        const params: Record<string, string> = {};
        if (severityFilter !== "All") params.severity = severityFilter;
        if (typeFilter !== "All") params.issueType = typeFilter;

        if (severityFilter === "All" && typeFilter === "All") {
          setFilteredIssues(collectAllIssues(result));
        } else {
          const issues = await analysisApi.getIssues(sessionId, params);
          setFilteredIssues(issues);
        }
      } catch {
        setFilteredIssues(collectAllIssues(result).filter((i) => {
          if (severityFilter !== "All" && i.severity !== severityFilter) return false;
          if (typeFilter !== "All" && i.issueType !== typeFilter) return false;
          return true;
        }));
      }
    };

    loadFiltered();
  }, [result, severityFilter, typeFilter, sessionId]);

  const totalIssues = result
    ? (result.totalIssuesFound || collectAllIssues(result).length)
    : 0;

  const criticalIssues = result
    ? (result.criticalIssues || collectAllIssues(result).filter(i => i.severity === "Critical").length)
    : 0;

  const highIssues = result
    ? (result.highIssues || collectAllIssues(result).filter(i => i.severity === "High").length)
    : 0;

  const mediumIssues = result
    ? (result.mediumIssues || collectAllIssues(result).filter(i => i.severity === "Medium").length)
    : 0;

  const lowIssues = result
    ? (result.lowIssues || collectAllIssues(result).filter(i => i.severity === "Low").length)
    : 0;

  if (!user) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!result) return <Navigate to="/sessions" replace />;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link to="/sessions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 font-mono">
            <ArrowLeft className="w-4 h-4" /> Back to Sessions
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-mono font-bold mb-1">Analysis Results</h1>
                  <p className="text-xs font-mono text-muted-foreground">Session: {sessionId}</p>
                </div>
                <div className="flex items-center gap-2">
                  {result.overallCodeQuality && (
                    <span className={`text-lg font-mono font-bold ${qualityColors[result.overallCodeQuality] || "text-foreground"}`}>
                      {result.overallCodeQuality}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary">{result.status}</span>
                </div>
              </div>

              {result.executiveSummary && (
                <p className="text-sm text-muted-foreground leading-relaxed">{result.executiveSummary}</p>
              )}

              {result.architectureAssessment && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs font-mono text-primary mb-1">Architecture Assessment</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.architectureAssessment}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Total", value: totalIssues, color: "text-foreground" },
                { label: "Critical", value: criticalIssues, color: "text-destructive" },
                { label: "High", value: highIssues, color: "text-orange-400" },
                { label: "Medium", value: mediumIssues, color: "text-yellow-400" },
                { label: "Low", value: lowIssues, color: "text-accent" },
              ].map((s) => (
                <div key={s.label} className="glass rounded-xl p-4 text-center">
                  <p className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {result.patternCompliance?.length > 0 && (
              <div className="glass rounded-2xl p-6 mb-6">
                <h2 className="font-mono font-bold text-lg mb-4">Pattern Compliance</h2>
                <div className="space-y-3">
                  {result.patternCompliance.map((p) => (
                    <div key={p.pattern} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="text-sm font-mono font-medium">{p.pattern}</p>
                        <p className="text-xs text-muted-foreground">{p.summary}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-mono font-bold ${p.complianceScore >= 80 ? "text-accent" : p.complianceScore >= 50 ? "text-yellow-400" : "text-destructive"}`}>
                          {p.complianceScore}%
                        </p>
                        {p.developerIntended && <span className="text-xs text-primary font-mono">intended</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {result.refactoringPriorities?.length > 0 && (
                <div className="glass rounded-xl p-6">
                  <h2 className="font-mono font-bold text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" /> Refactoring Priorities
                  </h2>
                  <ul className="space-y-2">
                    {result.refactoringPriorities.map((p, i) => (
                      <li key={i} className="text-xs text-muted-foreground font-mono">{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.quickWins?.length > 0 && (
                <div className="glass rounded-xl p-6">
                  <h2 className="font-mono font-bold text-sm mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" /> Quick Wins
                  </h2>
                  <ul className="space-y-2">
                    {result.quickWins.map((w, i) => (
                      <li key={i} className="text-xs text-muted-foreground font-mono">• {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {result.longTermRecommendations?.length > 0 && (
              <div className="glass rounded-xl p-6 mb-6">
                <h2 className="font-mono font-bold text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" /> Long-Term Recommendations
                </h2>
                <ul className="space-y-2">
                  {result.longTermRecommendations.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground font-mono">• {r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                <h2 className="font-mono font-bold text-lg flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" /> Issues
                </h2>
                <div className="flex flex-wrap gap-2">
                  <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary/50">
                    {severityLevels.map((s) => <option key={s} value={s}>{s === "All" ? "All Severity" : s}</option>)}
                  </select>

                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-mono text-xs focus:outline-none focus:border-primary/50">
                    {issueTypes.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
                  </select>
                </div>
              </div>

              {filteredIssues.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 font-mono">No issues found with current filters</p>
              ) : (
                <div className="space-y-3">
                  {filteredIssues.map((issue, idx) => (
                    <div key={idx} className="rounded-lg bg-secondary/50 overflow-hidden">
                      <button onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-xs font-mono px-2 py-1 rounded-full shrink-0 ${severityColors[issue.severity] || "bg-secondary text-muted-foreground"}`}>
                            {issue.severity}
                          </span>
                          <p className="text-sm font-mono font-medium truncate">{issue.title}</p>
                          {issue.lineNumber && <span className="text-xs text-muted-foreground font-mono shrink-0">L{issue.lineNumber}</span>}
                        </div>

                        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expandedIssue === idx ? "rotate-180" : ""}`} />
                      </button>

                      {expandedIssue === idx && (
                        <div className="px-4 pb-4 space-y-3 border-t border-border/50">
                          {issue.description && <p className="text-xs text-muted-foreground font-mono mt-3">{issue.description}</p>}
                          {issue.principleViolated && <p className="text-xs font-mono"><span className="text-primary">Principle:</span> {issue.principleViolated}</p>}
                          {issue.patternViolated && <p className="text-xs font-mono"><span className="text-primary">Pattern:</span> {issue.patternViolated}</p>}
                          {issue.architectureLayerViolated && <p className="text-xs font-mono"><span className="text-primary">Layer:</span> {issue.architectureLayerViolated}</p>}
                          {issue.developerIntent && <p className="text-xs text-muted-foreground font-mono"><span className="text-primary">Intent:</span> {issue.developerIntent}</p>}
                          {issue.contradiction && <p className="text-xs text-muted-foreground font-mono"><span className="text-yellow-400">Contradiction:</span> {issue.contradiction}</p>}
                          {issue.explanation && <p className="text-xs text-muted-foreground font-mono"><span className="text-yellow-400">Why:</span> {issue.explanation}</p>}
                          {issue.suggestedFix && <p className="text-xs text-muted-foreground font-mono"><span className="text-accent">Fix:</span> {issue.suggestedFix}</p>}

                          {issue.codeSnippet && (
                            <div>
                              <p className="text-xs font-mono text-muted-foreground mb-1">Code:</p>
                              <pre className="text-xs font-mono bg-background p-3 rounded-lg overflow-x-auto text-muted-foreground">{issue.codeSnippet}</pre>
                            </div>
                          )}

                          {issue.fixedCode && (
                            <div>
                              <p className="text-xs font-mono text-accent mb-1">Fixed Code:</p>
                              <pre className="text-xs font-mono bg-background p-3 rounded-lg overflow-x-auto text-muted-foreground">{issue.fixedCode}</pre>
                            </div>
                          )}

                          {issue.refactoringSteps && (
                            <div>
                              <p className="text-xs font-mono text-primary mb-1">Refactoring Steps:</p>
                              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{issue.refactoringSteps}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AnalysisResultPage;
