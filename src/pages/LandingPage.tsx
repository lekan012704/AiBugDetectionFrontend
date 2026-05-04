import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bug, Shield, Zap, Code, ArrowRight, Scan, Brain } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Brain, title: "AI-Powered Analysis", desc: "Deep learning models detect complex bugs humans miss" },
  { icon: Scan, title: "Real-Time Scanning", desc: "Continuous monitoring of your ASP.NET codebase" },
  { icon: Shield, title: "Security First", desc: "Identify vulnerabilities before they reach production" },
  { icon: Zap, title: "Lightning Fast", desc: "Get results in seconds, not hours" },
];

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute inset-0 scan-line pointer-events-none" />

      <Navbar />

      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/30 mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
              <span className="text-xs font-mono text-muted-foreground">
                AI-POWERED BUG DETECTION
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-mono font-bold leading-tight mb-6">
              Find Bugs Before
              <br />
              <span className="text-gradient-primary">They Find You</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Harness the power of artificial intelligence to detect, analyze, and fix
              bugs in your ASP.NET applications — automatically.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="group px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm flex items-center gap-2 glow-primary hover:opacity-90 transition-all"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/submit"
                    className="px-8 py-3.5 rounded-lg glass border-primary/30 text-foreground font-mono font-semibold text-sm hover:border-primary/60 transition-all"
                  >
                    Submit Code
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm flex items-center gap-2 glow-primary hover:opacity-90 transition-all"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/login"
                    className="px-8 py-3.5 rounded-lg glass border-primary/30 text-foreground font-mono font-semibold text-sm hover:border-primary/60 transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 glass rounded-2xl p-6 max-w-2xl mx-auto glow-primary"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <span className="ml-2 text-xs font-mono text-muted-foreground">
                BugDetect.AI — Scanning...
              </span>
            </div>

            <pre className="text-left text-xs sm:text-sm font-mono text-muted-foreground overflow-x-auto">
              <code>
{`[SCAN] Analyzing Controllers/UserController.cs
`}<span className="text-destructive">{`[BUG]  Line 42: SQL Injection vulnerability detected
`}</span><span className="text-yellow-400">{`[WARN] Line 87: Unhandled null reference
`}</span><span className="text-accent">{`[FIX]  Suggested: Use parameterized queries
`}</span>{`[SCAN] Analysis complete — 2 issues found`}
              </code>
            </pre>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-mono font-bold text-center mb-14"
          >
            Why <span className="text-primary">BugDetect</span>?
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover:border-primary/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-all">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-mono font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">
              BugDetect © 2026
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-Powered Bug Detection for ASP.NET
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;