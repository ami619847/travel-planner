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

    const data = geoRes.data;

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];

      // check if the display_name contains the query (basic relevance check)
      const isRelevant =
        destination.length > 2 &&
        result.display_name.toLowerCase().includes(destination.toLowerCase());

      if (isRelevant) {
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          failed: false,
        };
      }
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return { latitude: null, longitude: null, failed: true };
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
    let geocodingFailed = false;

    // Only geocode if lat/lng are not provided
    if ((latitude === undefined || latitude === null || latitude === "") &&
        (longitude === undefined || longitude === null || longitude === "")) {
      const geo = await geocodeDestination(destination);
      finalLat = geo.latitude;
      finalLng = geo.longitude;
      geocodingFailed = geo.failed ?? false;

      if (geocodingFailed) {
        return res.status(400).json({
          error: `Could not geocode destination "${destination}". Please enter valid coordinates manually.`,
        });
      }
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
    res.json({ ...savedTrip.toObject(), geocodingFailed });
  } catch (err) {
    console.error("Error creating trip:", err);
    res.status(500).json({ error: "Failed to create trip" });
  }
});

// PUT update trip
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { destination, startDate, endDate, notes, latitude, longitude } = req.body;

    let updateData: any = { destination, startDate, endDate, notes };
    let geocodingFailed = false;

    if (latitude !== undefined && longitude !== undefined) {
      // Manual override
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    } else if (destination) {
      // Destination changed → re-geocode
      const geo = await geocodeDestination(destination);
      updateData.latitude = geo.latitude;
      updateData.longitude = geo.longitude;
      geocodingFailed = geo.failed ?? false;

      if (geocodingFailed) {
        return res.status(400).json({
          error: `Could not geocode destination "${destination}". Please enter valid coordinates manually.`,
        });
      }
    }

    const updatedTrip = await TripModel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedTrip) return res.status(404).json({ error: "Trip not found" });
    res.json({ ...updatedTrip.toObject(), geocodingFailed });
  } catch (err) {
    console.error("Error updating trip:", err);
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
