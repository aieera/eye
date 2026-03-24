import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Gradient from "@/assets/Gradient.png";
import Logo from "@/assets/Raabytlogo.png";
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
        useForm<ForgotFormData>({
            resolver: zodResolver(forgotPasswordSchema),
        });

    const onSubmit = async (data: ForgotFormData) => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            // NOTE: OTP flow is a UI demo only — in production, the server would send
            // the OTP via email and verify it server-side. Never store real OTPs client-side.
            navigate("/auth/verify-otp", {
                state: { email: data.email },
            });

        }, 1000);
    }

    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">

            {/* Background */}
            <img
                src={Gradient}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 w-full max-w-7xl flex items-center justify-between px-20">

                {/* LEFT SIDE */}
                <div className="text-white max-w-xl flex flex-col items-center text-center space-y-6">
                    <img src={Logo} alt="Logo" className="w-40" />

                    <h1 className="text-5xl font-semibold">
                        Screen Display System
                    </h1>

                    <p className="text-lg text-gray-200">
                        A platform for creating, managing, and publishing content
                        from a centralized interface.
                    </p>
                </div>

                {/* RIGHT CARD */}
                <div className="w-[430px] bg-[#F1F1F1] rounded-2xl 
        shadow-[0_40px_100px_rgba(0,0,0,0.6)] p-10">

                    <h2 className="text-2xl font-bold mb-2">
                        Forgot password
                    </h2>

                    <p className="text-gray-600 text-sm mb-6">
                        Please enter the email associated with your account.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

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
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 
              text-white py-3 rounded-lg font-medium flex justify-center items-center"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Send OTP"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/auth/login")}
                            className="text-sm text-gray-600 hover:underline block mx-auto"
                        >
                            Back to login
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;