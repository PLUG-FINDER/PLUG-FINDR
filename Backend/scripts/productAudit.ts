/**
 * Product and Vendor Audit Script
 * Diagnoses product-vendor relationships
 */

import mongoose from "mongoose";
import { VendorProfile } from "../src/models/VendorProfile";
import { Product } from "../src/models/Product";
import path from "path";

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const main = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not configured in .env");
    }

    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB\n");

    // Get product statistics
    console.log("=== PRODUCT & VENDOR RELATIONSHIP AUDIT ===\n");

    const totalProducts = await Product.countDocuments();
    console.log(`Total Products in Database: ${totalProducts}`);

    if (totalProducts === 0) {
      console.log("\n⚠️  No products found in database!\n");
    } else {
      // Show sample products
      const sampleProducts = await Product.find().limit(5).select("name vendor price");
      console.log("\nSample Products:");
      sampleProducts.forEach((prod) => {
        console.log(`  - ${prod.name} (Vendor: ${prod.vendor})`);
      });
    }

    // Get vendor information
    const vendors = await VendorProfile.find({}).select("_id businessName user approved");
    console.log(`\n\nApproved Vendors: ${vendors.length}`);

    if (vendors.length > 0) {
      console.log("\nVendor Details:");
      for (const vendor of vendors) {
        const productCount = await Product.countDocuments({ vendor: vendor._id });
        console.log(`  
ID: ${vendor._id}
  - Business: ${vendor.businessName}
  - User ID: ${vendor.user}
  - Status: ${vendor.approved ? "Approved" : "Pending"}
  - Products: ${productCount}`);
      }
    }

    // Check for products with orphaned vendor references
    console.log("\n\n=== ORPHANED DATA CHECK ===\n");

    const vendorIds = vendors.map((v) => v._id);
    const orphanedProducts = await Product.countDocuments({
      vendor: { $nin: vendorIds },
    });

    console.log(`Products with Invalid Vendor References: ${orphanedProducts}`);

    if (orphanedProducts > 0) {
      const samples = await Product.find({ vendor: { $nin: vendorIds } })
        .limit(3)
        .select("name vendor");
      console.log("Sample orphaned products:");
      samples.forEach((prod) => {
        console.log(`  - ${prod.name} (Vendor ID: ${prod.vendor})`);
      });
    }

    console.log("\n✓ Audit complete");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

main();
