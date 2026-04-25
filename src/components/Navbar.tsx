import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Bug, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const initial = user?.firstName?.charAt(0) || user?.email?.charAt(0) || "?";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Bug className="w-5 h-5 text-primary" />
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            Bug<span className="text-primary">Detect</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {user ? (
            <>
              <Link to="/submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono">
                Submit Code
              </Link>
              <Link to="/sessions" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono">
                Sessions
              </Link>
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center transition-all group-hover:border-primary">
                  <span className="text-primary font-mono font-bold text-sm uppercase">{initial}</span>
                </div>
                <span className="text-sm text-secondary-foreground">{displayName}</span>
              </Link>
              <button onClick={handleLogout} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-mono font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all glow-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/50 px-4 py-4 space-y-3">
          <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2 font-mono w-full">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center">
                  <span className="text-primary font-mono font-bold uppercase">{initial}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2 font-mono">Dashboard</Link>
              <Link to="/submit" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2 font-mono">Submit Code</Link>
              <Link to="/sessions" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2 font-mono">Sessions</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2 font-mono">Profile</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left text-sm text-destructive py-2 font-mono">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-secondary-foreground py-2">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-sm font-mono font-semibold text-primary py-2">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
