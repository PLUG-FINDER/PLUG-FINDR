import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVendorView extends Document {
  vendor: Types.ObjectId;
  user: Types.ObjectId;
  viewedAt: Date;
}

const VendorViewSchema = new Schema<IVendorView>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "VendorProfile", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    viewedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

// Create unique compound index on (vendor, user) to ensure one view record per user per vendor
VendorViewSchema.index({ vendor: 1, user: 1 }, { unique: true });

export const VendorView = mongoose.model<IVendorView>("VendorView", VendorViewSchema);
