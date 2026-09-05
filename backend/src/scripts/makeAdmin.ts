// Grant the admin role. There is deliberately no UI or API path for this —
// /api/users/sync refuses "admin" — so the only way in is running this against
// the database directly.
//
//   npx ts-node src/scripts/makeAdmin.ts someone@example.com
//
import { connectDB } from "../config/db";
import User from "../models/User";
import mongoose from "mongoose";

const main = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: ts-node src/scripts/makeAdmin.ts <email>");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: "admin" } },
    { new: true }
  );

  if (!user) {
    console.error(`No user with email ${email}. They need to sign up first.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`${user.email} is now an admin.`);
  await mongoose.disconnect();
};

main();
