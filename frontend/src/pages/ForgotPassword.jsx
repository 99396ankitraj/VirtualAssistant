import React, { useState, useContext } from "react";
import bg from "../assets/authBg.png";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";

function ForgotPassword() {
  const { requestPasswordReset } = useContext(userDataContext);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await requestPasswordReset(email);

      navigate("/verify-otp", {
        state: { email: email },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
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
        className="w-[90%] max-w-[500px] h-[400px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]"
      >
        <h2 className="text-3xl font-semibold text-white text-center mb-[20px]">
          Forgot Password
        </h2>

        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <Mail className="absolute top-[18px] left-[20px] text-white w-[25px] h-[25px]" />
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-[50px] py-[10px] text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-w-[150px] h-[60px] mt-[20px] text-black font-semibold bg-white rounded-full text-[19px]"
        >
          {loading ? "Sending..." : "Send OTP"}
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

export default ForgotPassword;
