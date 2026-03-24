import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Gradient from "@/assets/Gradient.png";
import Logo from "@/assets/Raabytlogo.png";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "admin@gmail.com";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [error, setError] = useState("");

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 4) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 5) {
      setError("Please enter the 5-digit code");
      return;
    }

    // NOTE: OTP verification is a UI stub — in production this would call a backend endpoint.
    // For now, navigate to reset password on any 5-digit code.
    navigate("/auth/reset-password", { state: { email } });
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">

      <img
        src={Gradient}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full max-w-7xl flex items-center justify-between px-20">

        {/* LEFT */}
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

          <h2 className="text-2xl font-bold mb-1">
            Enter verification code
          </h2>

          <p className="text-gray-600 text-sm mb-6">
            We sent a 5-digit code to{" "}
            <span className="text-blue-600">{email}</span>
          </p>

          {/* OTP BOXES */}
          <div className="flex justify-between mb-5">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => (inputs.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-14 h-14 text-center text-xl font-semibold 
                rounded-lg border-2 border-green-400 bg-white
                focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-red-500 mb-3">
              {error}
            </p>
          )}

          <button 
            onClick={handleVerify}
            className="w-full bg-gradient-to-r 
            from-purple-600 to-purple-800 text-white 
            py-3 rounded-lg font-medium"
          >
            Submit OTP
          </button>

          <p className="text-sm text-gray-600 text-center mt-4 cursor-pointer hover:underline">
            Resend OTP
          </p>

        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;