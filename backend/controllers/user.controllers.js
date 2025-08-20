import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    return res.status(500).json({ message: "Error sending OTP", error });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetOtp !== otp || Date.now() > user.resetOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "10m" });

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await user.save();

    return res.status(200).json({ message: "OTP verified successfully", resetToken });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Error verifying OTP", error });
  }
};


// Resend OTP controller
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your new OTP for password reset is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error resending OTP", error });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!newPassword) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({ message: "Error resetting password", error });
  }
};



// ---------- existing controllers (unchanged) ----------

export const getCurrentUser = async (req, res) => {
  try {
    
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "get current user error" });
  }
};

export const deleteAllHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.history = [];
    await user.save();
    res.json({ message: "All history deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const deleteHistoryItem = async (req, res) => {
  try {
    const userId = req.userId;
    const index = parseInt(req.params.index);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (index < 0 || index >= user.history.length) {
      return res.status(400).json({ message: "Invalid history index" });
    }

    user.history.splice(index, 1);
    await user.save();
    res.json({ message: "History item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;
    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "updateAssistantError user error" });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    user.history.push(command);
    user.save();
    const userName = user.name;
    const assistantName = user.assistantName;
    const result = await geminiResponse(command, assistantName, userName);

    const jsonMatch = result.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      return res.status(400).json({ response: "sorry, i can't understand" });
    }
    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;

    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current date is ${moment().format("YYYY-MM-DD")}`,
        });
      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current time is ${moment().format("hh:mm A")}`,
        });
      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `today is ${moment().format("dddd")}`,
        });
      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `today is ${moment().format("MMMM")}`,
        });
      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "youtube-open":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
      case "watsapp-open":
      case "cricbuzz-open":
      case "Netflix-open":
      case "Netflix-play":
      case "Netflix-search":
      case "Hotstar-open":
      case "Hotstar-play":
      case "Hotstar-search":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });
      default:
        return res.status(400).json({ response: "I didn't understand that command." });
    }
  } catch (error) {
    return res.status(500).json({ response: "ask assistant error" });
  }
};
