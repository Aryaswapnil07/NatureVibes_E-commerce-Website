import jwt from "jsonwebtoken";
import userModel from "../models/User.model.js";

const optionalUserAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : "";
    const token = req.headers.token || bearerToken;

    if (!token) {
      req.userId = null;
      req.userRole = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "naturevibes-api",
      audience: "naturevibes-client",
    });

    if (!decoded || decoded.type !== "user" || !decoded.id) {
      req.userId = null;
      req.userRole = null;
      return next();
    }

    const user = await userModel
      .findOne({ _id: decoded.id, isActive: true })
      .select("_id role");

    if (!user) {
      req.userId = null;
      req.userRole = null;
      return next();
    }

    req.userId = String(user._id);
    req.userRole = user.role;
    return next();
  } catch {
    req.userId = null;
    req.userRole = null;
    return next();
  }
};

export default optionalUserAuth;
