const MAX_VERCEL_UPLOAD_BYTES = 4 * 1024 * 1024;

const formatFileSize = (bytes = 0) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
};

const getSelectedImageFiles = (imageFiles = {}) =>
  Object.values(imageFiles).filter(Boolean);

const getTotalSelectedImageBytes = (imageFiles = {}) =>
  getSelectedImageFiles(imageFiles).reduce(
    (total, file) => total + Number(file?.size || 0),
    0
  );

const validateProductImageUpload = (imageFiles = {}) => {
  const totalBytes = getTotalSelectedImageBytes(imageFiles);

  if (totalBytes <= MAX_VERCEL_UPLOAD_BYTES) {
    return "";
  }

  return `Selected images total ${formatFileSize(
    totalBytes
  )}. Vercel rejects uploads above about 4 MB. Compress or resize the images and try again.`;
};

const getUploadRequestErrorMessage = (
  error,
  fallback = "Unable to submit the product"
) => {
  const message = String(error?.message || "").trim();

  if (
    message === "Failed to fetch" ||
    message === "Load failed" ||
    /network ?error|network request failed/i.test(message)
  ) {
    return "The upload failed before the API could respond. On Vercel this usually means the selected images are too large. Keep the total image upload under 4 MB and try again.";
  }

  return message || fallback;
};

export {
  MAX_VERCEL_UPLOAD_BYTES,
  formatFileSize,
  getTotalSelectedImageBytes,
  getUploadRequestErrorMessage,
  validateProductImageUpload,
};
  