// import mongoose, { Document, Schema } from "mongoose";
 
// export interface IEvent extends Document {
//   title: string;
//   date: string;
//   location: string;
//   totalSeats: number;
//   availableSeats: number;
// }
 
// const EventSchema: Schema = new Schema(
//   {
//     title: { type: String, required: true },
//     date: { type: String, required: true },
//     location: { type: String, required: true },
//     totalSeats: { type: Number, required: true },
//     availableSeats: { type: Number, required: true },
//   },
//   { timestamps: true }
// );
 
// export default mongoose.model<IEvent>("Event", EventSchema);












import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  date: string;
  location: string;
  totalSeats: number;
  availableSeats: number;
  // ── New Fields ──
  description: string;
  price: number;
  category: string;
  vendorId: string;
  organizerId: string;
  disbursed: boolean;
}

const EventSchema: Schema = new Schema(
  {
    // ── Original Fields (unchanged) ──
    title:          { type: String, required: true },
    date:           { type: String, required: true },
    location:       { type: String, required: true },
    totalSeats:     { type: Number, required: true },
    availableSeats: { type: Number, required: true },

    // ── New Fields ──
    description:  { type: String, default: "" },
    price:        { type: Number, default: 0 },
    category:     { type: String, default: "" },
    vendorId:     { type: String, default: "" },   // ← Vendor link
    organizerId:  { type: String, default: "" },
    disbursed:    { type: Boolean, default: false },

  },
  { timestamps: true }
);

export default mongoose.model<IEvent>("Event", EventSchema);