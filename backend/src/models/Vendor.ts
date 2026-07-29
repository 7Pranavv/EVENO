import mongoose, { Document, Schema } from "mongoose";

export interface IVendor extends Document {
  name: string;
  email: string;
  phone: string;
  category: string; // e.g. "Catering", "Photography", "Decor"
  revenue: number;
  createdAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    category: { type: String, required: true },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IVendor>("Vendor", VendorSchema);