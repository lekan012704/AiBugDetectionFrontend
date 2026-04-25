import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Bug, Scan, Shield, Code, ArrowUpRight, Upload, Loader2 } from "lucide-react";
import { analysisApi, type Session } from "@/lib/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        const data = await analysisApi.getMySessions();
        setSessions(data);
      } catch {
        setSessions([]);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [user]);

  const stats = useMemo(() => {
    const scansRun = sessions.length;

    const bugsFound = sessions.reduce(
      (sum, s) => sum + (s.totalIssuesFound ?? 0),
      0
    );

    const fixed = sessions.filter(
      (s) => s.status === "Completed"
    ).length;

    const projects = new Set(
      sessions
        .map((s) => s.fileName || s.gitHubUrl || s.sessionId)
        .filter(Boolean)
    ).size;

    return [
      { label: "Bugs Found", value: bugsFound, icon: Bug, color: "text-destructive" },
      { label: "Scans Run", value: scansRun, icon: Scan, color: "text-primary" },
      { label: "Fixed", value: fixed, icon: Shield, color: "text-accent" },
      { label: "Projects", value: projects, icon: Code, color: "text-yellow-400" },
    ];
  }, [sessions]);

  if (!user) return <Navigate to="/login" replace />;

  const displayName = `${user.firstName} ${user.lastName}`.trim();
  const initial = user.firstName?.charAt(0) || user.email?.charAt(0) || "?";

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center glow-primary shrink-0">
                <span className="text-primary font-mono font-bold text-xl uppercase">{initial}</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-mono font-bold">
                  Welcome back, <span className="text-primary">{displayName}</span>
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Link to="/submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm glow-primary hover:opacity-90 transition-all">
              <Upload className="w-4 h-4" />
              Submit Code for Analysis
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className="glass rounded-xl p-5">
                <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
                <p className="text-2xl font-mono font-bold">
                  {loadingStats ? <Loader2 className="w-5 h-5 animate-spin" /> : s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-8 text-center">
            <Code className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-mono font-bold text-lg mb-2">Ready to detect bugs?</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Submit your ASP.NET code for AI-powered analysis. We'll detect bugs, security issues, and architectural violations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/submit" className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm glow-primary hover:opacity-90 transition-all">
                Submit Code
              </Link>
              <Link to="/sessions" className="px-6 py-2.5 rounded-lg glass text-secondary-foreground font-mono text-sm hover:border-primary/50 transition-all flex items-center gap-1">
                View Sessions <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;