import express from "express";

import {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  saveUserAddress,
  deleteUserAddress,
} from "../controllers/user.controller.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";
import userAuth from "../middleware/userAuth.js";

const userRouter = express.Router();

const authRateLimiter = createRateLimiter({
  keyPrefix: "auth",
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Please try again later.",
});

const adminAuthRateLimiter = createRateLimiter({
  keyPrefix: "admin-auth",
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many admin login attempts. Please try again later.",
});

userRouter.post("/register", authRateLimiter, registerUser);
userRouter.post("/login", authRateLimiter, loginUser);
userRouter.post("/admin", adminAuthRateLimiter, adminLogin);
userRouter.get("/profile", userAuth, getUserProfile);
userRouter.patch("/profile", userAuth, updateUserProfile);
userRouter.get("/addresses", userAuth, getUserAddresses);
userRouter.post("/address", userAuth, saveUserAddress);
userRouter.delete("/address/:addressId", userAuth, deleteUserAddress);


export default userRouter ;
