import jwt from "jsonwebtoken";

const optionalUserAuth = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : "";
    const token = req.headers.token || bearerToken;

    if (!token) {
      req.userId = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded?.id || null;
    return next();
  } catch {
    req.userId = null;
    return next();
  }
};

export default optionalUserAuth;
