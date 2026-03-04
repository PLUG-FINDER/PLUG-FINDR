import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { UserRole } from "../utils/jwt";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  whatsappNumber?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  firebaseUID?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    whatsappNumber: { type: String },
    role: {
      type: String,
      enum: ["STUDENT", "VENDOR", "ADMIN"],
      default: "STUDENT",
      required: true
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    firebaseUID: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) {
    throw new Error("Password not available for comparison");
  }
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);



