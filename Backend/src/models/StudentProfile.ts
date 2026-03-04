import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStudentProfile extends Document {
  user: Types.ObjectId;
  school?: string;
  major?: string;
  graduationYear?: number;
  hostelName?: string; // Hall/hostel name (e.g., "Unity Hall", "Katanga Hall")
  location?: string; // Custom location string
  latitude?: number; // Optional: for precise geolocation
  longitude?: number; // Optional: for precise geolocation
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    school: { type: String },
    major: { type: String },
    graduationYear: { type: Number },
    hostelName: { type: String }, // Hall/hostel name
    location: { type: String }, // Custom location
    latitude: { type: Number }, // GPS coordinates
    longitude: { type: Number } // GPS coordinates
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model<IStudentProfile>(
  "StudentProfile",
  StudentProfileSchema
);



