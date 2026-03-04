/**
 * Script to check a specific vendor's images
 * Usage: ts-node src/utils/checkVendorImages.ts "Drew's Bite"
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { VendorProfile } from "../models/VendorProfile";
import { Product } from "../models/Product";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function checkVendor() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI as string);
    console.log("✅ Connected to MongoDB\n");

    const businessName = process.argv[2] || "Drew's Bite";
    console.log(`🔍 Searching for vendor: "${businessName}"\n`);

    const vendor = await VendorProfile.findOne({ 
      businessName: { $regex: new RegExp(businessName, 'i') } 
    });

    if (!vendor) {
      console.log(`❌ Vendor "${businessName}" not found`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log("=".repeat(60));
    console.log(`📋 Vendor Profile: ${vendor.businessName}`);
    console.log("=".repeat(60));
    console.log(`ID: ${vendor._id}`);
    console.log(`Status: ${vendor.approved ? 'APPROVED' : vendor.rejectedReason ? 'REJECTED' : 'PENDING'}`);
    console.log(`Created: ${vendor.createdAt}`);
    console.log(`\n📸 Flyers/Images (${vendor.flyers?.length || 0}):`);
    
    if (vendor.flyers && vendor.flyers.length > 0) {
      vendor.flyers.forEach((flyer, index) => {
        console.log(`  ${index + 1}. ${flyer}`);
        if (flyer.startsWith('/api/images/')) {
          console.log(`     ✅ GridFS URL (stored in MongoDB)`);
        } else if (flyer.startsWith('/uploads/')) {
          console.log(`     ⚠️  Old local file path (needs migration)`);
        } else {
          console.log(`     ❓ Unknown format`);
        }
      });
    } else {
      console.log("  ⚠️  No flyers/images found");
    }

    // Check products
    const products = await Product.find({ vendor: vendor._id });
    console.log(`\n🛍️  Products (${products.length}):`);
    
    if (products.length > 0) {
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`);
        console.log(`     Image: ${product.image}`);
        if (product.image?.startsWith('/api/images/')) {
          console.log(`     ✅ GridFS URL (stored in MongoDB)`);
        } else if (product.image?.startsWith('/uploads/')) {
          console.log(`     ⚠️  Old local file path (needs migration)`);
        } else {
          console.log(`     ❓ Unknown format`);
        }
      });
    } else {
      console.log("  ⚠️  No products found");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Check completed!");
    console.log("=".repeat(60));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkVendor();




