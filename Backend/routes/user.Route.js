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
import userAuth from "../middleware/userAuth.js";

const userRouter = express.Router();

userRouter.post("/register" ,registerUser)
userRouter.post("/login" , loginUser)
userRouter.post("/admin", adminLogin)
userRouter.get("/profile", userAuth, getUserProfile);
userRouter.patch("/profile", userAuth, updateUserProfile);
userRouter.get("/addresses", userAuth, getUserAddresses);
userRouter.post("/address", userAuth, saveUserAddress);
userRouter.delete("/address/:addressId", userAuth, deleteUserAddress);


export default userRouter ;
