import express, { Request, Response } from "express";
import { TripModel } from "../models/Trip";

const router = express.Router();

// GET all trips
router.get("/", async (_req: Request, res: Response) => {
  try {
    const trips = await TripModel.find();
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

// POST new trip
router.post("/", async (req: Request, res: Response) => {
  try {
    const newTrip = new TripModel(req.body);
    const savedTrip = await newTrip.save();
    res.json(savedTrip);
  } catch (err) {
    res.status(500).json({ error: "Failed to create trip" });
  }
});

// PUT update trip
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const updatedTrip = await TripModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTrip) return res.status(404).json({ error: "Trip not found" });
    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: "Failed to update trip" });
  }
});

// DELETE trip
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deletedTrip = await TripModel.findByIdAndDelete(req.params.id);
    if (!deletedTrip) return res.status(404).json({ error: "Trip not found" });
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

export default router;
