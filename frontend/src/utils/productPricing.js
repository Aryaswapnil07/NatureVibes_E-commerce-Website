const normalizeText = (value = "") => String(value || "").trim();

const resolvePrimaryImage = (product = {}) =>
  product.images?.find?.((entry) => entry?.isPrimary)?.url ||
  product.images?.[0]?.url ||
  product.image ||
  "";

const getVariantLabel = (variant = {}) =>
  normalizeText(variant.size || variant.name || variant.potSize);

const normalizeProductVariants = (variants = []) =>
  Array.isArray(variants)
    ? variants
        .map((variant = {}) => {
          const size = getVariantLabel(variant);
          const price = Number(variant.price || 0);
          const discountedPrice = Number(variant.discountedPrice || 0);
          const currentPrice =
            discountedPrice > 0 && discountedPrice < price ? discountedPrice : price;

          if (!size || !Number.isFinite(price) || price <= 0) {
            return null;
          }

          const stock = Number(variant.stock ?? 0);

          return {
            ...variant,
            size,
            price,
            discountedPrice,
            currentPrice,
            stock,
            isInStock: stock > 0,
          };
        })
        .filter(Boolean)
    : [];

const getProductPriceInfo = (product = {}, preferredSize = "") => {
  const variants = normalizeProductVariants(product.variants);

  if (variants.length > 0) {
    const sortedVariants = [...variants].sort((left, right) => {
      const displayDelta = left.currentPrice - right.currentPrice;
      if (displayDelta !== 0) return displayDelta;

      const regularDelta = left.price - right.price;
      if (regularDelta !== 0) return regularDelta;

      return left.size.localeCompare(right.size, undefined, {
        sensitivity: "base",
        numeric: true,
      });
    });

    const normalizedPreferredSize = normalizeText(preferredSize).toLowerCase();
    const selectedVariant =
      sortedVariants.find(
        (variant) => variant.size.toLowerCase() === normalizedPreferredSize
      ) ||
      sortedVariants.find((variant) => variant.isInStock) ||
      sortedVariants[0];

    const lowestVariant = sortedVariants[0];
    const totalStock = sortedVariants.reduce(
      (total, variant) => total + Math.max(0, Number(variant.stock || 0)),
      0
    );

    return {
      hasVariants: true,
      variants: sortedVariants,
      selectedVariant,
      sizeLabels: sortedVariants.map((variant) => variant.size),
      displayPrice: Number(selectedVariant?.currentPrice || 0),
      regularPrice: Number(selectedVariant?.price || 0),
      discountedPrice: Number(selectedVariant?.discountedPrice || 0),
      lowestPrice: Number(lowestVariant?.currentPrice || 0),
      lowestRegularPrice: Number(lowestVariant?.price || 0),
      lowestDiscountedPrice: Number(lowestVariant?.discountedPrice || 0),
      stock: Number(selectedVariant?.stock || 0),
      totalStock,
      isInStock: Boolean(selectedVariant?.isInStock),
      hasAnyInStock: sortedVariants.some((variant) => variant.isInStock),
    };
  }

  const regularPrice = Number(product.price || 0);
  const discountedPrice = Number(product.discountedPrice || 0);
  const displayPrice =
    discountedPrice > 0 && discountedPrice < regularPrice ? discountedPrice : regularPrice;
  const stock = Number(product.stock ?? 0);

  return {
    hasVariants: false,
    variants: [],
    selectedVariant: null,
    sizeLabels: [],
    displayPrice,
    regularPrice,
    discountedPrice,
    lowestPrice: displayPrice,
    lowestRegularPrice: regularPrice,
    lowestDiscountedPrice: discountedPrice,
    stock,
    totalStock: stock,
    isInStock: stock > 0 && product.isInStock !== false,
    hasAnyInStock: stock > 0 && product.isInStock !== false,
  };
};

const resolveProductIdentity = (product = {}) =>
  normalizeText(product.backendId || product._id || product.id || product.slug || product.name);

const createCartProductSnapshot = (product = {}, preferredSize = "") => {
  const priceInfo = getProductPriceInfo(product, preferredSize);
  const productId = resolveProductIdentity(product);
  const backendId = normalizeText(product.backendId || product._id || product.id);
  const selectedSize = priceInfo.selectedVariant?.size || "";
  const baseName = normalizeText(product.name || "Product");

  return {
    id: selectedSize ? `${productId}::${selectedSize.toLowerCase()}` : productId,
    backendId,
    productId: backendId,
    name: baseName,
    baseName,
    variantSize: selectedSize,
    category: product.subCategory || product.category || product.productType || "General",
    price: Number(priceInfo.displayPrice || 0),
    unitPrice: Number(priceInfo.displayPrice || 0),
    originalPrice: Number(priceInfo.regularPrice || 0),
    discountedPrice: Number(priceInfo.discountedPrice || 0),
    stock: Number(priceInfo.stock || 0),
    image: resolvePrimaryImage(product),
    badge: product.badge || "",
    description: product.description || product.shortDescription || "",
  };
};

export { createCartProductSnapshot, getProductPriceInfo, normalizeProductVariants };
