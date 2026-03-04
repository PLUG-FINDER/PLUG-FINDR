import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/User";

dotenv.config();

const listUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not found in environment variables");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Get all users
    const users = await User.find({}).select('email name role createdAt').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log("📋 No users found in database");
    } else {
      console.log(`📋 Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error listing users:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

listUsers();


