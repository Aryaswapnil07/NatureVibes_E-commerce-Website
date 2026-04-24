import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  CheckCircle,
  IndianRupee,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
} from "lucide-react";
import API_BASE_URL from "../config/api";
import RelatedProducts from "./RelatedProducts";
import "../components/css/ProductInfo.css";
import { createCartProductSnapshot, getProductPriceInfo } from "../utils/productPricing";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumericCurrency = (value) => formatCurrency(value).replace(/[^0-9.,-]/g, "");

const formatLabel = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ProductInfo = ({ onAddToCart, allProducts = [] }) => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackProduct = useMemo(() => {
    if (location.state?.product) {
      return location.state.product;
    }

    return allProducts.find((item) => String(item.id) === String(productId));
  }, [allProducts, location.state, productId]);

  const [productData, setProductData] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const backendProductId = useMemo(() => {
    const fromState = fallbackProduct?.backendId || fallbackProduct?._id || fallbackProduct?.id;
    if (fromState && objectIdRegex.test(String(fromState))) {
      return String(fromState);
    }
    if (productId && objectIdRegex.test(String(productId))) {
      return String(productId);
    }
    return "";
  }, [fallbackProduct, productId]);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setLoadingProduct(true);
      setLoadError("");

      if (!backendProductId) {
        if (isMounted) {
          setProductData(fallbackProduct || null);
          setLoadingProduct(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/products/single`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: backendProductId }),
        });

        const payload = await response.json();
        if (!response.ok || !payload.success || !payload.product) {
          throw new Error(payload.message || "Unable to load product details");
        }

        const primaryImage = payload.product.images?.find((image) => image?.isPrimary)?.url;
        const firstImage = payload.product.images?.[0]?.url;
        const normalizedImage = primaryImage || firstImage || fallbackProduct?.image || "";

        if (isMounted) {
          setProductData({
            ...payload.product,
            id: payload.product._id || fallbackProduct?.id,
            backendId: payload.product._id || fallbackProduct?.backendId || fallbackProduct?.id,
            image: normalizedImage,
          });
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || "Unable to load product details");
          setProductData(fallbackProduct || null);
        }
      } finally {
        if (isMounted) {
          setLoadingProduct(false);
        }
      }
    };

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [backendProductId, fallbackProduct]);

  const product = productData || fallbackProduct;

  const gallery = useMemo(() => {
    if (!product) return [];

    const imageUrlsFromModel = Array.isArray(product.images)
      ? product.images.map((entry) => entry?.url || "").filter(Boolean)
      : [];

    if (imageUrlsFromModel.length > 0) {
      return imageUrlsFromModel;
    }

    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery.filter(Boolean);
    }

    if (product.image) {
      return [product.image];
    }

    return [];
  }, [product]);

  const productIdentity = product?.id || product?._id || backendProductId || "";

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedSize("");
    setQuantity(1);

    if (productIdentity) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [productIdentity]);

  const activeImageIndex =
    selectedImageIndex >= 0 && selectedImageIndex < gallery.length
      ? selectedImageIndex
      : 0;
  const mainImage = gallery[activeImageIndex] || "";
  const priceInfo = useMemo(
    () => getProductPriceInfo(product || {}, selectedSize),
    [product, selectedSize]
  );
  const sizeOptions = priceInfo.variants;

  useEffect(() => {
    if (!sizeOptions.length) {
      if (selectedSize) {
        setSelectedSize("");
      }
      return;
    }

    const nextSize =
      sizeOptions.find((option) => option.size === selectedSize)?.size ||
      sizeOptions.find((option) => option.isInStock)?.size ||
      sizeOptions[0]?.size ||
      "";

    if (nextSize && nextSize !== selectedSize) {
      setSelectedSize(nextSize);
    }
  }, [selectedSize, sizeOptions]);

  const currentPrice = Number(priceInfo.displayPrice || 0);
  const originalPrice = Number(priceInfo.regularPrice || 0);
  const currentPriceText = formatNumericCurrency(currentPrice);
  const hasDiscount =
    Number(priceInfo.discountedPrice || 0) > 0 &&
    Number(priceInfo.discountedPrice || 0) < Number(priceInfo.regularPrice || 0);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(priceInfo.regularPrice) - Number(priceInfo.discountedPrice)) /
          Number(priceInfo.regularPrice)) *
          100
      )
    : 0;
  const stockCount = Number(priceInfo.stock ?? product?.stock ?? 0);
  const inStock = priceInfo.hasVariants
    ? priceInfo.isInStock
    : stockCount > 0 && product?.isInStock !== false;

  useEffect(() => {
    setQuantity((previousQuantity) => Math.min(previousQuantity, Math.max(stockCount, 1)));
  }, [stockCount]);

  const productBadges = [
    product?.isBestSeller ? "Best Seller" : "",
    product?.isNewArrival ? "New Arrival" : "",
    product?.isTrending ? "Trending" : "",
    product?.isFeatured ? "Featured" : "",
  ].filter(Boolean);

  const parsedTags = Array.isArray(product?.tags)
    ? product.tags
    : String(product?.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  const shortDescriptionContent = useMemo(() => {
    const directShortDescription = String(product?.shortDescription || "").trim();
    if (directShortDescription) {
      return directShortDescription;
    }

    const fullDescription = String(product?.description || "").trim();
    if (!fullDescription) {
      return "Carefully selected quality product from UrbanVibes for your home and lifestyle.";
    }

    const firstSentence = fullDescription.split(".")[0]?.trim();
    return firstSentence || fullDescription;
  }, [product?.description, product?.shortDescription]);

  const cartProduct = useMemo(() => {
    if (!product) return null;

    return {
      ...createCartProductSnapshot(product, selectedSize),
      image: mainImage || product.image || "",
      badge: productBadges[0] || "",
    };
  }, [mainImage, product, productBadges, selectedSize]);

  const addSelectedQuantityToCart = () => {
    if (!cartProduct || !onAddToCart || !inStock) return;

    for (let index = 0; index < quantity; index += 1) {
      onAddToCart(cartProduct);
    }
  };

  const handleBuyNow = () => {
    addSelectedQuantityToCart();
    navigate("/checkout");
  };

  if (loadingProduct && !product) {
    return (
      <div className="product-state">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-state">
        <h2>Product not found</h2>
        <p>Please return to catalog and choose another product.</p>
      </div>
    );
  }

  return (
    <>
      <div className="nature-product-page">
        <div className="product-page-shell">
          {loadError ? <p className="load-warning">{loadError}</p> : null}

          <div className="product-breadcrumb">
            <span>Home</span>
            <span>/</span>
            <span>{product.category || "Catalog"}</span>
            <span>/</span>
            <strong>{product.name}</strong>
          </div>

          <div className="product-info-container">
            <div className="gallery-section">
              <div className="gallery-layout-wrapper">
                <div className="thumbnail-list">
                  {gallery.map((image, index) => (
                    <button
                      key={`${product.id || product._id}-thumb-${index}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`thumb-wrapper ${activeImageIndex === index ? "active-thumb" : ""}`}
                    >
                      <img src={image} alt={`${product.name}-view-${index + 1}`} />
                    </button>
                  ))}
                </div>

                <div className="main-display-box">
                  {mainImage ? (
                    <img src={mainImage} alt={product.name} className="featured-image" />
                  ) : (
                    <div className="no-image-box">No image available</div>
                  )}
                </div>
              </div>
            </div>

            <div className="details-section">
              <div className="details-header">
                <div className="top-meta-row">
                  <p className="category-label">{product.category || "General"}</p>
                  <span className={`stock-pill ${inStock ? "in-stock" : "out-stock"}`}>
                    {inStock ? `In Stock (${stockCount})` : "Out of Stock"}
                  </span>
                </div>

                <h1 className="product-name">{product.name}</h1>

                <p className="short-description">{shortDescriptionContent}</p>

                <div className="price-badge-row">
                  <div className="price-stack">
                    <p className="product-price">
                      <IndianRupee size={24} />
                      {currentPriceText}
                    </p>
                    {hasDiscount ? (
                      <div className="offer-row">
                        <span className="original-price">{formatCurrency(originalPrice)}</span>
                        <span className="save-chip">{discountPercent}% OFF</span>
                      </div>
                    ) : null}
                  </div>

                  {productBadges.length ? (
                    <div className="badge-strip">
                      {productBadges.map((badge) => (
                        <span key={badge} className="promo-badge">
                          {badge}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="purchase-card">
                {sizeOptions.length ? (
                  <div className="size-selector-block">
                    <div className="size-selector-head">
                      <p>Size</p>
                      <span>{priceInfo.selectedVariant?.size || "-"}</span>
                    </div>

                    <div className="size-option-grid">
                      {sizeOptions.map((option) => {
                        const isSelected = priceInfo.selectedVariant?.size === option.size;

                        return (
                          <button
                            key={option.size}
                            type="button"
                            className={`size-option-btn ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedSize(option.size)}
                            disabled={!option.isInStock}
                          >
                            <span className="size-option-label">{option.size}</span>
                            <span className="size-option-price">
                              {formatCurrency(option.currentPrice)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="qty-row">
                  <p>Quantity</p>
                  <div className="qty-control">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((prev) =>
                          Math.min(inStock ? Math.max(stockCount, 1) : 1, prev + 1)
                        )
                      }
                      disabled={!inStock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="action-button-group">
                  <button
                    type="button"
                    onClick={addSelectedQuantityToCart}
                    className="btn-secondary-outline"
                    disabled={!inStock}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>

                  <button
                    type="button"
                    className="btn-primary-solid"
                    onClick={handleBuyNow}
                    disabled={!inStock}
                  >
                    <Zap size={18} /> Buy Now
                  </button>
                </div>
              </div>

              <div className="spec-card">
                <h3 className="section-subtitle">Product Specifications</h3>

                <div className="spec-grid">
                  <div className="spec-item">
                    <span>Product Type</span>
                    <strong>{formatLabel(product.productType) || "-"}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Category</span>
                    <strong>{product.category || "-"}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Sub Category</span>
                    <strong>{product.subCategory || "-"}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Brand</span>
                    <strong>{product.brand || "UrbanVibes"}</strong>
                  </div>
                  {sizeOptions.length ? (
                    <div className="spec-item">
                      <span>Selected Size</span>
                      <strong>{priceInfo.selectedVariant?.size || "-"}</strong>
                    </div>
                  ) : null}
                  <div className="spec-item">
                    <span>SKU</span>
                    <strong>{product.sku || "-"}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Publishing</span>
                    <strong>{product.isPublished ? "Published" : "Draft"}</strong>
                  </div>
                </div>

                {parsedTags.length ? (
                  <div className="tag-wrap">
                    {parsedTags.map((tag) => (
                      <span key={tag} className="tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="description-block">
                <h3 className="section-subtitle">Description</h3>
                <p className="description-text">
                  {product.description ||
                    `This ${product.name} is carefully nurtured at UrbanVibes to elevate your space.`}
                </p>
              </div>

              <div className="detail-cards-grid">
                {product.plantDetails ? (
                  <div className="mini-detail-card">
                    <h4>Plant Details</h4>
                    <ul>
                      {product.plantDetails.sunlight ? (
                        <li>Sunlight: {formatLabel(product.plantDetails.sunlight)}</li>
                      ) : null}
                      {product.plantDetails.watering ? (
                        <li>Watering: {formatLabel(product.plantDetails.watering)}</li>
                      ) : null}
                      {product.plantDetails.difficulty ? (
                        <li>Difficulty: {formatLabel(product.plantDetails.difficulty)}</li>
                      ) : null}
                      {product.plantDetails.potSize ? (
                        <li>Pot Size: {product.plantDetails.potSize}</li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}

                {product.careGuide ? (
                  <div className="mini-detail-card">
                    <h4>Care Guide</h4>
                    <ul>
                      {product.careGuide.wateringInstructions ? (
                        <li>{product.careGuide.wateringInstructions}</li>
                      ) : null}
                      {product.careGuide.sunlightInstructions ? (
                        <li>{product.careGuide.sunlightInstructions}</li>
                      ) : null}
                      {product.careGuide.soilInstructions ? (
                        <li>{product.careGuide.soilInstructions}</li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}

                {product.shipping ? (
                  <div className="mini-detail-card">
                    <h4>Shipping</h4>
                    <ul>
                      <li>
                        {product.shipping.freeShipping
                          ? "Free Shipping Available"
                          : `Shipping: ${formatCurrency(product.shipping.shippingCharges || 0)}`}
                      </li>
                      {product.shipping.weight ? <li>Weight: {product.shipping.weight} kg</li> : null}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="trust-features-card">
                <h4 className="trust-title">Why Shop From UrbanVibes?</h4>
                <div className="trust-grid">
                  <div className="trust-item">
                    <CheckCircle size={16} /> Healthy Plants Guaranteed
                  </div>
                  <div className="trust-item">
                    <CheckCircle size={16} /> Eco-friendly Packaging
                  </div>
                  <div className="trust-item">
                    <CheckCircle size={16} /> Fast and Secure Delivery
                  </div>
                  <div className="trust-item">
                    <BadgeCheck size={16} /> Verified Product Quality
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts
        allProducts={allProducts}
        currentCategory={product.category}
        currentProductId={product.id || product._id}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

export default ProductInfo;
