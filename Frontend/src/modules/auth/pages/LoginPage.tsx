import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/app/store";
import { setCredentials } from "@/modules/auth/store/authSlice";
import { setAccessToken } from "@/shared/utils/cookies";
import { loginSchema, type LoginFormData } from "../schema/authSchema";
import { useLoginMutation } from "../api/authApi";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (formData: LoginFormData) => {
    try {
      const result = await login(formData).unwrap();
      const { user, accessToken } = result.data;

      setAccessToken(accessToken);
      dispatch(setCredentials({ user: user as any, accessToken }));

      toast({ title: "Login Successful", description: "Welcome back!" });

      if (user.role === "admin") {
        navigate("/screens");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err?.data?.message || "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — brand wall */}
      <div className="hidden md:flex w-[55%] flex-col items-center justify-center relative bg-[#1e1b4b] overflow-hidden">
        {/* Dot grid */}
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
          <div className="flex items-center gap-3 mt-8 justify-center flex-wrap">
            {["Multi-Location", "Real-time Sync", "Oracle Connected"].map((tag) => (
              <span
                key={tag}
                className="border border-white/20 text-white/60 text-xs px-3 py-1.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center bg-card p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your password"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 pr-9 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border accent-primary" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => navigate("/auth/forgot-password")}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Need help? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
