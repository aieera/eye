import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/app/store";
import { setCredentials } from "@/modules/auth/store/authSlice";
import { setAccessToken, setRefreshToken } from "@/shared/utils/cookies";
import { loginSchema, type LoginFormData } from "../schema/authSchema";
import { useLoginMutation } from "../api/authApi";
import Gradient from "@/assets/Gradation-background.jpg";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@eye.com", password: "password" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      const result = await login(data).unwrap();
      setAccessToken(result.accessToken);
      setRefreshToken(result.refreshToken);
      dispatch(
        setCredentials({ user: result.user, accessToken: result.accessToken })
      );
      navigate("/products");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Art (65% width) */}
      <div className="hidden lg:flex lg:w-[65%] items-center justify-center p-3 bg-white">
        <div className="w-full overflow-hidden rounded-3xl relative">
          <img
            src={Gradient}
            alt="Abstract geometric art"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 p-7">
            <p className="text-5xl font-bold text-gray-800 mt-1">Eye</p>
          </div>
          <div className="absolute bottom-4 left-4 p-7">
            <p className="text-sm font-light text-gray-600">you can easily</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              Get access to your personal hub clarity and productivity
            </p>
          </div>
        </div>
      </div>

      {/* Right - Login (35% width) */}
      <div className="w-[35%] flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Branding */}
          <div className="space-y-2">
            <div className="flex items-start flex-col gap-3 justify-start">
              <div className="w-full rounded-xl bg-white font-bold flex text-4xl items-center  justify-center">
                Login
              </div>
            </div>
            <h1 className="text-3xl mt-4 font-bold tracking-tight text-black">
              Eye
            </h1>

            <p className="text-sm text-black/60">
              Access your tasks, notes, projects, and more any time anywhere -
              and everything following one place.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="admin@eye.com"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-black/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-md p-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full  text-white hover:bg-gray-900/90 font-semibold"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-xs text-black/40 text-center">
              Demo: admin@eye.com / password
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
