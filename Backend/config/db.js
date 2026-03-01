//  THIS FILE HELPS TO CONNECT MONGODB TO DATABASE

import mongoose from "mongoose";

const ensureProductSkuIndex = async () => {
  try {
    const productsCollection = mongoose.connection.collection("products");
    const existingIndexes = await productsCollection.indexes();
    const skuIndex = existingIndexes.find((entry) => entry.name === "sku_1");

    const hasExpectedPartialUniqueIndex = Boolean(
      skuIndex &&
        skuIndex.unique === true &&
        skuIndex.partialFilterExpression &&
        skuIndex.partialFilterExpression.sku
    );

    if (skuIndex && !hasExpectedPartialUniqueIndex) {
      await productsCollection.dropIndex("sku_1");
      console.log("Dropped legacy sku_1 index from products collection");
    }

    const refreshedIndexes = await productsCollection.indexes();
    const nextSkuIndex = refreshedIndexes.find((entry) => entry.name === "sku_1");

    if (!nextSkuIndex) {
      await productsCollection.createIndex(
        { sku: 1 },
        {
          unique: true,
          partialFilterExpression: {
            sku: { $exists: true, $type: "string", $ne: "" },
          },
        }
      );
      console.log("Created partial unique sku_1 index for products collection");
    }
  } catch (error) {
    console.warn("Product SKU index migration warning:", error.message);
  }
};

let connectionPromise = null;
let skuIndexReady = false;

const resolveMongoUri = () => {
  const rawUri = (process.env.MONGODB_URI || "").trim();

  if (!rawUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  try {
    const parsedUri = new URL(rawUri);
    if (!parsedUri.pathname || parsedUri.pathname === "/") {
      parsedUri.pathname = "/NatureVibes";
    }
    return parsedUri.toString();
  } catch {
    if (/\/NatureVibes(?:\?|$)/.test(rawUri)) {
      return rawUri;
    }

    const [baseUri, queryString] = rawUri.split("?");
    const normalizedBase = baseUri.replace(/\/+$/, "");
    return queryString
      ? `${normalizedBase}/NatureVibes?${queryString}`
      : `${normalizedBase}/NatureVibes`;
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    if (!skuIndexReady) {
      await ensureProductSkuIndex();
      skuIndexReady = true;
    }
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = resolveMongoUri();

  connectionPromise = mongoose
    .connect(mongoUri)
    .then(async () => {
      if (!skuIndexReady) {
        await ensureProductSkuIndex();
        skuIndexReady = true;
      }
      console.log("MongoDB is connected successfully");
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error("MongoDB connection failed:", error.message);
      throw error;
    });

  return connectionPromise;
};

export default connectDB;
