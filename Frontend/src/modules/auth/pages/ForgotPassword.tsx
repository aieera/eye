import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordSchema } from "../schema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";

interface ForgotFormData {
  email: string;
}

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } =
    useForm<ForgotFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotFormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // NOTE: OTP flow is a UI demo only — in production, the server would send
      // the OTP via email and verify it server-side.
      navigate("/auth/verify-otp", { state: { email: data.email } });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — brand wall */}
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

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center bg-card p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-foreground">Forgot password</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            Enter your email to receive a reset code.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset code"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              ← Back to sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
