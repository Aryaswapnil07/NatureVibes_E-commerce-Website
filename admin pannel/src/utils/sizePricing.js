let variantCounter = 0;

const createVariantId = () => `size-${Date.now()}-${variantCounter++}`;

const createEmptySizeVariant = () => ({
  id: createVariantId(),
  size: "",
  price: "",
  discountedPrice: "",
  stock: "",
});

const hasAnySizeVariantInput = (variants = []) =>
  Array.isArray(variants)
    ? variants.some((variant = {}) =>
        ["size", "price", "discountedPrice", "stock"].some(
          (field) => String(variant?.[field] ?? "").trim() !== ""
        )
      )
    : false;

const normalizeSizeVariantsForForm = (variants = []) =>
  Array.isArray(variants)
    ? variants.map((variant = {}) => ({
        id: createVariantId(),
        size: String(variant.size || variant.name || variant.potSize || "").trim(),
        price:
          variant.price === undefined || variant.price === null ? "" : String(variant.price),
        discountedPrice:
          variant.discountedPrice === undefined || variant.discountedPrice === null
            ? ""
            : String(variant.discountedPrice),
        stock:
          variant.stock === undefined || variant.stock === null ? "" : String(variant.stock),
      }))
    : [];

const serializeSizeVariants = (variants = []) => {
  if (!Array.isArray(variants)) {
    return [];
  }

  const normalizedVariants = [];
  const seenLabels = new Set();

  variants.forEach((variant = {}, index) => {
    const size = String(variant.size || "").trim();
    const rawPrice = String(variant.price ?? "").trim();
    const rawDiscountedPrice = String(variant.discountedPrice ?? "").trim();
    const rawStock = String(variant.stock ?? "").trim();

    const hasAnyValue = Boolean(size || rawPrice || rawDiscountedPrice || rawStock);
    if (!hasAnyValue) {
      return;
    }

    if (!size) {
      throw new Error(`Size row ${index + 1} needs a size label.`);
    }

    const normalizedSize = size.toLowerCase();
    if (seenLabels.has(normalizedSize)) {
      throw new Error(`Duplicate size "${size}" is not allowed.`);
    }

    const price = Number(rawPrice);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Size "${size}" needs a valid price greater than 0.`);
    }

    const discountedPrice = rawDiscountedPrice === "" ? 0 : Number(rawDiscountedPrice);
    if (!Number.isFinite(discountedPrice) || discountedPrice < 0) {
      throw new Error(`Size "${size}" needs a valid discounted price.`);
    }

    if (discountedPrice > price) {
      throw new Error(`Size "${size}" discounted price cannot be greater than price.`);
    }

    const stock = rawStock === "" ? 0 : Number(rawStock);
    if (!Number.isFinite(stock) || stock < 0) {
      throw new Error(`Size "${size}" needs a valid stock value.`);
    }

    normalizedVariants.push({
      size,
      name: size,
      price,
      discountedPrice,
      stock,
    });
    seenLabels.add(normalizedSize);
  });

  return normalizedVariants;
};

export {
  createEmptySizeVariant,
  hasAnySizeVariantInput,
  normalizeSizeVariantsForForm,
  serializeSizeVariants,
};
