let variantCounter = 0;

const createVariantId = () => `size-${Date.now()}-${variantCounter++}`;

const createEmptySizeVariant = () => ({
  id: createVariantId(),
  color: "",
  size: "",
  price: "",
  discountedPrice: "",
  stock: "",
});

const hasAnySizeVariantInput = (variants = []) =>
  Array.isArray(variants)
    ? variants.some((variant = {}) =>
        ["color", "size", "price", "discountedPrice", "stock"].some(
          (field) => String(variant?.[field] ?? "").trim() !== ""
        )
      )
    : false;

const normalizeSizeVariantsForForm = (variants = []) =>
  Array.isArray(variants)
    ? variants.map((variant = {}) => ({
        id: createVariantId(),
        color: String(variant.color || variant.colour || "").trim(),
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
  const seenOptions = new Set();

  variants.forEach((variant = {}, index) => {
    const color = String(variant.color ?? "").trim();
    const size = String(variant.size || "").trim();
    const rawPrice = String(variant.price ?? "").trim();
    const rawDiscountedPrice = String(variant.discountedPrice ?? "").trim();
    const rawStock = String(variant.stock ?? "").trim();
    const optionLabel = [color, size].filter(Boolean).join(" / ") || color || size;

    const hasAnyValue = Boolean(
      color || size || rawPrice || rawDiscountedPrice || rawStock
    );
    if (!hasAnyValue) {
      return;
    }

    if (!optionLabel) {
      throw new Error(`Variant row ${index + 1} needs a color or size label.`);
    }

    const normalizedOptionKey = `${color.toLowerCase()}::${size.toLowerCase()}`;
    if (seenOptions.has(normalizedOptionKey)) {
      throw new Error(`Duplicate variant "${optionLabel}" is not allowed.`);
    }

    const price = Number(rawPrice);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Variant "${optionLabel}" needs a valid price greater than 0.`);
    }

    const discountedPrice = rawDiscountedPrice === "" ? 0 : Number(rawDiscountedPrice);
    if (!Number.isFinite(discountedPrice) || discountedPrice < 0) {
      throw new Error(`Variant "${optionLabel}" needs a valid discounted price.`);
    }

    if (discountedPrice > price) {
      throw new Error(
        `Variant "${optionLabel}" discounted price cannot be greater than price.`
      );
    }

    const stock = rawStock === "" ? 0 : Number(rawStock);
    if (!Number.isFinite(stock) || stock < 0) {
      throw new Error(`Variant "${optionLabel}" needs a valid stock value.`);
    }

    normalizedVariants.push({
      color,
      size,
      name: size || "",
      price,
      discountedPrice,
      stock,
    });
    seenOptions.add(normalizedOptionKey);
  });

  return normalizedVariants;
};

export {
  createEmptySizeVariant,
  hasAnySizeVariantInput,
  normalizeSizeVariantsForForm,
  serializeSizeVariants,
};
