import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Gradient from "@/assets/Gradient.png";
import Logo from "@/assets/Raabytlogo.png";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleReset = () => {
    if (!password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Password reset successful");
      navigate("/auth/login");
    }, 1000);
  };

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

          <h2 className="text-2xl font-bold mb-1">
            Reset password
          </h2>

          <p className="text-gray-600 text-sm mb-6">
            Create a new secure password to continue.
          </p>

          {/* NEW PASSWORD */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700">
              New password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 
                bg-white shadow-sm pr-10
                focus:outline-none focus:ring-2 focus:ring-purple-600"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700">
              Confirm password
            </label>

            <div className="relative mt-1">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 
                bg-white shadow-sm pr-10
                focus:outline-none focus:ring-2 focus:ring-purple-600"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 mb-3">
              {error}
            </p>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-gradient-to-r 
            from-purple-600 to-purple-800 text-white 
            py-3 rounded-lg font-medium flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Reset password"
            )}
          </button>

          <button
            onClick={() => navigate("/auth/login")}
            className="text-sm text-gray-600 hover:underline block mx-auto mt-4"
          >
            Back to login
          </button>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;