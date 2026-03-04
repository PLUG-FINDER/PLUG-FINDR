/**
 * Migration script to fix database index issues
 * - Fixes vendor profile index (drops old userId_1, creates sparse user_1)
 * - Fixes review index (drops old studentId_1_vendorId_1, creates sparse student_1_vendor_1)
 * 
 * Usage: ts-node src/utils/fixVendorIndex.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { VendorProfile } from "../models/VendorProfile";
import { Review } from "../models/Review";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function fixIndex() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    const collection = VendorProfile.collection;
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log("📋 Current indexes:", indexes.map(idx => idx.name));

    // Drop old userId_1 index if it exists
    try {
      await collection.dropIndex("userId_1");
      console.log("✅ Dropped old userId_1 index");
    } catch (error: any) {
      if (error.codeName === "IndexNotFound") {
        console.log("ℹ️  userId_1 index not found (already removed)");
      } else {
        console.log("⚠️  Could not drop userId_1 index:", error.message);
      }
    }

    // Ensure the correct sparse unique index on 'user' exists
    try {
      await collection.createIndex({ user: 1 }, { unique: true, sparse: true });
      console.log("✅ Created/verified sparse unique index on 'user' field");
    } catch (error: any) {
      console.log("⚠️  Index creation result:", error.message);
    }

    // Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log("📋 Final VendorProfile indexes:", finalIndexes.map(idx => idx.name));

    // Fix Review indexes
    console.log("\n🔧 Fixing Review indexes...");
    const reviewCollection = Review.collection;
    
    const reviewIndexes = await reviewCollection.indexes();
    console.log("📋 Current Review indexes:", reviewIndexes.map(idx => idx.name));

    // Drop old studentId_1_vendorId_1 index if it exists
    try {
      await reviewCollection.dropIndex("studentId_1_vendorId_1");
      console.log("✅ Dropped old studentId_1_vendorId_1 index");
    } catch (error: any) {
      if (error.codeName === "IndexNotFound") {
        console.log("ℹ️  studentId_1_vendorId_1 index not found (already removed)");
      } else {
        console.log("⚠️  Could not drop studentId_1_vendorId_1 index:", error.message);
      }
    }

    // Ensure the correct sparse compound unique index exists
    try {
      await reviewCollection.createIndex({ student: 1, vendor: 1 }, { unique: true, sparse: true });
      console.log("✅ Created/verified sparse compound unique index on 'student' and 'vendor' fields");
    } catch (error: any) {
      console.log("⚠️  Review index creation result:", error.message);
    }

    // Verify final Review indexes
    const finalReviewIndexes = await reviewCollection.indexes();
    console.log("📋 Final Review indexes:", finalReviewIndexes.map(idx => idx.name));

    console.log("\n✅ Index migration completed successfully");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing index:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixIndex();

