import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { User, Lock, Loader2, Save } from "lucide-react";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const initial = user.firstName?.charAt(0) || user.email?.charAt(0) || "?";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ firstName, lastName, phoneNumber });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) { toast.error("Fill in all fields"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setChangingPw(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Password change failed");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <Navbar />

      <main className="relative pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center glow-primary">
                <span className="text-primary font-mono font-bold text-2xl uppercase">{initial}</span>
              </div>
              <div>
                <h1 className="text-2xl font-mono font-bold">Profile</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="glass rounded-2xl p-6 mb-6">
              <h2 className="font-mono font-bold text-sm mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1.5 block">FIRST NAME</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1.5 block">LAST NAME</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block">PHONE NUMBER</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  placeholder="08012345678" />
              </div>
              <div className="mb-4">
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block">EMAIL</label>
                <input type="email" value={user.email} disabled
                  className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-border text-muted-foreground font-mono text-sm cursor-not-allowed" />
              </div>
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm glow-primary hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            {/* Password Form */}
            <form onSubmit={handleChangePassword} className="glass rounded-2xl p-6">
              <h2 className="font-mono font-bold text-sm mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" /> Change Password
              </h2>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1.5 block">CURRENT PASSWORD</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1.5 block">NEW PASSWORD</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={changingPw}
                className="px-6 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-mono font-semibold text-sm hover:bg-secondary/80 transition-all disabled:opacity-50 flex items-center gap-2 border border-border">
                {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {changingPw ? "Changing..." : "Change Password"}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
