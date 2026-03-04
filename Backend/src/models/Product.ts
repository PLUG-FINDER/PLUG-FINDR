import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  vendor: Types.ObjectId;
  name: string;
  price?: number;
  currency?: string;
  description?: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "VendorProfile", required: true },
    name: { type: String, required: true },
    price: { type: Number },
    currency: { type: String, default: "₦" },
    description: { type: String },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);

