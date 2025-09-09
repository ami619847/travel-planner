import { useEffect, useState, FormEvent } from "react" ;
import './App.css'
import { getTrips, postTrip, deleteTrip, updateTrip } from "./api";
import { Trip } from "../../types/Trip";

function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  useEffect(() => {
    getTrips()
      .then((res) => setTrips(res.data))
      .catch((err) => console.error("Error fetching trips:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const tripData = {
        ...formData,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      const res = await postTrip(tripData);
      setTrips([...trips, res.data]);
      setFormData({ 
        destination: "",
        startDate: "",
        endDate: "",
        notes: "" 
      });
    } catch (err) {
      console.error("Error creating trip:", err);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await deleteTrip(id);
      setTrips(trips.filter((trip) => trip._id !== id));
    } catch (err) {
      console.error("Error deleting trip:", err);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
  e.preventDefault();
  if (!editingTrip) return;

  try {
    const res = await updateTrip(editingTrip._id!, editingTrip);
    setTrips(trips.map((t) => (t._id === editingTrip._id ? res.data : t)));
    setEditingTrip(null); // reset editing mode
  } catch (err) {
    console.error("Error updating trip:", err);
  }
};

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Travel Planner</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          name="destination"
          placeholder="Destination"
          value={formData.destination}
          onChange={handleChange}
          required
        />
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />
        <button type="submit">Add Trip</button>
      </form>

      <ul>
        {trips.map((trip) => (
          <li key={trip._id}>
            {editingTrip?._id === trip._id ? (
              <form onSubmit={handleUpdate}>
                <input
                  value={editingTrip?.destination || ""}
                  onChange={(e) =>
                    editingTrip && setEditingTrip({ ...editingTrip, destination: e.target.value })
                  }
                />
                <input
                  type="date"
                  value={editingTrip?.startDate
                    ? new Date(editingTrip.startDate).toISOString().split("T")[0]
                    : ""}
                  onChange={(e) =>
                    editingTrip && setEditingTrip({ ...editingTrip, startDate: e.target.value })
                  }
                />
                <input
                  type="date"
                  value={editingTrip?.endDate
                    ? new Date(editingTrip.endDate).toISOString().split("T")[0]
                    : ""}
                  onChange={(e) =>
                    editingTrip && setEditingTrip({ ...editingTrip, endDate: e.target.value })
                  }
                />
                <input
                  value={editingTrip?.notes || ""}
                  onChange={(e) =>
                    editingTrip && setEditingTrip({ ...editingTrip, notes: e.target.value })
                  }
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingTrip(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <strong>{trip.destination}</strong> ({trip.startDate} →{" "}
                {trip.endDate}) - {trip.notes}
                <button onClick={() => setEditingTrip(trip)}>Edit</button>
                <button onClick={() => handleDelete(trip._id!)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App
