import mongoose, { Schema, Document } from "mongoose";
import { Trip } from "../../types/Trip";

export interface ITrip extends Omit<Trip, "_id">, Document {}

const tripSchema = new Schema<ITrip>({
  destination: { 
    type: String,
    required: [true, "Destination is required"],
    trim: true,
  },
  startDate: { 
    type: Date,
    required: [true, "Start date is required"], 
  },
  endDate: { 
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function (this: ITrip, value: Date) {
        return !this.startDate || value >= this.startDate;
      },
      message: "End date must be after or equal to start date",
    },
   },
  notes: { 
    type: String,
    maxlength: [500, "Notes cannot exceed 500 characters"],
   },
});

export const TripModel = mongoose.model<ITrip>("Trip", tripSchema);
