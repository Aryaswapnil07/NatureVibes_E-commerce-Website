import Product from "../models/Product.model.js";
import slugify from "slugify";
import fs from "fs";
import { cloudinary } from "../config/cloudinary.js";

// Helper: Parse JSON safely (for form-data)
const parseJSON = (data) => {
  if (!data) return undefined;
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return data;
  }
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
    if (!name || !description || !price || !productType || !user) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing (name, description, price, productType, user)",
      });
    }

    // Convert numbers
    price = Number(price);
    discountedPrice = Number(discountedPrice) || 0;
    costPrice = Number(costPrice) || 0;
    taxPercent = Number(taxPercent) || 0;
    stock = Number(stock) || 0;

    // Parse JSON fields (important for Postman form-data)
    plantDetails = parseJSON(plantDetails);
    careGuide = parseJSON(careGuide);
    shipping = parseJSON(shipping);
    seo = parseJSON(seo);

    // ======================
    // IMAGE UPLOAD → CLOUDINARY
    // ======================
    let images = [];

    if (req.files) {
      const imageFields = ["image1", "image2", "image3", "image4"];

      for (let field of imageFields) {
        if (req.files[field]) {
          const filePath = req.files[field][0].path;

          const result = await cloudinary.uploader.upload(filePath, {
            folder: "products",
          });

          console.log("Uploaded:", result.secure_url);

          images.push({
            url: result.secure_url,
            alt: name,
            isPrimary: images.length === 0,
          });

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }

    // ======================
    // SLUG
    // ======================
    let finalSlug = slug || slugify(name, { lower: true, strict: true });

    const existingSlug = await Product.findOne({ slug: finalSlug });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    // ======================
    // CREATE PRODUCT
    // ======================
    const product = new Product({
      name,
      slug: finalSlug,
      sku,
      brand,
      description,
      shortDescription,
      productType,
      category,
      subCategory,
      tags: tags ? tags.split(",") : [],
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
      isFeatured: isFeatured === "true",
      isBestSeller: isBestSeller === "true",
      isNewArrival: isNewArrival === "true",
      isTrending: isTrending === "true",
      seo,
      isPublished: isPublished === "true",
      publishedAt: isPublished === "true" ? new Date() : null,
      user,
    });

    const savedProduct = await product.save();

    console.log("Saved to MongoDB:", savedProduct._id);

    res.status(201).json({
      success: true,
      message: "Product saved to MongoDB",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// LIST PRODUCTS
// ==============================
const listProduct = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false }).sort({ createdAt: -1 });

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
};