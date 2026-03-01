import jwt from "jsonwebtoken";

const getEnvValue = (value) => (value || "").replace(/"/g, "").trim();

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminEmail = getEnvValue(process.env.ADMIN_EMAIL);
    const adminPassword = getEnvValue(process.env.ADMIN_PASSWORD);

    const isLegacyTokenValid = decoded === `${adminEmail}${adminPassword}`;
    const isObjectTokenValid =
      typeof decoded === "object" &&
      decoded.email === adminEmail &&
      decoded.isAdmin === true;

    if (!isLegacyTokenValid && !isObjectTokenValid) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login again.",
      });
    }

    req.admin = { email: adminEmail };
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default adminAuth;
