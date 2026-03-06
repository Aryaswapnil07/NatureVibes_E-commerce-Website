import mongoose from "mongoose";
const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    fullName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    streetAddress: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

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
      minlength: 8,
      maxlength: 200,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      match: [/^[0-9+\-\s()]{0,20}$/, "Please enter a valid phone number"],
    },

    // 🛒 Cart
    cartData: {
      type: Object,
      default: {},   // fixed typo
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
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
