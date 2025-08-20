import express from "express";
import {
  askToAssistant,
  getCurrentUser,
  updateAssistant,
  deleteAllHistory,
  deleteHistoryItem,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendOtp,
} from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);
userRouter.post("/asktoassistant", isAuth, askToAssistant);
userRouter.delete("/history", isAuth, deleteAllHistory);
userRouter.delete("/history/:index", isAuth, deleteHistoryItem);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/resend-otp", resendOtp);



export default userRouter;
