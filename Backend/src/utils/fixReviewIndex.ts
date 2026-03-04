/**
 * Script to fix Review index issue
 * Drops old studentId_1_vendorId_1 index and ensures correct sparse index exists
 * 
 * Run this once: ts-node src/utils/fixReviewIndex.ts
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

async function fixReviewIndex() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    const reviewCollection = Review.collection;
    
    // Get all indexes
    const indexes = await reviewCollection.indexes();
    console.log("📋 Current Review indexes:", indexes.map((idx: any) => idx.name));

    // Drop old studentId_1_vendorId_1 index if it exists
    try {
      await reviewCollection.dropIndex("studentId_1_vendorId_1");
      console.log("✅ Dropped old studentId_1_vendorId_1 index");
    } catch (error: any) {
      if (error.codeName === "IndexNotFound" || error.code === 27) {
        console.log("ℹ️  studentId_1_vendorId_1 index not found (already removed)");
      } else {
        console.log("⚠️  Could not drop studentId_1_vendorId_1 index:", error.message);
      }
    }

    // Drop any other old indexes with wrong field names
    for (const index of indexes) {
      const indexName = (index as any).name;
      if (indexName && (indexName.includes('studentId') || indexName.includes('vendorId'))) {
        try {
          await reviewCollection.dropIndex(indexName);
          console.log(`✅ Dropped old index: ${indexName}`);
        } catch (error: any) {
          console.log(`⚠️  Could not drop index ${indexName}:`, error.message);
        }
      }
    }

    // Drop existing student_1_vendor_1 index if it exists (to recreate with sparse option)
    try {
      await reviewCollection.dropIndex("student_1_vendor_1");
      console.log("✅ Dropped existing student_1_vendor_1 index to recreate with sparse option");
    } catch (error: any) {
      if (error.codeName === "IndexNotFound" || error.code === 27) {
        console.log("ℹ️  student_1_vendor_1 index not found");
      } else {
        console.log("⚠️  Could not drop student_1_vendor_1 index:", error.message);
      }
    }

    // Ensure the correct sparse compound unique indexes exist
    try {
      await reviewCollection.createIndex({ student: 1, vendor: 1 }, { unique: true, sparse: true, name: 'student_vendor_unique' });
      console.log("✅ Created sparse compound unique index on 'student' and 'vendor' fields");
    } catch (error: any) {
      if (error.code === 85) {
        console.log("ℹ️  Index already exists with different options, recreating...");
        try {
          await reviewCollection.dropIndex('student_vendor_unique');
          await reviewCollection.createIndex({ student: 1, vendor: 1 }, { unique: true, sparse: true, name: 'student_vendor_unique' });
          console.log("✅ Recreated vendor review index with correct options");
        } catch (err: any) {
          console.log("⚠️  Could not recreate vendor index:", err.message);
        }
      } else {
        console.log("⚠️  Vendor review index creation result:", error.message);
      }
    }

    // Create product review index
    // First, ensure no reviews have both vendor and product as null (they should have at least one)
    try {
      const invalidReviews = await Review.find({ vendor: null, product: null });
      if (invalidReviews.length > 0) {
        console.log(`⚠️  Found ${invalidReviews.length} reviews with both vendor and product as null. These should be cleaned up.`);
        // Optionally delete invalid reviews or update them
        // For now, we'll just warn and continue
      }
    } catch (err: any) {
      console.log("⚠️  Could not check for invalid reviews:", err.message);
    }

    try {
      await reviewCollection.createIndex({ student: 1, product: 1 }, { unique: true, sparse: true, name: 'student_product_unique' });
      console.log("✅ Created sparse compound unique index on 'student' and 'product' fields");
    } catch (error: any) {
      if (error.code === 85) {
        console.log("ℹ️  Product index already exists with different options, recreating...");
        try {
          await reviewCollection.dropIndex('student_product_unique');
          await reviewCollection.createIndex({ student: 1, product: 1 }, { unique: true, sparse: true, name: 'student_product_unique' });
          console.log("✅ Recreated product review index with correct options");
        } catch (err: any) {
          console.log("⚠️  Could not recreate product index:", err.message);
          if (err.code === 11000) {
            console.log("⚠️  There may be duplicate product reviews. Please clean up the data first.");
          }
        }
      } else if (error.code === 11000) {
        console.log("⚠️  Product review index creation failed due to duplicate keys.");
        console.log("⚠️  This may be due to existing reviews. The index will be created when the duplicates are resolved.");
        console.log("⚠️  You can manually create the index later or clean up duplicate reviews.");
      } else {
        console.log("⚠️  Product review index creation result:", error.message);
      }
    }

    // Verify final Review indexes
    const finalIndexes = await reviewCollection.indexes();
    console.log("📋 Final Review indexes:", finalIndexes.map((idx: any) => idx.name));

    console.log("\n✅ Review index migration completed successfully");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing Review index:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixReviewIndex();

