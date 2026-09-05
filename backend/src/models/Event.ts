import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  date: string;
  location: string;
  totalSeats: number;
  availableSeats: number;
  description: string;
  price: number;
  category: string;
  vendorId: string;
  organizerId: string;
  disbursed: boolean;
  demo: boolean;
}

const EventSchema: Schema = new Schema(
  {
    title:          { type: String, required: true },
    date:           { type: String, required: true },
    location:       { type: String, required: true },
    totalSeats:     { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, required: true, min: 0 },

    description:  { type: String, default: "" },
    price:        { type: Number, default: 0, min: 0 },
    category:     { type: String, default: "" },
    vendorId:     { type: String, default: "" },
    organizerId:  { type: String, default: "", index: true },
    disbursed:    { type: Boolean, default: false },
    // Written only by the seed script — see VendorService for why.
    demo:         { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>("Event", EventSchema);
