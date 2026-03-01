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

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/NatureVibes`);
    await ensureProductSkuIndex();
    console.log("MongoDB is connected successfully ");
  } catch (error) {
    console.error("MongoDB Connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
