import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    assistantName: {
      type: String
    },
    assistantImage: {
      type: String
    },
    history: [
      { type: String }
    ],
    resetOtp: {
      type: String,
      default: null
    },
    resetOtpExpiry: {
      type: Date,
      default: null
    },
    resetToken: {
      type: String,
      default: null
    },
    resetTokenExpiry: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
