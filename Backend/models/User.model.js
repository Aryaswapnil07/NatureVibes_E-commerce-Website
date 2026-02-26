import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // 🛒 Cart
    cartData: {
      type: Object,
      default: {},   // fixed typo
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    minimize: false,   // ensures empty {} is saved
    timestamps: true,
  }
);

const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;