import express, { Request, Response } from "express";
import { TripModel } from "../models/Trip";
import axios from "axios";

const router = express.Router();

// Helper: fetch coordinates from OpenStreetMap
async function geocodeDestination(destination: string) {
  try {
    const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: destination,
        format: "json",
        limit: 1,
      },
    });

    if (geoRes.data && geoRes.data.length > 0) {
      return {
        latitude: parseFloat(geoRes.data[0].lat),
        longitude: parseFloat(geoRes.data[0].lon),
      };
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return { latitude: null, longitude: null };
}

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
    const { destination, startDate, endDate, notes, latitude, longitude } = req.body;

    let finalLat = latitude;
    let finalLng = longitude;

    // Only geocode if lat/lng are not provided
    if ((latitude === undefined || latitude === null || latitude === "") &&
        (longitude === undefined || longitude === null || longitude === "")) {
      const geo = await geocodeDestination(destination);
      finalLat = geo.latitude;
      finalLng = geo.longitude;
    }

    const newTrip = new TripModel({
      destination,
      startDate,
      endDate,
      notes,
      latitude: finalLat,
      longitude: finalLng,
    });

    const savedTrip = await newTrip.save();
    res.json(savedTrip);
  } catch (err) {
    res.status(500).json({ error: "Failed to create trip" });
  }
});

// PUT update trip
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { destination, startDate, endDate, notes, latitude, longitude } = req.body;

    let updateData: any = { destination, startDate, endDate, notes };

    if (latitude !== undefined && longitude !== undefined) {
      // Manual override
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    } else if (destination) {
      // Destination changed → re-geocode
      const geo = await geocodeDestination(destination);
      updateData.latitude = geo.latitude;
      updateData.longitude = geo.longitude;
    }

    const updatedTrip = await TripModel.findByIdAndUpdate(req.params.id, updateData, {
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
