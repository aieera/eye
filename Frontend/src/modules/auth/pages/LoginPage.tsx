import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/app/store";
import { setCredentials } from "@/modules/auth/store/authSlice";
import { setAccessToken } from "@/shared/utils/cookies";
import { loginSchema, type LoginFormData } from "../schema/authSchema";
import { useLoginMutation } from "../api/authApi";
import Gradient from "@/assets/Gradient.png";
import Logo from "@/assets/Raabytlogo.png";
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

      dispatch(
        setCredentials({
          user: user as any,
          accessToken,
        })
      );

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

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
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">

      {/* Background Image */}
      <img
        src={Gradient}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl flex items-center justify-between px-20">

        {/* LEFT SECTION */}
        <div className="text-white max-w-xl space-y-6 flex flex-col items-center text-center">

          {/* LOGO */}
          <img
            src={Logo}
            alt="Logo"
            className="w-40 object-contain mb-0"
          />

          <h1 className="text-5xl font-semibold tracking-tight">
            Screen Display System
          </h1>

          <p className="text-lg text-gray-200 leading-relaxed">
            A platform for creating, managing, and publishing content
            from a centralized interface.
          </p>

        </div>

        {/* RIGHT LOGIN CARD */}
        <div className="w-[430px] bg-[#F1F1F1] rounded-2xl 
        shadow-[0_40px_100px_rgba(0,0,0,0.6)] p-10">

          <h2 className="text-2xl font-bold mb-1">
            Welcome back
          </h2>

          <p className="text-gray-600 text-sm mb-6">
            Enter your details to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="Input your email"
                className="mt-1 w-full p-3 rounded-lg border border-gray-300 
              bg-white shadow-sm
              focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative mt-1">

                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter password"
                  className="w-full p-3 rounded-lg border border-gray-300 
      bg-white shadow-sm
      focus:outline-none focus:ring-2 focus:ring-purple-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  <Eye size={18} />
                </button>

              </div>

              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" className="accent-purple-600" />
                Remember Me
              </label>

              <button
                type="button"
                onClick={() => navigate("/auth/forgot-password")}
                className="text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={`w-full py-3 rounded-lg font-medium flex justify-center items-center transition-all duration-300
    ${isValid
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
  `}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Login"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
