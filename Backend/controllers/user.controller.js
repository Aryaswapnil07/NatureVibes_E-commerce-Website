import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/User.model.js";

const getEnvValue = (value) => (value || "").replace(/"/g, "").trim();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const USER_PROJECTION = "_id name email phone role createdAt updatedAt";

const createToken = ({ id, role = "customer" }) => {
  return jwt.sign(
    {
      id,
      role,
      type: "user",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "naturevibes-api",
      audience: "naturevibes-client",
    }
  );
};

const createAdminToken = ({ email }) => {
  return jwt.sign(
    {
      email,
      role: "admin",
      isAdmin: true,
      type: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || "12h",
      issuer: "naturevibes-api",
      audience: "naturevibes-admin",
    }
  );
};

const normalizeEmail = (email = "") => {
  const trimmed = String(email || "").trim();
  if (!trimmed) return "";
  return validator.normalizeEmail(trimmed, { all_lowercase: true }) || "";
};

const formatPhone = (phone = "") => String(phone || "").trim();

const safeEqual = (left = "", right = "") => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel
      .findOne({ email, isActive: true })
      .select("+password _id name email role");

    const invalidCredentialsMessage = "Invalid email or password";

    if (!user) {
      return res.status(401).json({
        success: false,
        message: invalidCredentialsMessage,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: invalidCredentialsMessage,
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = createToken({ id: user._id, role: user.role });

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to login",
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 80 characters",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const strongPassword = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (!strongPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol",
      });
    }

    const existingUser = await userModel.findOne({ email }).select("_id");
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      passwordChangedAt: new Date(),
      role: "customer",
    });

    const token = createToken({ id: user._id, role: user.role });

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to register user",
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const adminEmail = normalizeEmail(getEnvValue(process.env.ADMIN_EMAIL));
    const adminPassword = getEnvValue(process.env.ADMIN_PASSWORD);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const isEmailValid = safeEqual(email, adminEmail);
    const isPasswordValid = safeEqual(password, adminPassword);

    if (!isEmailValid || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = createAdminToken({ email });

    return res.json({
      success: true,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to login as admin",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.userId, isActive: true }).select(
      USER_PROJECTION
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load profile",
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const phone = formatPhone(req.body?.phone);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 80 characters",
      });
    }

    if (phone && !validator.isMobilePhone(phone, "any", { strictMode: false })) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number",
      });
    }

    const updatedUser = await userModel
      .findOneAndUpdate(
        { _id: req.userId, isActive: true },
        {
          name,
          phone,
        },
        { new: true }
      )
      .select(USER_PROJECTION);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update profile",
    });
  }
};

const getUserAddresses = async (req, res) => {
  try {
    const user = await userModel
      .findOne({ _id: req.userId, isActive: true })
      .select("addresses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load addresses",
    });
  }
};

const saveUserAddress = async (req, res) => {
  try {
    const {
      addressId,
      label,
      fullName,
      phone,
      streetAddress,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    const normalizedFullName = String(fullName || "").trim();
    const normalizedPhone = formatPhone(phone);
    const normalizedStreetAddress = String(streetAddress || "").trim();

    if (!normalizedFullName || !normalizedPhone || !normalizedStreetAddress) {
      return res.status(400).json({
        success: false,
        message: "fullName, phone and streetAddress are required",
      });
    }

    if (!validator.isMobilePhone(normalizedPhone, "any", { strictMode: false })) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number",
      });
    }

    const normalizedPincode = String(pincode || "").trim();
    if (normalizedPincode && !/^[a-zA-Z0-9\-\s]{4,10}$/.test(normalizedPincode)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid pincode",
      });
    }

    const user = await userModel.findOne({ _id: req.userId, isActive: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!addressId && user.addresses.length >= 20) {
      return res.status(400).json({
        success: false,
        message: "Maximum 20 addresses are allowed per user",
      });
    }

    const nextAddress = {
      label: String(label || "Home").trim().slice(0, 30),
      fullName: normalizedFullName,
      phone: normalizedPhone,
      streetAddress: normalizedStreetAddress,
      city: String(city || "").trim(),
      state: String(state || "").trim(),
      pincode: normalizedPincode,
      isDefault: isDefault === true || isDefault === "true",
    };

    let targetAddressId = addressId;

    if (addressId) {
      const existingAddress = user.addresses.id(addressId);
      if (!existingAddress) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      Object.assign(existingAddress, nextAddress);
    } else {
      user.addresses.push(nextAddress);
      targetAddressId = user.addresses[user.addresses.length - 1]?._id;
    }

    if (nextAddress.isDefault) {
      user.addresses.forEach((entry) => {
        entry.isDefault = String(entry._id) === String(targetAddressId);
      });
    } else if (user.addresses.length === 1) {
      user.addresses[0].isDefault = true;
    }

    if (
      user.addresses.length > 0 &&
      !user.addresses.some((entry) => entry.isDefault)
    ) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Address saved successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to save address",
    });
  }
};

const deleteUserAddress = async (req, res) => {
  try {
    const addressId = String(req.params?.addressId || "").trim();

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "addressId is required",
      });
    }

    const user = await userModel.findOne({ _id: req.userId, isActive: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingAddress = user.addresses.id(addressId);
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = Boolean(existingAddress.isDefault);
    existingAddress.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Address removed successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to remove address",
    });
  }
};

export {
  adminLogin,
  deleteUserAddress,
  getUserAddresses,
  getUserProfile,
  loginUser,
  registerUser,
  saveUserAddress,
  updateUserProfile,
};
