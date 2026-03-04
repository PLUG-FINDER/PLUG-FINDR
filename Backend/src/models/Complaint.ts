import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComplaint extends Document {
  reporter: Types.ObjectId;
  targetVendor?: Types.ObjectId;
  targetReview?: Types.ObjectId;
  reason: string;
  contactPhone: string;
  resolved: boolean;
  status: "PENDING" | "FORWARDED" | "RESOLVED";
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetVendor: { type: Schema.Types.ObjectId, ref: "VendorProfile" },
    targetReview: { type: Schema.Types.ObjectId, ref: "Review" },
    reason: { type: String, required: true },
    contactPhone: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    status: { type: String, enum: ["PENDING", "FORWARDED", "RESOLVED"], default: "PENDING" }
  },
  { timestamps: true }
);

export const Complaint = mongoose.model<IComplaint>("Complaint", ComplaintSchema);

