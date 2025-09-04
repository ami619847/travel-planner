import mongoose from "mongoose";
import dotenv from "dotenv";
import { Trip } from "../types/Trip";
import { TripModel } from "./server";

dotenv.config();

const seedTrips: Trip[] = [
  {
    destination: "Amsterdam",
    startDate: new Date("2025-09-15"),
    endDate: new Date("2025-09-20"),
    notes: "Vacation",
  },
  {
    destination: "Barcelona",
    startDate: new Date("2025-10-05"),
    endDate: new Date("2025-10-12"),
    notes: "Vacation to recharge",
  },
  {
    destination: "Tokyo",
    startDate: new Date("2026-01-10"),
    endDate: new Date("2026-01-25"),
    notes: "Dream trip",
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    await TripModel.deleteMany({});
    console.log("Cleared old trips");

    await TripModel.insertMany(seedTrips);
    console.log("Seeded trips successfully");

    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Error seeding data:", err);
  }
};

run();
