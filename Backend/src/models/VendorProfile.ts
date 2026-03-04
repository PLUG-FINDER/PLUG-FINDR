import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVendorProfile extends Document {
  user: Types.ObjectId;
  businessName: string;
  description?: string;
  category?: string;
  location?: string; // Custom hostel/location for Google Maps
  hostelName?: string; // Hall name - at least one of hostelName or location is required
  contactEmail?: string;
  contactPhone?: string;
  whatsapp?: string;
  instagram?: string;
  snapchat?: string;
  tiktok?: string;
  facebook?: string;
  twitter?: string;
  flyers: string[]; // image URLs
  approved: boolean;
  rejectedReason?: string;
  isMetaVerified: boolean;
  isFrozen: boolean; // If true, vendor is hidden from students
  viewCount: number; // Total number of times students viewed this vendor's details
  createdAt: Date;
  updatedAt: Date;
}

const VendorProfileSchema = new Schema<IVendorProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true },
    description: { 
      type: String, 
      required: true,
      minlength: [100, "Description must be at least 100 characters (approximately 2-3 lines)"]
    },
    category: { type: String },
    location: { type: String }, // Custom hostel/location for Google Maps
    hostelName: { type: String }, // Hall name - at least one of hostelName or location is required
    contactEmail: { type: String },
    contactPhone: { type: String },
    whatsapp: { type: String },
    instagram: { type: String },
    snapchat: { type: String },
    tiktok: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    flyers: [{ type: String }],
    approved: { type: Boolean, default: false },
    rejectedReason: { type: String },
    isMetaVerified: { type: Boolean, default: false },
    isFrozen: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Create sparse unique index to allow multiple null values (though user is required, this prevents index conflicts)
VendorProfileSchema.index({ user: 1 }, { unique: true, sparse: true });

export const VendorProfile = mongoose.model<IVendorProfile>("VendorProfile", VendorProfileSchema);



