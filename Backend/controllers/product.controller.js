import Product from "../models/Product.model.js";
import slugify from "slugify";
import fs from "fs";
import { cloudinary } from "../config/cloudinary.js";

const imageFields = ["image1", "image2", "image3", "image4"];

// Helper: Parse JSON safely (for form-data)
const parseJSON = (data) => {
  if (!data) return undefined;
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return data;
  }
};

const parseNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
};

const sanitizeText = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
};

const normalizeSku = (value) => {
  const nextSku = sanitizeText(value);
  return nextSku ? nextSku.toUpperCase() : undefined;
};

const uploadProductImages = async (files, altText) => {
  const uploadedImages = [];

  if (!files) return uploadedImages;

  for (const field of imageFields) {
    if (!files[field]) continue;

    const filePath = files[field][0]?.path;
    if (!filePath) continue;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "products",
    });

    uploadedImages.push({
      url: result.secure_url,
      alt: altText,
      isPrimary: uploadedImages.length === 0,
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return uploadedImages;
};

const getUniqueSlug = async (name, customSlug, existingProductId = null) => {
  let finalSlug = customSlug || slugify(name, { lower: true, strict: true });
  if (!finalSlug) return "";

  const slugQuery = { slug: finalSlug };
  if (existingProductId) {
    slugQuery._id = { $ne: existingProductId };
  }

  const existingSlug = await Product.findOne(slugQuery);
  if (existingSlug) {
    finalSlug = `${finalSlug}-${Date.now()}`;
  }

  return finalSlug;
};

// ==============================
// ADD PRODUCT
// POST /api/products/add
// ==============================
const addProduct = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    let {
      name,
      slug,
      sku,
      brand,
      description,
      shortDescription,
      productType,
      category,
      subCategory,
      tags,
      price,
      discountedPrice,
      costPrice,
      taxPercent,
      stock,
      plantDetails,
      careGuide,
      shipping,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isTrending,
      seo,
      isPublished,
      user,
    } = req.body;

    // ======================
    // VALIDATION
    // ======================
    if (!name || !description || !price || !productType) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing (name, description, price, productType)",
      });
    }

    // Convert numbers
    price = parseNumber(price, 0);
    discountedPrice = parseNumber(discountedPrice, 0);
    costPrice = parseNumber(costPrice, 0);
    taxPercent = parseNumber(taxPercent, 0);
    stock = parseNumber(stock, 0);

    if (Number.isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number greater than 0",
      });
    }

    // Parse JSON fields (important for Postman form-data)
    plantDetails = parseJSON(plantDetails);
    careGuide = parseJSON(careGuide);
    shipping = parseJSON(shipping);
    seo = parseJSON(seo);

    // ======================
    // IMAGE UPLOAD → CLOUDINARY
    // ======================
    const images = await uploadProductImages(req.files, name);

    // ======================
    // SLUG
    // ======================
    const finalSlug = await getUniqueSlug(name, slug);

    // ======================
    // CREATE PRODUCT
    // ======================
    const productPayload = {
      name: sanitizeText(name),
      slug: finalSlug,
      sku: normalizeSku(sku),
      brand: sanitizeText(brand),
      description: sanitizeText(description),
      shortDescription: sanitizeText(shortDescription),
      productType: sanitizeText(productType),
      category: sanitizeText(category),
      subCategory: sanitizeText(subCategory),
      tags: tags
        ? String(tags)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      price,
      discountedPrice,
      costPrice,
      taxPercent,
      stock,
      isInStock: stock > 0,
      images,
      plantDetails,
      careGuide,
      shipping,
      isFeatured: parseBoolean(isFeatured, false),
      isBestSeller: parseBoolean(isBestSeller, false),
      isNewArrival: parseBoolean(isNewArrival, false),
      isTrending: parseBoolean(isTrending, false),
      seo,
      isPublished: parseBoolean(isPublished, false),
      publishedAt: parseBoolean(isPublished, false) ? new Date() : null,
    };

    if (user) {
      productPayload.user = user;
    }

    const product = new Product(productPayload);

    const savedProduct = await product.save();

    console.log("Saved to MongoDB:", savedProduct._id);

    res.status(201).json({
      success: true,
      message: "Product saved to MongoDB",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);

    if (error?.code === 11000 && error?.keyPattern?.sku) {
      return res.status(409).json({
        success: false,
        message:
          "SKU already exists. Use a unique SKU value or leave SKU empty.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// UPDATE PRODUCT
// PATCH /api/products/update
// ==============================
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct || existingProduct.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const nextName = req.body.name?.trim() || existingProduct.name;
    const nextDescription = req.body.description || existingProduct.description;
    const nextProductType = req.body.productType || existingProduct.productType;

    if (!nextName || !nextDescription || !nextProductType) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing (name, description, productType)",
      });
    }

    const uploadedImages = await uploadProductImages(req.files, nextName);
    const images = uploadedImages.length > 0 ? uploadedImages : existingProduct.images;

    const nextPrice = parseNumber(req.body.price, existingProduct.price);
    if (Number.isNaN(nextPrice) || nextPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number greater than 0",
      });
    }

    const nextStock = parseNumber(req.body.stock, existingProduct.stock);
    const nextIsPublished = parseBoolean(req.body.isPublished, existingProduct.isPublished);

    const finalSlug = await getUniqueSlug(
      nextName,
      req.body.slug || existingProduct.slug,
      existingProduct._id
    );

    const nextSku =
      req.body.sku !== undefined
        ? normalizeSku(req.body.sku)
        : normalizeSku(existingProduct.sku);

    const updatedPayload = {
      name: sanitizeText(nextName),
      slug: finalSlug,
      sku: nextSku,
      brand: sanitizeText(req.body.brand, existingProduct.brand),
      description: sanitizeText(nextDescription),
      shortDescription: sanitizeText(
        req.body.shortDescription,
        existingProduct.shortDescription
      ),
      productType: sanitizeText(nextProductType),
      category: sanitizeText(req.body.category, existingProduct.category),
      subCategory: sanitizeText(req.body.subCategory, existingProduct.subCategory),
      tags:
        req.body.tags !== undefined
          ? String(req.body.tags)
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : existingProduct.tags,
      price: nextPrice,
      discountedPrice: parseNumber(
        req.body.discountedPrice,
        existingProduct.discountedPrice || 0
      ),
      costPrice: parseNumber(req.body.costPrice, existingProduct.costPrice || 0),
      taxPercent: parseNumber(req.body.taxPercent, existingProduct.taxPercent || 0),
      stock: nextStock,
      isInStock: nextStock > 0,
      images,
      plantDetails: parseJSON(req.body.plantDetails) ?? existingProduct.plantDetails,
      careGuide: parseJSON(req.body.careGuide) ?? existingProduct.careGuide,
      shipping: parseJSON(req.body.shipping) ?? existingProduct.shipping,
      isFeatured: parseBoolean(req.body.isFeatured, existingProduct.isFeatured),
      isBestSeller: parseBoolean(req.body.isBestSeller, existingProduct.isBestSeller),
      isNewArrival: parseBoolean(req.body.isNewArrival, existingProduct.isNewArrival),
      isTrending: parseBoolean(req.body.isTrending, existingProduct.isTrending),
      seo: parseJSON(req.body.seo) ?? existingProduct.seo,
      isPublished: nextIsPublished,
      publishedAt: nextIsPublished
        ? existingProduct.publishedAt || new Date()
        : null,
    };

    if (req.body.user) {
      updatedPayload.user = req.body.user;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedPayload, {
      new: true,
    });

    return res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    if (error?.code === 11000 && error?.keyPattern?.sku) {
      return res.status(409).json({
        success: false,
        message:
          "SKU already exists. Use a unique SKU value or leave SKU empty.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update product",
    });
  }
};

// ==============================
// LIST PRODUCTS
// ==============================
const listProduct = async (req, res) => {
  try {
    const query = { isDeleted: false };
    if (req.query.publishedOnly === "true") {
      query.isPublished = true;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    console.log("Total Products:", products.length);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

// ==============================
// SINGLE PRODUCT
// ==============================
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

// ==============================
// REMOVE PRODUCT
// ==============================
const removeProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    await Product.findByIdAndUpdate(productId, { isDeleted: true });

    console.log("Product deleted:", productId);

    res.json({ success: true, message: "Product removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error removing product" });
  }
};

export {
  addProduct,
  listProduct,
  singleProduct,
  removeProduct,
  updateProduct,
};
