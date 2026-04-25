import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { analysisApi, type Session } from "@/lib/api";
import { toast } from "sonner";
import { Clock, Code, Trash2, Loader2, ArrowUpRight, FolderOpen } from "lucide-react";

const statusColors: Record<string, string> = {
  Completed: "bg-accent/20 text-accent",
  InProgress: "bg-primary/20 text-primary",
  Pending: "bg-yellow-500/20 text-yellow-400",
  Failed: "bg-destructive/20 text-destructive",
};

const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) return <Navigate to="/login" replace />;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await analysisApi.getMySessions();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (sessionId: string) => {
    try {
      await analysisApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      toast.success("Session deleted");
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-mono font-bold">My <span className="text-primary">Sessions</span></h1>
                <p className="text-sm text-muted-foreground">Your code analysis history</p>
              </div>
              <Link to="/submit" className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm glow-primary hover:opacity-90 transition-all">
                New Scan
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-mono font-bold text-lg mb-2">No sessions yet</h2>
                <p className="text-sm text-muted-foreground mb-4">Submit your first code for analysis</p>
                <Link to="/submit" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm glow-primary">
                  Submit Code
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, idx) => (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass rounded-xl p-5 hover:border-primary/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Code className="w-5 h-5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-mono font-medium truncate">{session.sessionId}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {session.language && (
                              <span className="text-xs font-mono text-muted-foreground">{session.language}</span>
                            )}
                            {session.submissionType && (
                              <span className="text-xs font-mono text-muted-foreground">• {session.submissionType}</span>
                            )}
                            {session.createdAt && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(session.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.totalIssuesFound !== undefined && (
                          <span className="text-xs font-mono text-muted-foreground">{session.totalIssuesFound} issues</span>
                        )}
                        <span className={`text-xs font-mono px-2 py-1 rounded-full ${statusColors[session.status] || "bg-secondary text-muted-foreground"}`}>
                          {session.status}
                        </span>
                        <Link to={`/analysis/${session.sessionId}`} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(session.sessionId)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SessionsPage;
