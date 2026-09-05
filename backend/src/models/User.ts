import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  descopeId: string;
  name: string;
  email: string;
  role: string;         // organizer | participant | vendor | admin
  college: string;
  status: string;        // active | banned
  joinedAt: Date;
  demo: boolean;
}

const UserSchema: Schema = new Schema({
  descopeId: { type: String, required: true, unique: true },
  name:      { type: String, default: "" },
  email:     { type: String, default: "" },
  role:      { type: String, enum: ["organizer", "participant", "vendor", "admin"], default: "participant" },
  college:   { type: String, default: "" },
  status:    { type: String, enum: ["active", "banned"], default: "active" },
  joinedAt:  { type: Date, default: Date.now },
  // Written only by the seed script — see VendorService for why.
  demo:      { type: Boolean, default: false, index: true },
});

export default mongoose.model<IUser>("User", UserSchema);
