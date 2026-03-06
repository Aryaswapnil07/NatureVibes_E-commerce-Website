const requestBuckets = new Map();

const getBucketKey = ({ req, keyPrefix = "global" }) => {
  const forwarded = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = String(forwardedIp || req.ip || req.socket?.remoteAddress || "unknown");
  return `${keyPrefix}:${ip}`;
};

const createRateLimiter = ({
  keyPrefix = "global",
  windowMs = 10 * 60 * 1000,
  max = 20,
  message = "Too many requests. Please try again later.",
} = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const bucketKey = getBucketKey({ req, keyPrefix });
    const bucket = requestBuckets.get(bucketKey) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    requestBuckets.set(bucketKey, bucket);

    if (bucket.count > max) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(Math.max(retryAfterSeconds, 1)));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    return next();
  };
};

export { createRateLimiter };
