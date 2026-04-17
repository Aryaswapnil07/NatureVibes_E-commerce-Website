import jwt from "jsonwebtoken";
import userModel from "../models/User.model.js";

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : "";
    const token = req.headers.token || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login again.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "urbanvibes-api",
      audience: "urbanvibes-client",
    });

    if (!decoded || decoded.type !== "user" || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    const user = await userModel
      .findOne({ _id: decoded.id, isActive: true })
      .select("_id role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    req.userId = String(user._id);
    req.userRole = user.role;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

export default userAuth;
