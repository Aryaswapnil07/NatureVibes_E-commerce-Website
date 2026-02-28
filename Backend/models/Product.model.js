import mongoose from "mongoose";

// ======================
// VARIANT SCHEMA
// ======================
const variantSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    sku: String,
    price: Number,
    discountedPrice: Number,
    stock: { type: Number, default: 0 },
    potSize: String,
    plantHeight: String,
    images: [String],
  },
  { _id: false }
);

// ======================
// REVIEW SCHEMA
// ======================
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ======================
// PRODUCT SCHEMA
// ======================
const productSchema = new mongoose.Schema(
  {
    // BASIC
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    sku: { type: String },
    brand: { type: String, default: "NatureVibes" },

    description: { type: String, required: true },
    shortDescription: String,

    // TYPE
    productType: {
      type: String,
      enum: [
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
      ],
      required: true,
    },

    category: String,
    subCategory: String,
    tags: [String],

    // PRICING
    price: { type: Number, required: true },
    discountedPrice: Number,
    costPrice: Number,
    currency: { type: String, default: "INR" },
    taxPercent: { type: Number, default: 0 },

    // VARIANTS
    hasVariants: { type: Boolean, default: false },
    variants: [variantSchema],

    // INVENTORY
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    soldCount: { type: Number, default: 0 },
    isInStock: { type: Boolean, default: true },

    // MEDIA
    images: [
      {
        url: String,
        alt: String,
        isPrimary: Boolean,
      },
    ],
    videoUrl: String,

    // PLANT DETAILS
    plantDetails: {
      botanicalName: String,
      commonName: String,
      plantType: String,
      lifecycle: String,
      growthRate: { type: String, enum: ["slow", "moderate", "fast"] },
      plantHeight: String,
      potSize: String,
      sunlight: {
        type: String,
        enum: ["low", "medium", "bright indirect", "full sun"],
      },
      watering: { type: String, enum: ["low", "moderate", "high"] },
      difficulty: { type: String, enum: ["easy", "medium", "hard"] },
      airPurifying: Boolean,
      petFriendly: Boolean,
    },

    // CARE
    careGuide: {
      wateringInstructions: String,
      sunlightInstructions: String,
      soilInstructions: String,
      fertilizerInstructions: String,
    },

    // SHIPPING
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      shippingCharges: { type: Number, default: 0 },
      freeShipping: { type: Boolean, default: false },
    },

    // REVIEWS
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: [reviewSchema],

    // MARKETING
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    // ADMIN
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // STATUS
    isActive: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ======================
// INDEXES (for performance)
// ======================
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isPublished: 1 });

// ======================
// PREVENT MODEL OVERWRITE ERROR
// ======================
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;