import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Code, Upload, Github, FileCode, Files, Loader2, ArrowRight, X } from "lucide-react";
import { analysisApi } from "@/lib/api";
import { toast } from "sonner";

type SubmissionType = "Snippet" | "File" | "GitHubUrl" | "MultipleFiles";

const tabs: { type: SubmissionType; label: string; icon: React.ElementType }[] = [
  { type: "Snippet", label: "Code Snippet", icon: Code },
  { type: "File", label: "Single File", icon: FileCode },
  { type: "GitHubUrl", label: "GitHub URL", icon: Github },
  { type: "MultipleFiles", label: "Multiple Files", icon: Files },
];

const SubmitCodePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SubmissionType>("Snippet");
  const [language] = useState("csharp");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [gitHubUrl, setGitHubUrl] = useState("");
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let result;
      switch (activeTab) {
        case "Snippet":
          if (!codeSnippet.trim()) { toast.error("Paste your code snippet"); setIsSubmitting(false); return; }
          result = await analysisApi.submitSnippet(language, codeSnippet);
          break;
        case "File":
          if (!singleFile) { toast.error("Select a file"); setIsSubmitting(false); return; }
          result = await analysisApi.submitFile(language, singleFile);
          break;
        case "GitHubUrl":
          if (!gitHubUrl.trim()) { toast.error("Enter a GitHub URL"); setIsSubmitting(false); return; }
          result = await analysisApi.submitGitHubUrl(language, gitHubUrl);
          break;
        case "MultipleFiles":
          if (multipleFiles.length === 0) { toast.error("Select at least one file"); setIsSubmitting(false); return; }
          result = await analysisApi.submitMultipleFiles(language, multipleFiles);
          break;
      }
      toast.success("Code submitted successfully!");
      navigate(`/analysis/${result!.sessionId}/questions`, { state: { questions: result!.questions } });
    } catch (err: any) {
      toast.error(err?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-mono font-bold mb-2">
              Submit <span className="text-primary">Code</span>
            </h1>
            <p className="text-sm text-muted-foreground mb-8">Choose how you'd like to submit your code for AI analysis</p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-sm transition-all ${
                    activeTab === tab.type
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="glass rounded-2xl p-6">
              {activeTab === "Snippet" && (
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block">PASTE YOUR C# CODE</label>
                  <textarea
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    rows={16}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                    placeholder={`public class UserService\n{\n    private readonly DbContext _context;\n\n    public async Task<User> GetUser(int id)\n    {\n        return _context.Users.Find(id);\n    }\n}`}
                  />
                </div>
              )}

              {activeTab === "File" && (
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block">UPLOAD A .CS FILE</label>
                  <div
                    onClick={() => document.getElementById("single-file-input")?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {singleFile ? "" : "Click to select a file"}
                    </p>
                  </div>
                  <input
                    id="single-file-input"
                    type="file"
                    accept=".cs,.csx"
                    className="hidden"
                    onChange={(e) => setSingleFile(e.target.files?.[0] || null)}
                  />
                  {singleFile && (
                    <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-primary" />
                        <span className="text-sm font-mono text-foreground">{singleFile.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground">{(singleFile.size / 1024).toFixed(1)} KB</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setSingleFile(null); }} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "GitHubUrl" && (
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block">GITHUB FILE URL</label>
                  <input
                    type="url"
                    value={gitHubUrl}
                    onChange={(e) => setGitHubUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="https://github.com/user/repo/blob/main/src/Services/UserService.cs"
                  />
                  <div className="mt-3 text-xs text-muted-foreground space-y-1 font-mono">
                    <p className="text-accent">✅ github.com/user/repo/blob/branch/path/file.cs</p>
                    <p className="text-accent">✅ raw.githubusercontent.com/user/repo/branch/file.cs</p>
                    <p className="text-destructive">❌ Whole repo URLs (not supported)</p>
                    <p className="text-destructive">❌ Private repositories</p>
                  </div>
                </div>
              )}

              {activeTab === "MultipleFiles" && (
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-2 block">UPLOAD MULTIPLE .CS FILES</label>
                  <div
                    onClick={() => document.getElementById("multi-file-input")?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <Files className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {multipleFiles.length > 0
                        ? `${multipleFiles.length} file(s) selected`
                        : "Click to select files"}
                    </p>
                  </div>
                  <input
                    id="multi-file-input"
                    type="file"
                    accept=".cs,.csx"
                    multiple
                    className="hidden"
                    onChange={(e) => setMultipleFiles(Array.from(e.target.files || []))}
                  />
                  {multipleFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {multipleFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-primary" />
                            <span className="text-sm font-mono text-foreground">{f.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</span>
                            <button type="button" onClick={() => setMultipleFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs font-mono text-muted-foreground">
                        Total: {(multipleFiles.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-6 w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm glow-primary hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {isSubmitting ? "Analyzing..." : "Submit for Analysis"}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SubmitCodePage;
