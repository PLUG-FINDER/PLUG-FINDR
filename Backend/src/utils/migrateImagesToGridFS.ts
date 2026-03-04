/**
 * Migration script to move existing local images to GridFS
 * This script:
 * 1. Finds all vendor profiles and products with old image paths (/uploads/flyers/...)
 * 2. Reads the local files
 * 3. Uploads them to GridFS
 * 4. Updates the database with new GridFS URLs
 * 
 * Usage: ts-node src/utils/migrateImagesToGridFS.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { VendorProfile } from "../models/VendorProfile";
import { Product } from "../models/Product";
import { uploadToGridFS } from "./gridfs";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function migrateImages() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    const uploadsDir = path.join(__dirname, "..", "uploads", "flyers");
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Migrate Vendor Profile Flyers
    console.log("\n📦 Migrating vendor profile flyers...");
    const vendors = await VendorProfile.find({});
    
    for (const vendor of vendors) {
      if (!vendor.flyers || vendor.flyers.length === 0) {
        continue;
      }

      const updatedFlyers: string[] = [];
      let vendorUpdated = false;

      for (const flyerUrl of vendor.flyers) {
        // Skip if already using GridFS
        if (flyerUrl.startsWith("/api/images/")) {
          updatedFlyers.push(flyerUrl);
          continue;
        }

        // Check if it's an old local file path
        if (flyerUrl.startsWith("/uploads/flyers/")) {
          const filename = path.basename(flyerUrl);
          const filePath = path.join(uploadsDir, filename);

          try {
            // Check if file exists
            if (fs.existsSync(filePath)) {
              console.log(`  📤 Migrating: ${filename}`);
              
              // Read file
              const fileBuffer = fs.readFileSync(filePath);
              
              // Determine content type
              const ext = path.extname(filename).toLowerCase();
              const contentType = 
                ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                ext === '.png' ? 'image/png' :
                ext === '.gif' ? 'image/gif' :
                ext === '.webp' ? 'image/webp' :
                'image/jpeg';

              // Upload to GridFS
              const fileId = await uploadToGridFS(fileBuffer, filename, contentType);
              const newUrl = `/api/images/${fileId}`;
              
              updatedFlyers.push(newUrl);
              vendorUpdated = true;
              migratedCount++;
              
              console.log(`  ✅ Migrated: ${filename} → ${newUrl}`);
            } else {
              console.log(`  ⚠️  File not found (skipping): ${filename}`);
              // Keep the old URL but mark as skipped
              updatedFlyers.push(flyerUrl);
              skippedCount++;
            }
          } catch (error: any) {
            console.error(`  ❌ Error migrating ${filename}:`, error.message);
            // Keep the old URL on error
            updatedFlyers.push(flyerUrl);
            errorCount++;
          }
        } else {
          // Unknown format, keep as is
          updatedFlyers.push(flyerUrl);
        }
      }

      // Update vendor if any flyers were migrated
      if (vendorUpdated) {
        await VendorProfile.updateOne(
          { _id: vendor._id },
          { $set: { flyers: updatedFlyers } }
        );
        console.log(`  ✅ Updated vendor: ${vendor.businessName}`);
      }
    }

    // Migrate Product Images
    console.log("\n📦 Migrating product images...");
    const products = await Product.find({});
    
    for (const product of products) {
      if (!product.image) {
        continue;
      }

      // Skip if already using GridFS
      if (product.image.startsWith("/api/images/")) {
        continue;
      }

      // Check if it's an old local file path
      if (product.image.startsWith("/uploads/flyers/")) {
        const filename = path.basename(product.image);
        const filePath = path.join(uploadsDir, filename);

        try {
          // Check if file exists
          if (fs.existsSync(filePath)) {
            console.log(`  📤 Migrating product image: ${filename}`);
            
            // Read file
            const fileBuffer = fs.readFileSync(filePath);
            
            // Determine content type
            const ext = path.extname(filename).toLowerCase();
            const contentType = 
              ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
              ext === '.png' ? 'image/png' :
              ext === '.gif' ? 'image/gif' :
              ext === '.webp' ? 'image/webp' :
              'image/jpeg';

            // Upload to GridFS
            const fileId = await uploadToGridFS(fileBuffer, filename, contentType);
            const newUrl = `/api/images/${fileId}`;
            
            // Update product
            await Product.updateOne(
              { _id: product._id },
              { $set: { image: newUrl } }
            );
            
            migratedCount++;
            console.log(`  ✅ Migrated product image: ${filename} → ${newUrl}`);
          } else {
            console.log(`  ⚠️  Product image not found (skipping): ${filename}`);
            skippedCount++;
          }
        } catch (error: any) {
          console.error(`  ❌ Error migrating product image ${filename}:`, error.message);
          errorCount++;
        }
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Migration Summary:");
    console.log(`  ✅ Successfully migrated: ${migratedCount} images`);
    console.log(`  ⚠️  Skipped (file not found): ${skippedCount} images`);
    console.log(`  ❌ Errors: ${errorCount} images`);
    console.log("=".repeat(50));

    console.log("\n✅ Migration completed!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateImages();




