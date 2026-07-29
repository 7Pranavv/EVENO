import mongoose, { Document, Schema } from "mongoose";

export interface IVendorService extends Document {
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

const VendorServiceSchema = new Schema<IVendorService>(
  {
    vendorId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IVendorService>("VendorService", VendorServiceSchema);