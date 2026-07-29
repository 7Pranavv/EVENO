// import mongoose, { Document, Schema } from "mongoose";
 
// export interface IRegistration extends Document {
//   participantName: string;
//   eventId: mongoose.Types.ObjectId;
//   eventTitle: string;
//   amount: number;
//   vendorId?: string;        // ← YEH ADD KARO (optional hai)
//   status?: string;          // ← YEH BHI ADD KARO (pending/confirmed)
//   registeredAt: Date;
// }
 
// const RegistrationSchema: Schema = new Schema(
//   {
//     participantName: { type: String, required: true },
//     eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
//     eventTitle: { type: String, required: true },
//     amount: { type: Number, required: true },
//     vendorId: { type: String },           // ← YEH ADD KARO
//     status: { type: String, default: "pending" }, // ← YEH BHI ADD KARO
//     registeredAt: { type: Date, default: Date.now },
//   }
// );
 
// export default mongoose.model<IRegistration>("Registration", RegistrationSchema);

import mongoose, { Document, Schema } from "mongoose";

export interface IRegistration extends Document {
  participantName: string;
  participantId?: string;   // Descope user id of the registrant
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  amount: number;
  vendorId?: string;
  status?: string;          // pending | accepted | rejected
  orderId?: string;         // Razorpay Order ID
  paymentId?: string;       // Razorpay Payment ID
  paymentStatus?: string;   // unpaid | paid | failed
  withdrawn?: boolean;      // vendor payout already withdrawn
  registeredAt: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    participantName: { type: String, required: true },
    participantId: { type: String },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    eventTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    vendorId: { type: String },
    status: { type: String, default: "pending" },
    orderId: { type: String, default: "" },         // ← ADDED
    paymentId: { type: String, default: "" },       // ← ADDED
    paymentStatus: { type: String, default: "unpaid" }, // ← ADDED
    withdrawn: { type: Boolean, default: false },
    registeredAt: { type: Date, default: Date.now },
  }
);

export default mongoose.model<IRegistration>("Registration", RegistrationSchema);