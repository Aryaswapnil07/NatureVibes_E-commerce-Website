import fs from "fs";
import mongoose from "mongoose";
import slugify from "slugify";
import { cloudinary } from "../config/cloudinary.js";
import {
  CATALOG_CATEGORIES,
  findCatalogCategory,
  normalizeCategoryKey,
  resolveCatalogCategory,
} from "../constants/catalogCategories.js";
import Product from "../models/Product.model.js";

const imageFields = ["image1", "image2", "image3", "image4"];

const PRODUCT_TYPES = [
  "live_plant",
  "seed",
  "bulb",
  "pot",
  "planter",
  "soil",
  "fertilizer",
  "tool",
  "combo",
  "gift_kit",
  "subscription",
];

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;
const SORTABLE_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "price",
  "stock",
  "name",
  "publishedAt",
]);

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseJSON = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  return fallback;
};

const parseNumber = (value, fallback = undefined) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const sanitizeText = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
};

const normalizeSku = (value) => {
  const nextSku = sanitizeText(value);
  return nextSku ? nextSku.toUpperCase() : "";
};

const parseTags = (value, fallback = []) => {
  if (value === undefined || value === null) return fallback;
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeText(entry))
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const cleanupLocalFile = (filePath = "") => {
  if (!filePath) return;
  if (!fs.existsSync(filePath)) return;
  fs.unlinkSync(filePath);
};

const getObjectIdFromRequest = (req) => {
  const fromParams = sanitizeText(req.params?.productId);
  const fromBody = sanitizeText(req.body?.productId);
  const fromQuery = sanitizeText(req.query?.productId);

  return fromParams || fromBody || fromQuery;
};

const uploadProductImages = async (files, altText) => {
  const uploadedImages = [];
  if (!files) return uploadedImages;

  for (const field of imageFields) {
    const filePath = files[field]?.[0]?.path;
    if (!filePath) continue;

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "products",
      });

      uploadedImages.push({
        url: result.secure_url,
        alt: altText,
        isPrimary: uploadedImages.length === 0,
      });
    } finally {
      cleanupLocalFile(filePath);
    }
  }

  return uploadedImages;
};

const getUniqueSlug = async (name, customSlug, existingProductId = null) => {
  const source = sanitizeText(customSlug) || sanitizeText(name);
  let finalSlug = slugify(source, { lower: true, strict: true });

  if (!finalSlug) {
    finalSlug = `plant-${Date.now()}`;
  }

  const baseSlug = finalSlug;
  let slugCounter = 0;

  while (true) {
    const query = { slug: finalSlug };

    if (existingProductId) {
      query._id = { $ne: existingProductId };
    }

    const duplicate = await Product.findOne(query).select("_id");
    if (!duplicate) break;

    slugCounter += 1;
    finalSlug = `${baseSlug}-${slugCounter}`;
  }

  return finalSlug;
};

const getCategoryPayload = ({ categoryKey, category, productType }) => {
  const matchedCatalogCategory = findCatalogCategory({ categoryKey, category });

  if (matchedCatalogCategory) {
    return {
      categoryKey: matchedCatalogCategory.key,
      category: matchedCatalogCategory.label,
      categorySection: matchedCatalogCategory.section,
    };
  }

  const customCategoryLabel = sanitizeText(category);
  if (customCategoryLabel) {
    const customCategoryKey =
      normalizeCategoryKey(categoryKey) || normalizeCategoryKey(customCategoryLabel);

    return {
      categoryKey: customCategoryKey || "indoor-plants",
      category: customCategoryLabel,
      categorySection: "Other",
    };
  }

  const fallbackCategory = resolveCatalogCategory({ categoryKey, category, productType });
  return {
    categoryKey: fallbackCategory.key,
    category: fallbackCategory.label,
    categorySection: fallbackCategory.section,
  };
};

const normalizeProductForResponse = (product) => {
  const normalizedProduct =
    typeof product?.toObject === "function" ? product.toObject() : { ...product };

  const categoryPayload = getCategoryPayload({
    categoryKey: normalizedProduct.categoryKey,
    category: normalizedProduct.category,
    productType: normalizedProduct.productType,
  });

  return {
    ...normalizedProduct,
    categoryKey: categoryPayload.categoryKey,
    category: categoryPayload.category,
    categorySection: categoryPayload.categorySection,
  };
};

const buildProductPayload = async ({ body, files, existingProduct = null }) => {
  const nextName = sanitizeText(body.name, existingProduct?.name || "");
  const nextDescription = sanitizeText(
    body.description,
    existingProduct?.description || ""
  );
  const nextProductType = sanitizeText(
    body.productType,
    existingProduct?.productType || ""
  );

  if (!nextName || !nextDescription || !nextProductType) {
    throw createHttpError(
      400,
      "Required fields missing (name, description, productType)"
    );
  }

  if (!PRODUCT_TYPES.includes(nextProductType)) {
    throw createHttpError(400, "Invalid productType value");
  }

  const nextPrice = parseNumber(body.price, existingProduct?.price);
  if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
    throw createHttpError(400, "Price must be a valid number greater than 0");
  }

  const nextDiscountedPrice = parseNumber(
    body.discountedPrice,
    existingProduct?.discountedPrice ?? 0
  );
  if (!Number.isFinite(nextDiscountedPrice) || nextDiscountedPrice < 0) {
    throw createHttpError(400, "Discounted price must be a valid positive number");
  }

  if (nextDiscountedPrice > nextPrice) {
    throw createHttpError(400, "Discounted price cannot be greater than price");
  }

  const nextCostPrice = parseNumber(body.costPrice, existingProduct?.costPrice ?? 0);
  if (!Number.isFinite(nextCostPrice) || nextCostPrice < 0) {
    throw createHttpError(400, "Cost price must be a valid positive number");
  }

  const nextTaxPercent = parseNumber(body.taxPercent, existingProduct?.taxPercent ?? 0);
  if (!Number.isFinite(nextTaxPercent) || nextTaxPercent < 0 || nextTaxPercent > 100) {
    throw createHttpError(400, "taxPercent must be a valid number between 0 and 100");
  }

  const nextStock = parseNumber(body.stock, existingProduct?.stock ?? 0);
  if (!Number.isFinite(nextStock) || nextStock < 0) {
    throw createHttpError(400, "Stock must be a valid positive number");
  }

  const categoryPayload = getCategoryPayload({
    categoryKey: body.categoryKey,
    category: body.category,
    productType: nextProductType,
  });

  const nextSlug = await getUniqueSlug(
    nextName,
    body.slug || existingProduct?.slug,
    existingProduct?._id
  );

  const uploadedImages = await uploadProductImages(files, nextName);
  const nextImages =
    uploadedImages.length > 0 ? uploadedImages : existingProduct?.images || [];

  const nextIsPublished = parseBoolean(
    body.isPublished,
    existingProduct?.isPublished ?? false
  );

  return {
    name: nextName,
    slug: nextSlug,
    sku:
      body.sku !== undefined
        ? normalizeSku(body.sku)
        : normalizeSku(existingProduct?.sku),
    brand: sanitizeText(body.brand, existingProduct?.brand || "UrbanVibes"),
    description: nextDescription,
    shortDescription: sanitizeText(
      body.shortDescription,
      existingProduct?.shortDescription || ""
    ),
    productType: nextProductType,
    categoryKey: categoryPayload.categoryKey,
    category: categoryPayload.category,
    subCategory: sanitizeText(body.subCategory, existingProduct?.subCategory || ""),
    tags: parseTags(body.tags, existingProduct?.tags || []),
    price: nextPrice,
    discountedPrice: nextDiscountedPrice,
    costPrice: nextCostPrice,
    taxPercent: nextTaxPercent,
    stock: nextStock,
    isInStock: nextStock > 0,
    images: nextImages,
    plantDetails:
      parseJSON(body.plantDetails) !== undefined
        ? parseJSON(body.plantDetails)
        : existingProduct?.plantDetails,
    careGuide:
      parseJSON(body.careGuide) !== undefined
        ? parseJSON(body.careGuide)
        : existingProduct?.careGuide,
    shipping:
      parseJSON(body.shipping) !== undefined
        ? parseJSON(body.shipping)
        : existingProduct?.shipping,
    isFeatured: parseBoolean(body.isFeatured, existingProduct?.isFeatured ?? false),
    isBestSeller: parseBoolean(
      body.isBestSeller,
      existingProduct?.isBestSeller ?? false
    ),
    isNewArrival: parseBoolean(
      body.isNewArrival,
      existingProduct?.isNewArrival ?? false
    ),
    isTrending: parseBoolean(body.isTrending, existingProduct?.isTrending ?? false),
    seo:
      parseJSON(body.seo) !== undefined ? parseJSON(body.seo) : existingProduct?.seo,
    isPublished: nextIsPublished,
    publishedAt: nextIsPublished
      ? existingProduct?.publishedAt || new Date()
      : null,
    user: body.user || existingProduct?.user,
  };
};

const addProduct = async (req, res) => {
  try {
    const productPayload = await buildProductPayload({
      body: req.body,
      files: req.files,
    });

    const createdProduct = await Product.create(productPayload);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: normalizeProductForResponse(createdProduct),
    });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.sku) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists. Please use a unique SKU value.",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to create product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = getObjectIdFromRequest(req);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid productId is required",
      });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct || existingProduct.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productPayload = await buildProductPayload({
      body: req.body,
      files: req.files,
      existingProduct,
    });

    const updatedProduct = await Product.findByIdAndUpdate(productId, productPayload, {
      new: true,
    });

    return res.json({
      success: true,
      message: "Product updated successfully",
      product: normalizeProductForResponse(updatedProduct),
    });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.sku) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists. Please use a unique SKU value.",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to update product",
    });
  }
};

const listProduct = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE
    );
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };

    if (req.query.publishedOnly === "true") {
      query.isPublished = true;
    }

    if (req.query.categoryKey) {
      query.categoryKey = normalizeCategoryKey(req.query.categoryKey);
    }

    if (req.query.category) {
      query.category = new RegExp(`^${escapeRegex(req.query.category)}$`, "i");
    }

    if (req.query.productType) {
      query.productType = sanitizeText(req.query.productType);
    }

    if (req.query.inStock === "true") {
      query.stock = { $gt: 0 };
    }

    if (req.query.inStock === "false") {
      query.stock = { $lte: 0 };
    }

    if (req.query.isFeatured === "true") {
      query.isFeatured = true;
    }

    if (req.query.isBestSeller === "true") {
      query.isBestSeller = true;
    }

    if (req.query.isNewArrival === "true") {
      query.isNewArrival = true;
    }

    if (req.query.isTrending === "true") {
      query.isTrending = true;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(escapeRegex(req.query.search), "i");
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { tags: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
      ];
    }

    const sortField = SORTABLE_FIELDS.has(String(req.query.sortBy))
      ? String(req.query.sortBy)
      : "createdAt";
    const sortDirection = req.query.sortOrder === "asc" ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const normalizedProducts = products.map(normalizeProductForResponse);

    return res.json({
      success: true,
      count: normalizedProducts.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      products: normalizedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching products",
    });
  }
};

const singleProduct = async (req, res) => {
  try {
    const productId = getObjectIdFromRequest(req);
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid productId is required",
      });
    }

    const query = {
      _id: productId,
      isDeleted: false,
    };

    if (req.query.publishedOnly === "true") {
      query.isPublished = true;
    }

    const product = await Product.findOne(query).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product: normalizeProductForResponse(product),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching product",
    });
  }
};

const removeProduct = async (req, res) => {
  try {
    const productId = getObjectIdFromRequest(req);
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid productId is required",
      });
    }

    const removedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        isDeleted: true,
        isActive: false,
        isPublished: false,
      },
      { new: true }
    );

    if (!removedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      message: "Product removed successfully",
      product: normalizeProductForResponse(removedProduct),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error removing product",
    });
  }
};

const listCatalogCategories = async (req, res) => {
  try {
    const includeEmpty = req.query.includeEmpty === "true";
    const publishedOnly = req.query.publishedOnly !== "false";

    const matchQuery = { isDeleted: false };
    if (publishedOnly) {
      matchQuery.isPublished = true;
    }

    const categoryStats = await Product.aggregate([
      { $match: matchQuery },
      {
        $project: {
          categoryKey: { $ifNull: ["$categoryKey", ""] },
          category: { $ifNull: ["$category", ""] },
        },
      },
      {
        $group: {
          _id: {
            categoryKey: "$categoryKey",
            category: "$category",
          },
          productCount: { $sum: 1 },
        },
      },
    ]);

    const knownCategoryCounts = new Map();
    const customCategories = new Map();

    for (const entry of categoryStats) {
      const rawCategoryKey = normalizeCategoryKey(entry?._id?.categoryKey || "");
      const rawCategory = sanitizeText(entry?._id?.category);
      const productCount = Number(entry?.productCount || 0);

      if (!productCount) continue;

      const knownCategory = findCatalogCategory({
        categoryKey: rawCategoryKey,
        category: rawCategory,
      });

      if (knownCategory) {
        knownCategoryCounts.set(
          knownCategory.key,
          (knownCategoryCounts.get(knownCategory.key) || 0) + productCount
        );
        continue;
      }

      const fallbackKey = rawCategoryKey || normalizeCategoryKey(rawCategory);
      if (!fallbackKey) continue;

      const existingCustomCategory = customCategories.get(fallbackKey);
      if (existingCustomCategory) {
        existingCustomCategory.productCount += productCount;
      } else {
        customCategories.set(fallbackKey, {
          key: fallbackKey,
          label: rawCategory || "Other",
          section: "Other",
          description: "Additional catalog category.",
          order: 9000,
          productCount,
        });
      }
    }

    const knownCategories = CATALOG_CATEGORIES.map((category) => ({
      ...category,
      productCount: knownCategoryCounts.get(category.key) || 0,
    }));

    const visibleKnownCategories = includeEmpty
      ? knownCategories
      : knownCategories.filter((category) => category.productCount > 0);

    const categories = [
      ...visibleKnownCategories,
      ...Array.from(customCategories.values()),
    ].sort(
      (left, right) =>
        Number(left.order || 0) - Number(right.order || 0) ||
        String(left.label || "").localeCompare(String(right.label || ""))
    );

    return res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch categories",
    });
  }
};

export {
  addProduct,
  listCatalogCategories,
  listProduct,
  removeProduct,
  singleProduct,
  updateProduct,
};
