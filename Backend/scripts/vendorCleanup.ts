/**
 * Vendor Data Cleanup and Diagnostics Utility
 * Helps identify and clean up test/invalid vendor records
 * 
 * Usage: npx ts-node scripts/vendorCleanup.ts
 */

import mongoose from "mongoose";
import { VendorProfile } from "../src/models/VendorProfile";
import { User } from "../src/models/User";
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

    // Get vendor statistics
    console.log("=== VENDOR DATA DIAGNOSTICS ===\n");

    const totalVendors = await VendorProfile.countDocuments();
    const approvedVendors = await VendorProfile.countDocuments({ approved: true, isFrozen: false });
    const pendingVendors = await VendorProfile.countDocuments({ approved: false });
    const frozenVendors = await VendorProfile.countDocuments({ isFrozen: true });

    console.log(`Total Vendors: ${totalVendors}`);
    console.log(`├─ Approved & Active: ${approvedVendors}`);
    console.log(`├─ Pending Approval: ${pendingVendors}`);
    console.log(`└─ Frozen: ${frozenVendors}`);
    console.log();

    // Get vendors with products vs without
    const vendorsWithProducts = await Product.aggregate([
      { $group: { _id: "$vendorId" } },
    ]);

    const orphanedVendors = totalVendors - vendorsWithProducts.length;
    console.log(`Vendors with Products: ${vendorsWithProducts.length}`);
    console.log(`Vendors without Products: ${orphanedVendors}`);
    console.log();

    // Check for vendors with invalid user references
    const validUserIds = await User.distinct("_id");
    const invalidUserVendors = await VendorProfile.find({
      user: { $nin: validUserIds },
    });

    console.log(`Vendors with Invalid User References: ${invalidUserVendors.length}`);
    console.log();

    // Show list of approved vendors
    const approvedList = await VendorProfile.find(
      { approved: true, isFrozen: false },
      { businessName: 1, user: 1, createdAt: 1 }
    ).populate("user", "email");

    console.log("=== APPROVED & ACTIVE VENDORS ===\n");
    if (approvedList.length === 0) {
      console.log("No approved vendors found\n");
    } else {
      approvedList.forEach((vendor, index) => {
        console.log(`${index + 1}. ${vendor.businessName}`);
        console.log(`   User: ${(vendor.user as any)?.email || "Unknown"}`);
        console.log(`   Created: ${vendor.createdAt?.toLocaleDateString()}\n`);
      });
    }

    // Cleanup options
    console.log("=== CLEANUP OPTIONS ===\n");
    const args = process.argv.slice(2);

    if (args.includes("--remove-unapproved")) {
      const result = await VendorProfile.deleteMany({ approved: false });
      console.log(`✓ Removed ${result.deletedCount} unapproved vendors\n`);
    } else if (args.includes("--remove-orphaned")) {
      const vendorIds = vendorsWithProducts.map((v) => v._id);
      const result = await VendorProfile.deleteMany({
        _id: { $nin: vendorIds },
        approved: true,
      });
      console.log(`✓ Removed ${result.deletedCount} vendors without products\n`);
    } else if (args.includes("--remove-invalid")) {
      const validUserIds = await User.distinct("_id");
      const result = await VendorProfile.deleteMany({
        user: { $nin: validUserIds },
      });
      console.log(`✓ Removed ${result.deletedCount} vendors with invalid user references\n`);
    } else {
      console.log("Available cleanup commands:");
      console.log(
        "  npx ts-node scripts/vendorCleanup.ts --remove-unapproved    (Remove all pending/rejected vendors)"
      );
      console.log(
        "  npx ts-node scripts/vendorCleanup.ts --remove-orphaned       (Remove active vendors without products)"
      );
      console.log(
        "  npx ts-node scripts/vendorCleanup.ts --remove-invalid        (Remove vendors with invalid user refs)"
      );
    }

    console.log("\n✓ Diagnostics complete");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

main();
