/**
 * Script to remove unique constraints from Review indexes
 * This allows students to review vendors/products multiple times
 * 
 * Run this once: ts-node src/utils/removeReviewUniqueIndexes.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Review } from "../models/Review";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function removeUniqueIndexes() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    const reviewCollection = Review.collection;
    
    // Get all indexes
    const indexes = await reviewCollection.indexes();
    console.log("📋 Current Review indexes:", indexes.map((idx: any) => idx.name));

    // Drop old unique indexes
    const indexesToDrop = ['student_vendor_unique', 'student_product_unique'];
    
    for (const indexName of indexesToDrop) {
      try {
        await reviewCollection.dropIndex(indexName);
        console.log(`✅ Dropped unique index: ${indexName}`);
      } catch (error: any) {
        if (error.codeName === "IndexNotFound" || error.code === 27) {
          console.log(`ℹ️  Index ${indexName} not found (already removed)`);
        } else {
          console.log(`⚠️  Could not drop index ${indexName}:`, error.message);
        }
      }
    }

    // Create new non-unique indexes for efficient querying
    try {
      await reviewCollection.createIndex({ student: 1, vendor: 1 }, { sparse: true, name: 'student_vendor_index' });
      console.log("✅ Created non-unique index on 'student' and 'vendor' fields");
    } catch (error: any) {
      if (error.code === 85) {
        console.log("ℹ️  Index already exists, dropping and recreating...");
        try {
          await reviewCollection.dropIndex('student_vendor_index');
          await reviewCollection.createIndex({ student: 1, vendor: 1 }, { sparse: true, name: 'student_vendor_index' });
          console.log("✅ Recreated vendor review index");
        } catch (err: any) {
          console.log("⚠️  Could not recreate vendor index:", err.message);
        }
      } else {
        console.log("⚠️  Vendor review index creation result:", error.message);
      }
    }

    try {
      await reviewCollection.createIndex({ student: 1, product: 1 }, { sparse: true, name: 'student_product_index' });
      console.log("✅ Created non-unique index on 'student' and 'product' fields");
    } catch (error: any) {
      if (error.code === 85) {
        console.log("ℹ️  Index already exists, dropping and recreating...");
        try {
          await reviewCollection.dropIndex('student_product_index');
          await reviewCollection.createIndex({ student: 1, product: 1 }, { sparse: true, name: 'student_product_index' });
          console.log("✅ Recreated product review index");
        } catch (err: any) {
          console.log("⚠️  Could not recreate product index:", err.message);
        }
      } else {
        console.log("⚠️  Product review index creation result:", error.message);
      }
    }

    // Verify final Review indexes
    const finalIndexes = await reviewCollection.indexes();
    console.log("📋 Final Review indexes:", finalIndexes.map((idx: any) => idx.name));

    console.log("\n✅ Review index migration completed successfully");
    console.log("✅ Students can now review vendors and products multiple times");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error removing unique indexes:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

removeUniqueIndexes();

