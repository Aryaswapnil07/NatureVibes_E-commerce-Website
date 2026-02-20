const express = require("express");
const Product = require("../models/Product");
const { protect , admin  } = require("../middleware/authMiddleware");

const router = express.Router();

// @route POST /api/products
// @access Admin

router.post("/", protect, admin ,  async (req, res) => {
  try {
 

    const {
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
      images,
      videoUrl,
      plantDetails,
      careGuide,
      shipping,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isTrending,
      seo,
      isPublished,
    } = req.body;


    const product = new Product({
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
      isInStock: stock > 0,
      images,
      videoUrl,
      plantDetails,
      careGuide,
      shipping,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isTrending,
      seo,
      isPublished,
      publishedAt: isPublished ? Date.now() : null,

      // IMPORTANT
      user: req.user._id,
    });

    const createdProduct = await product.save();

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route PUT /api/products/:id
// @ desc update an existing product ID
//  @access Private/Admin 

router.put("/:id" , protect , admin , async (req  , res) => {
    try {
        
    } catch (error) {
        
        
    }
})

module.exports = router;
