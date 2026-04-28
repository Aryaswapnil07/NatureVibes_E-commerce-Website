import mongoose from "mongoose";
import Stripe from "stripe";
import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import userModel from "../models/User.model.js";

const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const ALLOWED_ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const ALLOWED_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const ALLOWED_PAYMENT_METHODS = [
  "cod",
  "razorpay",
  "upi",
  "card",
  "netbanking",
  "stripe",
];

const CURRENT_ORDER_STATUSES = ["placed", "processing", "shipped"];
const HISTORY_ORDER_STATUSES = ["delivered", "cancelled"];

const normalizeAmount = (value) => Math.round(Number(value || 0) * 100) / 100;
const isLikelyPublicUrl = (value = "") => /^https?:\/\//i.test(String(value));

const sanitizeText = (value = "") => String(value || "").trim();
const sanitizeEmail = (value = "") => sanitizeText(value).toLowerCase();
const normalizeLookupName = (value = "") => sanitizeText(value).toLowerCase();
const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getVariantSize = (variant = {}) => {
  const explicitSize = sanitizeText(variant.size || variant.potSize);
  if (explicitSize) {
    return explicitSize;
  }

  if (sanitizeText(variant.color || variant.colour)) {
    return "";
  }

  return sanitizeText(variant.name);
};

const getVariantColor = (variant = {}) =>
  sanitizeText(variant.color || variant.colour);

const getVariantLabel = (variant = {}) => {
  const color = getVariantColor(variant);
  const size = getVariantSize(variant);

  if (color && size) {
    return `${color} / ${size}`;
  }

  return color || size || sanitizeText(variant.label || variant.name);
};

const buildVariantSelectionLabel = ({ variantSize = "", variantColor = "" } = {}) => {
  const color = sanitizeText(variantColor);
  const size = sanitizeText(variantSize);

  if (color && size) {
    return `${color} / ${size}`;
  }

  return color || size;
};

const normalizeVariantRecord = (variant = {}) => {
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

  return {
    ...variant,
    color,
    size,
    label,
    price,
    discountedPrice,
    currentPrice,
    stock: Number(variant.stock ?? 0),
  };
};

const normalizeProductVariants = (variants = []) =>
  Array.isArray(variants) ? variants.map(normalizeVariantRecord).filter(Boolean) : [];

const getProductUnitPrice = (product = {}) =>
  Number(product.discountedPrice > 0 ? product.discountedPrice : product.price);

const syncProductInventorySummary = (product = {}) => {
  const variants = Array.isArray(product.variants) ? product.variants : [];

  if (variants.length > 0) {
    const totalStock = variants.reduce(
      (total, variant) => total + Math.max(0, Number(variant?.stock || 0)),
      0
    );

    product.hasVariants = true;
    product.stock = totalStock;
    product.isInStock = totalStock > 0;
    return;
  }

  product.hasVariants = false;
  const stock = Math.max(0, Number(product.stock || 0));
  product.stock = stock;
  product.isInStock = stock > 0;
};

const findMatchingVariant = (product = {}, variantSelection = {}) => {
  const productVariants = Array.isArray(product.variants) ? product.variants : [];
  if (!productVariants.length) {
    return null;
  }

  const normalizedVariantSize = normalizeLookupName(variantSelection?.variantSize || "");
  const normalizedVariantColor = normalizeLookupName(
    variantSelection?.variantColor || ""
  );

  if (!normalizedVariantSize && !normalizedVariantColor) {
    return null;
  }

  const matchingVariants = productVariants.filter((variant) => {
    if (
      normalizedVariantColor &&
      normalizeLookupName(getVariantColor(variant)) !== normalizedVariantColor
    ) {
      return false;
    }

    if (
      normalizedVariantSize &&
      normalizeLookupName(getVariantSize(variant)) !== normalizedVariantSize
    ) {
      return false;
    }

    return true;
  });

  if (matchingVariants.length === 1) {
    return matchingVariants[0];
  }

  return null;
};

const applyInventoryChangeToProduct = ({ product, item, action }) => {
  const quantity = Number(item?.quantity || 0);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return;
  }

  const isReserveAction = action === "reserve";
  const variantSize = sanitizeText(item?.variantSize);
  const variantColor = sanitizeText(item?.variantColor);
  const requestedVariantLabel = buildVariantSelectionLabel({
    variantSize,
    variantColor,
  });
  const delta = isReserveAction ? -quantity : quantity;

  const singleVariantFallback =
    !variantSize &&
    !variantColor &&
    Array.isArray(product.variants) &&
    product.variants.length === 1
      ? product.variants[0]
      : null;

  if (variantSize || variantColor || singleVariantFallback) {
    const matchedVariant =
      singleVariantFallback ||
      findMatchingVariant(product, {
        variantSize,
        variantColor,
      });

    if (!matchedVariant) {
      if (isReserveAction) {
        throw new Error(
          `${product.name} no longer has the selected option${
            requestedVariantLabel ? ` "${requestedVariantLabel}"` : ""
          }. Please update your cart.`
        );
      }
      return;
    }

    const matchedVariantLabel = getVariantLabel(matchedVariant) || requestedVariantLabel;
    const currentVariantStock = Math.max(0, Number(matchedVariant.stock || 0));
    const nextVariantStock = currentVariantStock + delta;

    if (isReserveAction && nextVariantStock < 0) {
      throw new Error(
        `${product.name} (${matchedVariantLabel}) is out of stock or has insufficient quantity`
      );
    }

    matchedVariant.stock = Math.max(0, nextVariantStock);
    syncProductInventorySummary(product);
    return;
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    if (isReserveAction) {
      throw new Error(
        `${product.name} requires a variant selection. Please update your cart before checkout.`
      );
    }

    return;
  }

  const currentStock = Math.max(0, Number(product.stock || 0));
  const nextStock = currentStock + delta;

  if (isReserveAction && nextStock < 0) {
    throw new Error(`${product.name} is out of stock or has insufficient quantity`);
  }

  product.stock = Math.max(0, nextStock);
  product.isInStock = product.stock > 0;
};

const rollbackInventoryChanges = async (items = []) => {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const appliedItem = items[index];

    if (!mongoose.Types.ObjectId.isValid(appliedItem.productId)) {
      continue;
    }

    try {
      const product = await Product.findById(appliedItem.productId);
      if (!product) {
        continue;
      }

      applyInventoryChangeToProduct({
        product,
        item: {
          quantity: appliedItem.quantity,
          variantSize: appliedItem.variantSize,
          variantColor: appliedItem.variantColor,
        },
        action: "release",
      });
      await product.save();
    } catch {
      // Best effort rollback for partial inventory reservations.
    }
  }
};

const applyInventoryChanges = async ({ items = [], action }) => {
  const appliedItems = [];

  try {
    for (const item of items) {
      const productId = sanitizeText(item?.product);
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        continue;
      }

      const product = await Product.findById(productId);
      if (!product || product.isDeleted || product.isActive === false) {
        if (action === "reserve") {
          throw new Error(
            item?.name
              ? `${item.name} is unavailable. Please remove it and add it again from the catalog.`
              : "One or more products are unavailable. Please refresh cart."
          );
        }
        continue;
      }

      applyInventoryChangeToProduct({ product, item, action });
      await product.save();

      appliedItems.push({
        productId,
        quantity: Number(item.quantity || 0),
        variantSize: sanitizeText(item.variantSize),
        variantColor: sanitizeText(item.variantColor),
      });
    }
  } catch (error) {
    if (action === "reserve" && appliedItems.length > 0) {
      await rollbackInventoryChanges(appliedItems);
    }
    throw error;
  }
};

const sanitizeAddress = (address = {}, fallbackCustomer = {}) => ({
  fullName: sanitizeText(address.fullName || fallbackCustomer.name),
  phone: sanitizeText(address.phone || fallbackCustomer.phone),
  streetAddress: sanitizeText(address.streetAddress),
  city: sanitizeText(address.city),
  state: sanitizeText(address.state),
  pincode: sanitizeText(address.pincode),
});

const getSelectedAddress = ({ requestedAddress, selectedAddress }) => {
  if (selectedAddress) {
    return sanitizeAddress(selectedAddress);
  }

  return sanitizeAddress(requestedAddress);
};

const resolveClientBaseUrl = (req) =>
  (process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173").replace(
    /\/$/,
    ""
  );

const resolveRequestedProductId = (item = {}) => {
  const candidateIds = [
    item.productId,
    item.backendId,
    item.product?._id,
    item.product?.id,
    typeof item.product === "string" || typeof item.product === "number"
      ? item.product
      : "",
    item._id,
    item.id,
  ];

  for (const candidate of candidateIds) {
    const normalized = sanitizeText(candidate);
    if (mongoose.Types.ObjectId.isValid(normalized)) {
      return normalized;
    }
  }

  return "";
};

const resolveRequestedQuantity = (item = {}) => {
  const quantity = Number(item.quantity ?? item.qty ?? item.count ?? 1);
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 20 ? quantity : null;
};

const resolveRequestedPrice = (item = {}) => {
  const price = Number(
    item.price ?? item.unitPrice ?? item.amount ?? item.product?.price ?? Number.NaN
  );
  return Number.isFinite(price) && price > 0 ? normalizeAmount(price) : null;
};

const resolveRequestedName = (item = {}) =>
  sanitizeText(item.name || item.title || item.productName || item.product?.name);

const resolveRequestedVariantSize = (item = {}) =>
  sanitizeText(
    item.variantSize ||
      item.size ||
      item.variant?.size ||
      item.option ||
      item.selectedSize
  );

const resolveRequestedVariantColor = (item = {}) =>
  sanitizeText(
    item.variantColor ||
      item.color ||
      item.variant?.color ||
      item.selectedColor
  );

const resolveRequestedImage = (item = {}) =>
  sanitizeText(
    item.image ||
      item.thumbnail ||
      item.product?.image ||
      item.product?.images?.find?.((entry) => entry?.isPrimary)?.url ||
      item.product?.images?.[0]?.url
  );

const normalizeOrderItems = (items = []) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const productId = resolveRequestedProductId(item);
    const quantity = resolveRequestedQuantity(item);
    const name = resolveRequestedName(item);
    const price = resolveRequestedPrice(item);
    const image = resolveRequestedImage(item);

    const isValid = Boolean(quantity && (productId || (name && price)));

    return {
      productId,
      quantity,
      name,
      price,
      variantSize: resolveRequestedVariantSize(item),
      variantColor: resolveRequestedVariantColor(item),
      image,
      isValid,
    };
  });
};

const buildOrderInput = async (req) => {
  const normalizedRequestedItems = normalizeOrderItems(req.body?.items || []);

  if (!normalizedRequestedItems.length) {
    return {
      error: {
        status: 400,
        message:
          "Order items must include a valid quantity and either a productId or a valid name/price snapshot.",
      },
    };
  }

  if (normalizedRequestedItems.some((item) => !item.isValid)) {
    return {
      error: {
        status: 400,
        message:
          "Each order item must include a valid quantity and either a productId or a valid name/price snapshot.",
      },
    };
  }

  const requestedItems = normalizedRequestedItems.map(({ isValid, ...item }) => item);

  const user = await userModel
    .findOne({ _id: req.userId, isActive: true })
    .select("_id name email phone addresses");

  if (!user) {
    return {
      error: {
        status: 401,
        message: "User not found. Please login again.",
      },
    };
  }

  const distinctProductIds = [
    ...new Set(requestedItems.map((item) => item.productId).filter(Boolean)),
  ];
  const legacyItemNames = [
    ...new Set(
      requestedItems
        .filter((item) => !item.productId)
        .map((item) => normalizeLookupName(item.name))
        .filter(Boolean)
    ),
  ];

  const [products, legacyProducts] = await Promise.all([
    distinctProductIds.length
      ? Product.find({
          _id: { $in: distinctProductIds },
          isDeleted: false,
          isPublished: true,
          isActive: true,
        }).select("_id name images price discountedPrice stock isInStock variants")
      : Promise.resolve([]),
    legacyItemNames.length
      ? Product.find({
          isDeleted: false,
          isPublished: true,
          isActive: true,
          $or: legacyItemNames.map((name) => ({
            name: new RegExp(`^${escapeRegex(name)}$`, "i"),
          })),
        }).select("_id name images price discountedPrice stock isInStock variants")
      : Promise.resolve([]),
  ]);

  const productMap = new Map(products.map((product) => [String(product._id), product]));
  const legacyProductMap = new Map();

  for (const product of legacyProducts) {
    const key = normalizeLookupName(product.name);
    if (!legacyProductMap.has(key)) {
      legacyProductMap.set(key, []);
    }
    legacyProductMap.get(key).push(product);
  }

  const resolveLegacyProduct = (item) => {
    const key = normalizeLookupName(item.name);
    const candidates = legacyProductMap.get(key) || [];

    if (!candidates.length) {
      return null;
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    if (Number.isFinite(item.price) && item.price > 0) {
      const matchedByPrice = candidates.find(
        (product) => normalizeAmount(getProductUnitPrice(product)) === normalizeAmount(item.price)
      );

      if (matchedByPrice) {
        return matchedByPrice;
      }
    }

    return candidates[0];
  };

  const finalItems = [];

  for (const item of requestedItems) {
    const product = item.productId
      ? productMap.get(item.productId)
      : resolveLegacyProduct(item);

    if (!product) {
      return {
        error: {
          status: 400,
          message: item.name
            ? `${item.name} is unavailable. Please remove it and add it again from the catalog.`
            : "One or more products are unavailable. Please refresh cart.",
        },
      };
    }

    const productVariants = normalizeProductVariants(product.variants);
    const requestedVariantLabel = buildVariantSelectionLabel({
      variantSize: item.variantSize,
      variantColor: item.variantColor,
    });
    const matchedVariant =
      item.variantSize || item.variantColor
        ? findMatchingVariant(product, {
            variantSize: item.variantSize,
            variantColor: item.variantColor,
          })
        : productVariants.length === 1
          ? productVariants[0]
          : null;
    const normalizedMatchedVariant = matchedVariant
      ? normalizeVariantRecord(matchedVariant)
      : null;

    if (productVariants.length > 0 && !normalizedMatchedVariant) {
      return {
        error: {
          status: 400,
          message: requestedVariantLabel
            ? `${product.name} no longer has the selected option "${requestedVariantLabel}". Please update your cart.`
            : `${product.name} has variant-specific pricing. Please select the required options and add it to cart again.`,
        },
      };
    }

    const availableStock = normalizedMatchedVariant
      ? Number(normalizedMatchedVariant.stock || 0)
      : Number(product.stock || 0);

    const isAvailable = normalizedMatchedVariant
      ? availableStock >= item.quantity
      : product.isInStock && availableStock >= item.quantity;

    if (!isAvailable) {
      return {
        error: {
          status: 400,
          message: normalizedMatchedVariant
            ? `${product.name} (${normalizedMatchedVariant.label}) is out of stock or has insufficient quantity`
            : `${product.name} is out of stock or has insufficient quantity`,
        },
      };
    }

    const unitPrice = normalizedMatchedVariant
      ? Number(normalizedMatchedVariant.currentPrice || 0)
      : getProductUnitPrice(product);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return {
        error: {
          status: 400,
          message: `Invalid price configuration for ${product.name}`,
        },
      };
    }

    finalItems.push({
      product: product._id,
      name: product.name,
      variantLabel: normalizedMatchedVariant?.label || requestedVariantLabel || "",
      variantColor: normalizedMatchedVariant?.color || "",
      variantSize: normalizedMatchedVariant?.size || "",
      image: product.images?.find((entry) => entry?.isPrimary)?.url ||
        product.images?.[0]?.url ||
        item.image ||
        "",
      price: unitPrice,
      quantity: item.quantity,
    });
  }

  const calculatedAmount = normalizeAmount(
    finalItems.reduce(
      (total, item) => total + Number(item.price) * Number(item.quantity),
      0
    )
  );

  if (!Number.isFinite(calculatedAmount) || calculatedAmount <= 0) {
    return {
      error: {
        status: 400,
        message: "Order amount must be a valid number greater than 0",
      },
    };
  }

  const clientAmount = Number(req.body?.amount);
  if (Number.isFinite(clientAmount)) {
    const delta = Math.abs(normalizeAmount(clientAmount) - calculatedAmount);
    if (delta > 1) {
      return {
        error: {
          status: 400,
          message: "Order amount mismatch. Please refresh your cart and try again.",
        },
      };
    }
  }

  const requestedAddress = req.body?.address || {};
  const requestedAddressId = String(req.body?.addressId || "").trim();
  const selectedAddress = requestedAddressId ? user.addresses?.id(requestedAddressId) : null;
  const requestedCustomerEmail = sanitizeEmail(
    req.body?.customer?.email || requestedAddress.email || user.email
  );
  const finalAddress = getSelectedAddress({
    requestedAddress,
    selectedAddress,
  });

  if (!finalAddress.fullName || !finalAddress.phone || !finalAddress.streetAddress) {
    return {
      error: {
        status: 400,
        message: "Address requires fullName, phone, and streetAddress",
      },
    };
  }

  return {
    data: {
      items: finalItems,
      amount: calculatedAmount,
      user: user._id,
      address: finalAddress,
      customer: {
        name: sanitizeText(user.name || finalAddress.fullName),
        email: requestedCustomerEmail,
        phone: sanitizeText(user.phone || finalAddress.phone),
      },
    },
  };
};

const placeOrder = async (req, res) => {
  try {
    const paymentMethod = req.body?.paymentMethod || "cod";
    const paymentStatus = req.body?.paymentStatus || "pending";

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const { data, error } = await buildOrderInput(req);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const order = await Order.create({
      ...data,
      paymentMethod,
      paymentStatus,
    });

    try {
      await applyInventoryChanges({
        items: order.items,
        action: "reserve",
      });

      order.inventoryReserved = true;
      order.inventoryAdjustedAt = new Date();
      await order.save();
    } catch (inventoryError) {
      await Order.findByIdAndDelete(order._id).catch(() => null);
      throw inventoryError;
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to place order",
    });
  }
};

const createStripeCheckoutSession = async (req, res) => {
  try {
    if (!stripeClient) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured on server",
      });
    }

    const { data, error } = await buildOrderInput(req);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const order = await Order.create({
      ...data,
      paymentMethod: "stripe",
      paymentStatus: "pending",
    });

    let inventoryReserved = false;

    try {
      await applyInventoryChanges({
        items: order.items,
        action: "reserve",
      });
      inventoryReserved = true;

      order.inventoryReserved = true;
      order.inventoryAdjustedAt = new Date();
      await order.save();

      const lineItems = data.items.map((item) => {
        const productData = {
          name: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
        };

        if (isLikelyPublicUrl(item.image)) {
          productData.images = [item.image];
        }

        return {
          quantity: item.quantity,
          price_data: {
            currency: "inr",
            unit_amount: Math.round(Number(item.price) * 100),
            product_data: productData,
          },
        };
      });

      const clientBaseUrl = resolveClientBaseUrl(req);
      const encodedOrderNumber = encodeURIComponent(order.orderNumber);
      const session = await stripeClient.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        customer_email: data.customer.email || undefined,
        metadata: {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
        },
        success_url: `${clientBaseUrl}/success?orderId=${order._id}&orderNumber=${encodedOrderNumber}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientBaseUrl}/checkout?payment=cancelled&orderId=${order._id}&orderNumber=${encodedOrderNumber}`,
      });

      order.stripeSessionId = session.id || "";
      if (session.payment_intent) {
        order.stripePaymentIntentId = String(session.payment_intent);
      }
      await order.save();

      return res.status(201).json({
        success: true,
        message: "Stripe checkout initiated",
        sessionId: session.id,
        checkoutUrl: session.url,
        orderId: order._id,
        orderNumber: order.orderNumber,
      });
    } catch (error) {
      if (inventoryReserved) {
        await applyInventoryChanges({
          items: order.items,
          action: "release",
        }).catch(() => null);
      }

      await Order.findByIdAndDelete(order._id).catch(() => null);
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create Stripe checkout session",
    });
  }
};

const handleStripeWebhook = async (req, res) => {
  if (!stripeClient) {
    return res.status(500).send("Stripe is not configured");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadataOrderId = session?.metadata?.orderId;

      const filter =
        metadataOrderId && mongoose.Types.ObjectId.isValid(metadataOrderId)
          ? { _id: metadataOrderId }
          : { stripeSessionId: session?.id || "" };

      const order = await Order.findOne(filter);
      if (order) {
        if (!order.inventoryReserved) {
          await applyInventoryChanges({
            items: order.items,
            action: "reserve",
          });
          order.inventoryReserved = true;
          order.inventoryAdjustedAt = new Date();
        }

        if (order.status === "cancelled") {
          order.status = "placed";
        }

        order.paymentMethod = "stripe";
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        if (session?.id) {
          order.stripeSessionId = session.id;
        }
        if (session?.payment_intent) {
          order.stripePaymentIntentId = String(session.payment_intent);
        }
        await order.save();
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object;
      const metadataOrderId = session?.metadata?.orderId;

      const filter =
        metadataOrderId && mongoose.Types.ObjectId.isValid(metadataOrderId)
          ? { _id: metadataOrderId }
          : { stripeSessionId: session?.id || "" };

      const order = await Order.findOne({
        ...filter,
        paymentStatus: { $ne: "paid" },
      });

      if (order) {
        if (order.inventoryReserved) {
          await applyInventoryChanges({
            items: order.items,
            action: "release",
          });
          order.inventoryReserved = false;
          order.inventoryAdjustedAt = new Date();
        }

        order.paymentMethod = "stripe";
        order.paymentStatus = "failed";
        order.status = "cancelled";
        if (session?.id) {
          order.stripeSessionId = session.id;
        }
        await order.save();
      }
    }

    return res.json({ received: true });
  } catch {
    return res.status(500).send("Webhook handling failed");
  }
};

const getUserOrders = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.userId, isActive: true }).select("_id");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    const currentOrders = orders.filter((order) =>
      CURRENT_ORDER_STATUSES.includes(order.status)
    );
    const historyOrders = orders.filter((order) =>
      HISTORY_ORDER_STATUSES.includes(order.status)
    );

    return res.json({
      success: true,
      count: orders.length,
      currentOrders,
      historyOrders,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load user orders",
    });
  }
};

const cancelPendingStripeOrder = async (req, res) => {
  try {
    const orderId = sanitizeText(req.body?.orderId || req.query?.orderId);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid orderId is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
      paymentMethod: "stripe",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Stripe order not found",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "This order is already paid and can no longer be cancelled.",
      });
    }

    if (stripeClient && order.stripeSessionId) {
      await stripeClient.checkout.sessions.expire(order.stripeSessionId).catch(() => null);
    }

    if (order.inventoryReserved) {
      await applyInventoryChanges({
        items: order.items,
        action: "release",
      });
      order.inventoryReserved = false;
      order.inventoryAdjustedAt = new Date();
    }

    order.status = "cancelled";
    if (order.paymentStatus !== "refunded") {
      order.paymentStatus = "failed";
    }

    await order.save();

    return res.json({
      success: true,
      message: "Stripe checkout cancelled successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to cancel Stripe checkout",
    });
  }
};

const listOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch orders",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, paymentStatus } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId is required" });
    }

    const updates = {};

    if (status) {
      if (!ALLOWED_ORDER_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid order status" });
      }
      updates.status = status;
    }

    if (paymentStatus) {
      if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid payment status" });
      }
      updates.paymentStatus = paymentStatus;
      if (paymentStatus === "paid") {
        updates.paidAt = new Date();
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "At least one field (status/paymentStatus) is required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const nextStatus = updates.status || order.status;
    const isCancellingOrder = order.status !== "cancelled" && nextStatus === "cancelled";
    const isReopeningOrder = order.status === "cancelled" && nextStatus !== "cancelled";

    if (isCancellingOrder && order.inventoryReserved) {
      await applyInventoryChanges({
        items: order.items,
        action: "release",
      });
      updates.inventoryReserved = false;
      updates.inventoryAdjustedAt = new Date();
    }

    if (isReopeningOrder && !order.inventoryReserved) {
      await applyInventoryChanges({
        items: order.items,
        action: "reserve",
      });
      updates.inventoryReserved = true;
      updates.inventoryAdjustedAt = new Date();
    }

    Object.assign(order, updates);
    await order.save();

    return res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update order status",
    });
  }
};

const getOrderSummary = async (req, res) => {
  try {
    const [
      totalOrders,
      placedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      totalProducts,
      totalUsers,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: "placed" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]),
      Product.countDocuments({ isDeleted: false }),
      userModel.countDocuments({ isActive: true }),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .select("orderNumber amount status paymentStatus createdAt customer"),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return res.json({
      success: true,
      summary: {
        totalOrders,
        placedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        totalProducts,
        totalUsers,
      },
      recentOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load order summary",
    });
  }
};

export {
  cancelPendingStripeOrder,
  createStripeCheckoutSession,
  getOrderSummary,
  getUserOrders,
  handleStripeWebhook,
  listOrders,
  placeOrder,
  updateOrderStatus,
};
