import express, { Application, Request, Response } from "express";
import mongoose, { Document, Schema } from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Trip } from "../types/Trip";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Merge Trip type with Mongoose Document
export type TripDocument = Trip & Document;

const tripSchema = new Schema<TripDocument>({
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  notes: { type: String },
});

const TripModel = mongoose.model<TripDocument>("Trip", tripSchema);

// Routes
app.get("/trips", async (_req: Request, res: Response) => {
  try {
    const trips = await TripModel.find();
    res.json(trips);
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

app.post("/trips", async (req: Request, res: Response) => {
  try {
    const { destination, startDate, endDate, notes } = req.body as Trip;
    const newTrip = new TripModel({ destination, startDate, endDate, notes });
    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (err) {
    console.error("Error saving trips:", err);
    res.status(500).json({ error: "Failed to save trip" });
  }
});

// DB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
