import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Brain, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { analysisApi, type AnalysisQuestion, type QuestionAnswer } from "@/lib/api";
import { toast } from "sonner";

const QuestionsPage = () => {
  const { user } = useAuth();
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AnalysisQuestion[]>(
    location.state?.questions || []
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (!user || !sessionId) return;

    if (questions.length > 0) return;

    const loadQuestions = async () => {
      setLoadingQuestions(true);

      try {
        const initial = await analysisApi.getInitialScan(sessionId);
        setQuestions(initial.questions || []);

        if (!initial.questions || initial.questions.length === 0) {
          toast.error("No follow-up questions found for this session");
          navigate("/sessions", { replace: true });
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to load questions");
        navigate("/sessions", { replace: true });
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [user, sessionId, questions.length, navigate]);

  if (!user) return <Navigate to="/login" replace />;

  const handleAnswer = (qId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedAnswers: QuestionAnswer[] = questions.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        answer: answers[q.questionId],
        relatedPrinciple: q.relatedPrinciple || "",
      }));

      const result = await analysisApi.deepAnalysis({
        sessionId: sessionId!,
        answers: formattedAnswers,
      });

      toast.success("Deep analysis complete!");

      navigate(`/analysis/${sessionId}`, {
        state: { result },
        replace: true
      });
    } catch (err: any) {
      toast.error(err?.message || "Analysis failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-mono font-bold">AI Questions</h1>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              Our AI detected patterns in your code. Answer these questions for a deeper analysis.
            </p>

            <div className="space-y-5">
              {questions.map((q, idx) => (
                <motion.div
                  key={q.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-mono font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                  </div>

                  {q.relatedPrinciple && (
                    <span className="inline-block mb-3 px-2 py-0.5 rounded text-xs font-mono bg-primary/10 text-primary">
                      {q.relatedPrinciple}
                    </span>
                  )}

                  {q.context && (
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      {q.context}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {(q.options?.length ? q.options : ["Yes", "No"]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(q.questionId, opt)}
                        className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                          answers[q.questionId] === opt
                            ? "bg-primary text-primary-foreground glow-primary"
                            : "bg-secondary text-secondary-foreground hover:border-primary/30 border border-border"
                        }`}
                      >
                        {answers[q.questionId] === opt && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || questions.length === 0 || Object.keys(answers).length < questions.length}
                className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm glow-primary hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {isSubmitting ? "Analyzing..." : "Run Deep Analysis"}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default QuestionsPage;
