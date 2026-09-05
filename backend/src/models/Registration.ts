import mongoose, { Document, Schema } from "mongoose";

export interface IRegistration extends Document {
  participantName: string;
  participantId?: string;   // Descope user id of the registrant
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  amount: number;
  vendorId?: string;
  isHireRequest?: boolean;  // organizer→vendor request rather than an attendee signup
  seatClaimed?: boolean;    // this row currently holds one of the event's seats
  status?: string;          // pending | accepted | rejected
  orderId?: string;         // Razorpay Order ID
  paymentId?: string;       // Razorpay Payment ID
  paymentStatus?: string;   // unpaid | paid | failed
  withdrawn?: boolean;      // vendor payout already withdrawn
  registeredAt: Date;
  demo?: boolean;
}

const RegistrationSchema: Schema = new Schema({
  participantName: { type: String, required: true },
  participantId:   { type: String, index: true },
  eventId:         { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  eventTitle:      { type: String, required: true },
  amount:          { type: Number, required: true },
  vendorId:        { type: String, index: true },
  isHireRequest:   { type: Boolean, default: false },
  seatClaimed:     { type: Boolean, default: false },
  status:          { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  orderId:         { type: String, default: "" },
  paymentId:       { type: String, default: "" },
  paymentStatus:   { type: String, enum: ["unpaid", "paid", "failed"], default: "unpaid" },
  withdrawn:       { type: Boolean, default: false },
  registeredAt:    { type: Date, default: Date.now },
  // Written only by the seed script — see VendorService for why.
  demo:            { type: Boolean, default: false, index: true },
});

export default mongoose.model<IRegistration>("Registration", RegistrationSchema);
