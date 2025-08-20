import React, { useState, useEffect, useContext } from "react";
import bg from "../assets/authBg.png";
import { userDataContext } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Phone, User, Mail } from "lucide-react";

function VerifyOtp() {
  const { verifyOtp, resendOtp } = useContext(userDataContext);
  const navigate = useNavigate();
  const location = useLocation();

  const { phone, name, message } = location.state || {};
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const otpCode = otp.join("");
      const result = await verifyOtp(email, otpCode);
      localStorage.setItem("resetToken", result.resetToken);
      setSuccess("OTP verified successfully! Redirecting...");
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(email);
      setTimeLeft(300);
      setSuccess("A new OTP has been sent to your registered email.");
    } catch {
      setError("Failed to resend OTP. Try again.");
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-[90%] max-w-[500px] h-[600px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px] py-[20px]"
      >
        <h2 className="text-3xl font-semibold text-white text-center mb-[20px]">
          Verify OTP
        </h2>

        {message && (
          <p className="bg-sky-700 text-white p-2 rounded-md mb-4 text-center text-sm font-medium w-full">
            {message}
          </p>
        )}

        {success && (
          <p className="bg-green-600 text-white p-2 rounded-md mb-4 text-center text-sm font-medium w-full">
            {success}
          </p>
        )}

        <div className="space-y-2 mb-4 text-sm text-gray-300 w-full text-center">
          {name && (
            <p className="flex items-center justify-center gap-2">
              <User size={18} className="text-sky-400" />
              <span>{name}</span>
            </p>
          )}
          {phone && (
            <p className="flex items-center justify-center gap-2">
              <Phone size={18} className="text-sky-400" />
              <span>{phone}</span>
            </p>
          )}
        </div>

        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <Mail className="absolute top-[18px] left-[20px] text-white w-[25px] h-[25px]" />
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[50px] text-white"
            placeholder="Enter your email"
          />
        </div>

        <div className="flex justify-between gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-14 h-14 text-center text-xl font-bold rounded-full bg-[#00000062] border-2 border-white text-white outline-none"
            />
          ))}
        </div>

        {/* Centered Timer */}
        <div className="flex justify-center items-center text-lg text-gray-200 font-semibold mt-4">
          {timeLeft > 0 ? (
            <p>OTP expires in {formatTime(timeLeft)}</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-blue-400 hover:underline font-medium"
            >
              Resend OTP
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-w-[150px] h-[60px] mt-[10px] text-black font-semibold bg-white rounded-full text-[19px]"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {error && (
          <p className="text-red-500 text-[17px] text-center mt-[10px]">
            *{error}
          </p>
        )}
      </form>
    </div>
  );
}

export default VerifyOtp;
