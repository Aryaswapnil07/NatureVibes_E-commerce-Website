import crypto from "crypto";
import jwt from "jsonwebtoken";

const getEnvValue = (value) => (value || "").replace(/"/g, "").trim();

const safeEqual = (left = "", right = "") => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const adminAuth = (req, res, next) => {
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
      issuer: "naturevibes-api",
      audience: "naturevibes-admin",
    });

    const adminEmail = getEnvValue(process.env.ADMIN_EMAIL).toLowerCase();

    const isAdminTokenValid =
      typeof decoded === "object" &&
      decoded?.type === "admin" &&
      decoded?.isAdmin === true &&
      safeEqual(String(decoded?.email || "").toLowerCase(), adminEmail);

    if (!isAdminTokenValid) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login again.",
      });
    }

    req.admin = { email: adminEmail };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

export default adminAuth;
