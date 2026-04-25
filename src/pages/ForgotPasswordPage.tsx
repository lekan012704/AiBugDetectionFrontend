import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bug, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Enter your email"); return; }
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success("Reset email sent!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Bug className="w-6 h-6 text-primary" />
          </div>
          <span className="font-mono font-bold text-xl">Bug<span className="text-primary">Detect</span></span>
        </Link>

        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <h1 className="text-2xl font-mono font-bold mb-2">Check Your Email</h1>
              <p className="text-sm text-muted-foreground mb-6">We've sent a password reset link to <span className="text-primary">{email}</span></p>
              <Link to="/login" className="text-sm text-primary hover:underline font-mono">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-mono font-bold text-center mb-1">Forgot Password</h1>
              <p className="text-sm text-muted-foreground text-center mb-6">Enter your email to receive a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1.5 block">EMAIL</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm glow-primary hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <p className="text-sm text-muted-foreground text-center mt-6">
                <Link to="/login" className="text-primary hover:underline font-medium">Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
