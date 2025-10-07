import { useEffect, useState, FormEvent, useRef } from "react";
import { Trip } from "../../../types/Trip";
import axios from "axios";

interface TripFormProps {
  onAddTrip: (formData: Omit<Trip, "_id">) => void;
  onUpdateTrip: (trip: Trip) => void;
  editingTrip: Trip | null;
  setEditingTrip: (trip: Trip | null) => void;
}

export default function TripForm({
  onAddTrip,
  onUpdateTrip,
  editingTrip,
  setEditingTrip,
}: TripFormProps) {
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    notes: "",
    latitude: "",
    longitude: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "failed" | "success">("idle");

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialDestination = useRef<string | null>(null);

  // sync form with editingTrip
  useEffect(() => {
    if (editingTrip) {
      setFormData({
        destination: editingTrip.destination,
        startDate: new Date(editingTrip.startDate).toISOString().split("T")[0],
        endDate: new Date(editingTrip.endDate).toISOString().split("T")[0],
        notes: editingTrip.notes || "",
        latitude: editingTrip.latitude?.toString() || "",
        longitude: editingTrip.longitude?.toString() || "",
      });
      initialDestination.current = editingTrip.destination;
    } else {
      setFormData({
        destination: "",
        startDate: "",
        endDate: "",
        notes: "",
        latitude: "",
        longitude: "",
      });
      initialDestination.current = null;
    }
  }, [editingTrip]);

  // Auto geocode destination when editing if changed
  useEffect(() => {
    if (!editingTrip) return;

    const dest = formData.destination.trim();
    if (!dest || dest === initialDestination.current) return;

    // debounce geocoding
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        setGeoStatus("loading");
        const res = await axios.get("https://nominatim.openstreetmap.org/search", {
          params: { q: dest, format: "json", limit: 1 },
        });

        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            latitude: data[0].lat,
            longitude: data[0].lon,
          }));
          setGeoStatus("success");
        } else {
          setGeoStatus("failed");
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setGeoStatus("failed");
      }
    }, 600);
  }, [formData.destination, editingTrip]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // date validation
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    setError(null);

    const formattedData = {
      destination: formData.destination,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      notes: formData.notes,
    };

    if (editingTrip) {
      // Allow manual lat/lon edits only here
      const parsedLatitude = formData.latitude ? parseFloat(formData.latitude) : editingTrip.latitude;
      const parsedLongitude = formData.longitude ? parseFloat(formData.longitude) : editingTrip.longitude;

      onUpdateTrip({
        ...editingTrip,
        ...formattedData,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      });
      setEditingTrip(null);
    } else {
      // Add new, no need to include lat/lon — backend will geocode
      onAddTrip({
        ...formattedData,
      } as Omit<Trip, "_id">);
    }

    // Reset form after submit
    setFormData({
      destination: "",
      startDate: "",
      endDate: "",
      notes: "",
      latitude: "",
      longitude: "",
    });
    setGeoStatus("idle");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 p-4 rounded-lg shadow ${
        editingTrip ? "bg-yellow-50 mt-6" : "bg-gray-50"
      }`}
    >
      {editingTrip && (
        <h2 className="text-xl font-semibold text-yellow-600">Edit Trip</h2>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder="Destination"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          className="p-2 border rounded w-full"
          required
        />
        {geoStatus === "loading" && (
          <span className="absolute right-3 top-2 text-gray-400 text-sm italic">
            Geocoding…
          </span>
        )}
        {geoStatus === "failed" && (
          <span className="absolute right-3 top-2 text-red-500 text-sm italic">
            Not found
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          className="p-2 border rounded w-1/2"
          required
        />
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          className="p-2 border rounded w-1/2"
          required
        />
      </div>

      <textarea
        placeholder="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="p-2 border rounded"
      />

      {/* Latitude & Longitude fields */}
      {editingTrip && (
        <>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="p-2 border rounded w-1/2"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="p-2 border rounded w-1/2"
            />
          </div>
          <p className="text-xs text-gray-500">
            You can manually adjust coordinates if geocoding was inaccurate.
          </p>
        </>
      )}

      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className={`font-semibold py-2 rounded flex-1 ${
            editingTrip
              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
              : "bg-blue-500 hover:bg-blue-700 text-white"
          }`}
        >
          {editingTrip ? "Save" : "Add Trip"}
        </button>
        {editingTrip && (
          <button
            type="button"
            onClick={() => setEditingTrip(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
