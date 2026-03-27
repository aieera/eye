import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "admin@example.com";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 4) inputs.current[index + 1]?.focus();
  };

  const handleVerify = () => {
    if (otp.join("").length < 5) {
      setError("Please enter the 5-digit code");
      return;
    }
    // NOTE: OTP verification is a UI stub — in production this would call a backend endpoint.
    navigate("/auth/reset-password", { state: { email } });
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
          <h2 className="text-2xl font-semibold text-foreground">Verify your email</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            We sent a 5-digit code to{" "}
            <span className="text-primary font-medium">{email}</span>
          </p>

          <div className="flex justify-between gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => (inputs.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-full aspect-square text-center text-xl font-semibold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            ))}
          </div>

          {error && <p className="text-xs text-destructive mb-3">{error}</p>}

          <button
            onClick={handleVerify}
            className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Verify code
          </button>

          <button
            type="button"
            onClick={() => navigate("/auth/forgot-password")}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center mt-4"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
