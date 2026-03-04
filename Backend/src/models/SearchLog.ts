import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISearchLog extends Document {
  user?: Types.ObjectId;
  query: string;
  filters?: Record<string, unknown>;
  createdAt: Date;
}

const SearchLogSchema = new Schema<ISearchLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    query: { type: String, required: true },
    filters: { type: Schema.Types.Mixed }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SearchLog = mongoose.model<ISearchLog>("SearchLog", SearchLogSchema);



