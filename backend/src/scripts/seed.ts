// Populates the database with realistic sample data for demos and local
// development.
//
//   npm run seed                          # wipe demo data, insert a fresh set
//   npm run seed -- --as you@example.com  # ...and hand the matching demo role
//                                         #    to your real signed-in account
//   npm run seed:reset                    # remove demo data, leave real data
//
// Everything written here carries `demo: true`, so a reset removes exactly the
// sample records and never touches anything a real user created. All the
// people, colleges and vendors in the sample set are fictional.
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import User from "../models/User";
import Event from "../models/Event";
import Registration from "../models/Registration";
import VendorService from "../models/VendorService";
import { buildSeedDocuments, PRIMARY_FOR_ROLE, BuildOptions } from "./buildSeed";

const clearDemoData = async () => {
  const [registrations, events, services, users] = await Promise.all([
    Registration.deleteMany({ demo: true }),
    Event.deleteMany({ demo: true }),
    VendorService.deleteMany({ demo: true }),
    User.deleteMany({ demo: true }),
  ]);

  return {
    registrations: registrations.deletedCount ?? 0,
    events:        events.deletedCount ?? 0,
    services:      services.deletedCount ?? 0,
    users:         users.deletedCount ?? 0,
  };
};

const resolveClaim = async (email: string): Promise<BuildOptions> => {
  const realUser = await User.findOne({ email });
  if (!realUser) {
    throw new Error(
      `No account with email ${email}. Sign up in the app first, then re-run with --as.`
    );
  }

  const claimedKey = PRIMARY_FOR_ROLE[realUser.role];
  if (!claimedKey) {
    console.log(`Role "${realUser.role}" has no demo identity to claim — seeding sample data only.`);
    return {};
  }

  console.log(`Assigning the demo ${realUser.role} records to ${email}.`);
  return {
    claimedKey,
    claimedDescopeId: realUser.descopeId,
    claimedName:      realUser.name || realUser.email,
  };
};

const main = async () => {
  const args = process.argv.slice(2);
  const resetOnly = args.includes("--reset");
  const asIndex = args.indexOf("--as");
  const claimEmail = asIndex !== -1 ? args[asIndex + 1] : undefined;

  if (asIndex !== -1 && !claimEmail) {
    console.error("--as needs an email address, e.g. --as you@example.com");
    process.exit(1);
  }

  await connectDB();

  try {
    const removed = await clearDemoData();
    console.log(
      `Removed demo data: ${removed.events} events, ${removed.registrations} registrations, ` +
      `${removed.services} services, ${removed.users} users.`
    );

    if (resetOnly) {
      console.log("Reset complete. Real data untouched.");
      return;
    }

    const options = claimEmail ? await resolveClaim(claimEmail) : {};
    const docs = buildSeedDocuments(options);

    // Order matters only for readability here — nothing references a user row.
    await User.insertMany(docs.users);
    await VendorService.insertMany(docs.services);
    await Event.insertMany(docs.events);
    await Registration.insertMany(docs.registrations);

    console.log(
      `Seeded: ${docs.events.length} events, ${docs.registrations.length} registrations, ` +
      `${docs.services.length} vendor services, ${docs.users.length} users.`
    );
    console.log("All sample records are fictional and tagged demo:true — remove them with `npm run seed:reset`.");
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
  mongoose.disconnect();
});
