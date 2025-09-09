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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Travel Planner</h1>

      {/* Add trip form */}
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg shadow"
      >
        <input
          type="text"
          className="p-2 border rounded"
          placeholder="Destination"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          required
        />
        <div className="flex gap-2">
          <input
            type="date"
            className="p-2 border rounded w-1/2"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
          <input
            type="date"
            className="p-2 border rounded w-1/2"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
        <textarea
          placeholder="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Add Trip
        </button>
      </form>

      {/* Edit trip form */}
      {editingTrip && (
        <form
          onSubmit={handleUpdate}
          className="flex flex-col gap-3 p-4 bg-yellow-50 rounded-lg shadow mt-6"
        >
          <h2 className="text-xl font-semibold text-yellow-600">Edit Trip</h2>
          <input
            type="text"
            value={editingTrip.destination}
            onChange={(e) =>
              setEditingTrip({ ...editingTrip, destination: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={editingTrip?.startDate
                  ? new Date(editingTrip.startDate).toISOString().split("T")[0]
                  : ""}
              onChange={(e) =>
                setEditingTrip({ ...editingTrip, startDate: e.target.value })
              }
              className="p-2 border rounded w-1/2"
              required
            />
            <input
              type="date"
              value={editingTrip?.endDate
                  ? new Date(editingTrip.endDate).toISOString().split("T")[0]
                  : ""}
              onChange={(e) =>
                setEditingTrip({ ...editingTrip, endDate: e.target.value })
              }
              className="p-2 border rounded w-1/2"
              required
            />
          </div>
          <textarea
            value={editingTrip?.notes || ""}
            onChange={(e) =>
              setEditingTrip({ ...editingTrip, notes: e.target.value })
            }
            className="p-2 border rounded"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded flex-1"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingTrip(null)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Trip list */}
      <ul className="grid gap-4 mt-6">
        {trips.map((trip) => (
          <li 
            key={trip._id}
            className="p-4 bg-white shadow rounded-xl border flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-blue-600">
                {trip.destination}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingTrip(trip)}
                  className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(trip._id!)}
                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              {trip.startDate} → {trip.endDate}
            </p>
            {trip.notes && <p className="text-gray-800 italic">{trip.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App
