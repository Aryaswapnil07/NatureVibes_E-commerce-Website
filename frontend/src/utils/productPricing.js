const normalizeText = (value = "") => String(value || "").trim();
const normalizeLookup = (value = "") => normalizeText(value).toLowerCase();

const resolvePrimaryImage = (product = {}) =>
  product.images?.find?.((entry) => entry?.isPrimary)?.url ||
  product.images?.[0]?.url ||
  product.image ||
  "";

const getVariantSize = (variant = {}) => {
  const explicitSize = normalizeText(variant.size || variant.potSize);
  if (explicitSize) {
    return explicitSize;
  }

  if (normalizeText(variant.color || variant.colour)) {
    return "";
  }

  return normalizeText(variant.name);
};

const getVariantColor = (variant = {}) =>
  normalizeText(variant.color || variant.colour);

const getVariantLabel = (variant = {}) => {
  const color = getVariantColor(variant);
  const size = getVariantSize(variant);

  if (color && size) {
    return `${color} / ${size}`;
  }

  return color || size || normalizeText(variant.label || variant.name);
};

const getUniqueLabels = (values = []) => {
  const labels = [];
  const seen = new Set();

  values.forEach((value) => {
    const label = normalizeText(value);
    const lookup = normalizeLookup(label);

    if (!label || seen.has(lookup)) {
      return;
    }

    seen.add(lookup);
    labels.push(label);
  });

  return labels;
};

const compareVariants = (left, right) => {
  const displayDelta = left.currentPrice - right.currentPrice;
  if (displayDelta !== 0) return displayDelta;

  const regularDelta = left.price - right.price;
  if (regularDelta !== 0) return regularDelta;

  return left.label.localeCompare(right.label, undefined, {
    sensitivity: "base",
    numeric: true,
  });
};

const normalizeSelectionInput = (selection = {}) => {
  if (typeof selection === "string") {
    return { color: "", size: normalizeText(selection) };
  }

  return {
    color: normalizeText(
      selection.color || selection.variantColor || selection.preferredColor
    ),
    size: normalizeText(
      selection.size || selection.variantSize || selection.preferredSize
    ),
  };
};

const normalizeProductVariants = (variants = []) =>
  Array.isArray(variants)
    ? variants
        .map((variant = {}) => {
          const size = getVariantSize(variant);
          const color = getVariantColor(variant);
          const label = getVariantLabel({ ...variant, color, size });
          const price = Number(variant.price || 0);
          const discountedPrice = Number(variant.discountedPrice || 0);
          const currentPrice =
            discountedPrice > 0 && discountedPrice < price ? discountedPrice : price;

          if (!label || !Number.isFinite(price) || price <= 0) {
            return null;
          }

          const stock = Number(variant.stock ?? 0);

          return {
            ...variant,
            color,
            size,
            label,
            price,
            discountedPrice,
            currentPrice,
            stock,
            isInStock: stock > 0,
          };
        })
        .filter(Boolean)
    : [];

const getProductPriceInfo = (product = {}, selection = {}) => {
  const variants = normalizeProductVariants(product.variants);

  if (variants.length > 0) {
    const sortedVariants = [...variants].sort(compareVariants);
    const preferredSelection = normalizeSelectionInput(selection);
    const colorLabels = getUniqueLabels(sortedVariants.map((variant) => variant.color));

    const preferredColorLookup = normalizeLookup(preferredSelection.color);
    const preferredSizeLookup = normalizeLookup(preferredSelection.size);

    const resolvedColor = colorLabels.length
      ? sortedVariants.find((variant) => normalizeLookup(variant.color) === preferredColorLookup)
          ?.color ||
        sortedVariants.find((variant) => variant.isInStock && variant.color)?.color ||
        colorLabels[0] ||
        ""
      : "";

    const filteredVariants = resolvedColor
      ? sortedVariants.filter(
          (variant) => normalizeLookup(variant.color) === normalizeLookup(resolvedColor)
        )
      : sortedVariants;

    const sizeLabels = getUniqueLabels(sortedVariants.map((variant) => variant.size));
    const availableSizeLabels = getUniqueLabels(
      filteredVariants.map((variant) => variant.size)
    );

    const resolvedSize = availableSizeLabels.length
      ? filteredVariants.find((variant) => normalizeLookup(variant.size) === preferredSizeLookup)
          ?.size ||
        filteredVariants.find((variant) => variant.isInStock && variant.size)?.size ||
        availableSizeLabels[0] ||
        ""
      : "";

    const selectedVariant =
      filteredVariants.find((variant) => {
        if (resolvedSize) {
          return normalizeLookup(variant.size) === normalizeLookup(resolvedSize);
        }

        return true;
      }) ||
      filteredVariants.find((variant) => variant.isInStock) ||
      filteredVariants[0] ||
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
      filteredVariants,
      selectedVariant,
      colorLabels,
      sizeLabels,
      availableSizeLabels,
      selectedColor: selectedVariant?.color || resolvedColor,
      selectedSize: selectedVariant?.size || resolvedSize,
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
    filteredVariants: [],
    selectedVariant: null,
    colorLabels: [],
    sizeLabels: [],
    availableSizeLabels: [],
    selectedColor: "",
    selectedSize: "",
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

const createCartProductSnapshot = (product = {}, selection = {}) => {
  const priceInfo = getProductPriceInfo(product, selection);
  const productId = resolveProductIdentity(product);
  const backendId = normalizeText(product.backendId || product._id || product.id);
  const selectedColor = priceInfo.selectedVariant?.color || "";
  const selectedSize = priceInfo.selectedVariant?.size || "";
  const variantLabel =
    priceInfo.selectedVariant?.label || [selectedColor, selectedSize].filter(Boolean).join(" / ");
  const baseName = normalizeText(product.name || "Product");
  const variantKey = [selectedColor, selectedSize]
    .filter(Boolean)
    .map((entry) => normalizeLookup(entry))
    .join("::");

  return {
    id: variantKey ? `${productId}::${variantKey}` : productId,
    backendId,
    productId: backendId,
    name: baseName,
    baseName,
    variantLabel,
    variantColor: selectedColor,
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
