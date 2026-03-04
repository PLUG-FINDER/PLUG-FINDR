import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  vendor?: Types.ObjectId;
  product?: Types.ObjectId;
  student: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  isHidden: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "VendorProfile" },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    isHidden: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Validation: Either vendor or product must be provided, but not both
ReviewSchema.pre('validate', function(next) {
  if (!this.vendor && !this.product) {
    return next(new Error('Either vendor or product must be provided'));
  }
  if (this.vendor && this.product) {
    return next(new Error('Cannot review both vendor and product in the same review'));
  }
  next();
});

// Create indexes for efficient querying (not unique - students can review multiple times)
ReviewSchema.index({ student: 1, vendor: 1 }, { sparse: true, name: 'student_vendor_index' });
ReviewSchema.index({ student: 1, product: 1 }, { sparse: true, name: 'student_product_index' });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);



