import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  descopeId: string;
  name: string;
  email: string;
  role: string;         // organizer | participant | vendor
  college: string;
  status: string;        // active | banned
  joinedAt: Date;
}

const UserSchema: Schema = new Schema({
  descopeId: { type: String, required: true, unique: true },
  name:      { type: String, default: "" },
  email:     { type: String, default: "" },
  role:      { type: String, default: "participant" },
  college:   { type: String, default: "" },
  status:    { type: String, default: "active" },
  joinedAt:  { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
