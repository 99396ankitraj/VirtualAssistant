import React, { useState } from "react";
import bg from "../assets/authBg.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock } from "lucide-react";


function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const resetToken = localStorage.getItem("resetToken");
    if (!resetToken) {
      setError("Reset token not found. Please verify OTP again.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("https://virtualassistant-backend-rmie.onrender.com/api/user/reset-password", {
        token: resetToken,
        newPassword,
      });

      localStorage.removeItem("resetToken");
      alert("Password reset successful! Please login again.");
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-[90%] max-w-[500px] h-[450px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]"
      >
        <h2 className="text-3xl font-semibold text-white text-center mb-[20px]">
          Reset Password
        </h2>

        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <Lock className="absolute top-[18px] left-[20px] text-white w-[25px] h-[25px]" />
          <input
            type="password"
            placeholder="New password"
            className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[50px] text-white"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <Lock className="absolute top-[18px] left-[20px] text-white w-[25px] h-[25px]" />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[50px] text-white"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-w-[150px] h-[60px] mt-[20px] text-black font-semibold bg-white rounded-full text-[19px]"
        >
          {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
