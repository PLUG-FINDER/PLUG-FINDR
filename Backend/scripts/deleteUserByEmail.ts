import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/User";
import { StudentProfile } from "../src/models/StudentProfile";
import { VendorProfile } from "../src/models/VendorProfile";
import { Review } from "../src/models/Review";
import { Complaint } from "../src/models/Complaint";
import { Feedback } from "../src/models/Feedback";
import { Product } from "../src/models/Product";
import admin from "../src/config/firebaseAdmin";

dotenv.config();

const deleteUserAndRelatedData = async (user: any, email: string) => {
  console.log(`\n📋 Found user:`);
  console.log(`   - ID: ${user._id}`);
  console.log(`   - Name: ${user.name}`);
  console.log(`   - Email: ${user.email}`);
  console.log(`   - Role: ${user.role}`);
  console.log(`   - Firebase UID: ${user.firebaseUID || "N/A"}`);

  // Delete from Firebase if UID exists
  if (user.firebaseUID && admin.apps.length > 0) {
    try {
      await admin.auth().deleteUser(user.firebaseUID);
      console.log("✅ User deleted from Firebase");
    } catch (firebaseError: any) {
      console.warn(`⚠️  Failed to delete from Firebase: ${firebaseError.message}`);
    }
  }

  // Delete related data based on role
  if (user.role === "STUDENT") {
    await Review.deleteMany({ student: user._id });
    await Complaint.deleteMany({ reporter: user._id });
    await Feedback.deleteMany({ createdBy: user._id });
    await StudentProfile.deleteMany({ user: user._id });
    console.log("✅ Deleted student-related data");
  } else if (user.role === "VENDOR") {
    const vendorProfile = await VendorProfile.findOne({ user: user._id });
    if (vendorProfile) {
      await Product.deleteMany({ vendor: vendorProfile._id });
      await Review.deleteMany({ vendor: vendorProfile._id });
      await Complaint.deleteMany({ targetVendor: vendorProfile._id });
      await Feedback.deleteMany({ vendorId: vendorProfile._id });
      await VendorProfile.findByIdAndDelete(vendorProfile._id);
      console.log("✅ Deleted vendor-related data");
    }
  }

  // Delete the user
  await User.findByIdAndDelete(user._id);
  console.log("✅ User deleted from MongoDB");

  console.log(`\n✅ Successfully deleted user: ${email}`);
};

const deleteUserByEmail = async (email: string) => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not found in environment variables");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Find user by email (case-insensitive search)
    let user = await User.findOne({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
    
    if (!user) {
      // Try exact lowercase match
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        console.log(`❌ User with email ${email} not found in database`);
        console.log(`   Searched for: ${email} and ${email.toLowerCase()}`);
        await mongoose.disconnect();
        process.exit(0);
      }
    }
    
    await deleteUserAndRelatedData(user, email);
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: npm run delete-user <email>");
  console.log("Example: npm run delete-user kojo17246@gmail.com");
  process.exit(1);
}

deleteUserByEmail(email);
