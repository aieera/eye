import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleReset = () => {
    if (!password || !confirmPassword) { setError("All fields are required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/auth/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-[55%] flex-col items-center justify-center relative bg-[#1e1b4b] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 text-center px-12">
          <h1 className="text-6xl font-bold text-white tracking-tight">Eye</h1>
          <p className="text-lg text-white/60 font-light mt-2">Digital Signage Platform</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-card p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-foreground">Reset password</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-8">Create a new secure password.</p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 pr-9 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 pr-9 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset password"}
            </button>

            <button onClick={() => navigate("/auth/login")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center">
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
