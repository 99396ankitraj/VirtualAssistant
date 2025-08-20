import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

export const userDataContext = createContext();

function UserContext({ children }) {
  const serverUrl = "https://virtualassistant-backend-rmie.onrender.com";
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Existing: Fetch current logged-in user
  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
      setUserData(result.data);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Existing: Send voice/text command to assistant
  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(`${serverUrl}/api/user/asktoassistant`, { command }, { withCredentials: true });
      return result.data;
    } catch (error) {
      console.log(error);
    }
  };

 // 🔹 Request OTP for password reset
const requestPasswordReset = async (email) => {
  try {
    const result = await axios.post(`${serverUrl}/api/user/forgot-password`, { email });
    return result.data; // { message, maskedNumber }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// 🔹 Verify OTP
const verifyOtp = async (email, otp) => {
  try {
    const result = await axios.post(`${serverUrl}/api/user/verify-otp`, {email , otp });
    return result.data; // { message, resetToken }
  } catch (error) {
    throw error;
  }
};

// 🔹 Reset password
const resetPassword = async (resetToken, newPassword) => {
  try {
    const result = await axios.post(`${serverUrl}/api/user/reset-password`, { resetToken, newPassword });
    return result.data; // { message }
  } catch (error) {
    console.log(error);
    throw error;
  }
};


// 🔹 Resend OTP
const resendOtp = async (email) => {
  try {
    const result = await axios.post(`${serverUrl}/api/user/resend-otp`, { email });
    return result.data; // { message }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

  

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
    requestPasswordReset,
    verifyOtp,
    resetPassword,
    resendOtp
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}

export default UserContext;
