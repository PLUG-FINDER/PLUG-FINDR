import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFeedback extends Document {
  createdBy: Types.ObjectId;
  vendorId?: Types.ObjectId; // For vendor-specific feedback
  category: "Bug Report" | "Feature Request" | "Improvement" | "Complaint" | "Praise" | "Other";
  message: string;
  contactPhone: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  adminReply?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "VendorProfile" }, // Only for vendor-specific feedback
    category: { 
      type: String, 
      enum: ["Bug Report", "Feature Request", "Improvement", "Complaint", "Praise", "Other"],
      required: true 
    },
    message: { type: String, required: true },
    contactPhone: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["PENDING", "IN_PROGRESS", "RESOLVED"], 
      default: "PENDING" 
    },
    adminReply: { type: String },
    repliedAt: { type: Date }
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>("Feedback", FeedbackSchema);




