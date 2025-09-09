import mongoose, { Schema, Document } from "mongoose";
import { Trip } from "../../types/Trip";

export interface ITrip extends Omit<Trip, "_id">, Document {}

const tripSchema = new Schema<ITrip>({
  destination: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  notes: { type: String },
});

export const TripModel = mongoose.model<ITrip>("Trip", tripSchema);
