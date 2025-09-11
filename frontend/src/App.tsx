import { useEffect, useState, FormEvent } from "react" ;
import './App.css'
import { getTrips, postTrip, deleteTrip, updateTrip } from "./api";
import { Trip } from "../../types/Trip";
import { format, differenceInDays, isBefore } from "date-fns";

function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

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

  function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Travel Planner</h1>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 bg-gray-100 p-3 rounded-lg">
        {/* Filter */}
        <div className="flex gap-2 justify-center sm:justify-start">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded font-semibold ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-3 py-1 rounded font-semibold ${
              filter === "upcoming" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-3 py-1 rounded font-semibold ${
              filter === "past" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
            }`}
          >
            Past
          </button>
        </div>

        {/* Search Box */}
        <div className="w-full sm:flex-1 sm:max-w-md mx-auto sm:mx-0">
          <input
            type="text"
            placeholder="Search by destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-gray-700"
          />
        </div>

        {/* Sort by date */}
        <div className="flex gap-2 justify-center sm:justify-end">
          <button
            onClick={() => setSortOrder("asc")}
            className={`px-3 py-1 rounded font-semibold ${
              sortOrder === "asc" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
            }`}
          >
            Sort: Oldest First
          </button>
          <button
            onClick={() => setSortOrder("desc")}
            className={`px-3 py-1 rounded font-semibold ${
              sortOrder === "desc" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
            }`}
          >
            Sort: Newest First
          </button>
        </div>
      </div>

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trips
          .filter((trip) => {
            const end = new Date(trip.endDate);
            const isPast = isBefore(end, new Date());

            // Filter by Upcoming/Past/All
            if (filter === "upcoming" && isPast) return false;
            if (filter === "past" && !isPast) return false;
            // Search by destination
            if (searchTerm && !trip.destination.toLowerCase().includes(searchTerm.toLowerCase())) {
              return false;
            }
            return true;
          })
          .sort((a, b) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
          })
          .map((trip) => {
            return (
              <div
                key={trip._id}
                className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg transition flex flex-col justify-between"
              >
                {/* Destination + Status */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {highlightMatch(trip.destination, searchTerm)}
                  </h2>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      isBefore(new Date(trip.endDate), new Date())
                        ? "bg-gray-200 text-gray-600"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {isBefore(new Date(trip.endDate), new Date()) ? "Past" : "Upcoming"}
                  </span>
                </div>

                {/* Dates & Duration */}
                <p className="text-sm text-gray-600">
                  {format(new Date(trip.startDate), "MMM d, yyyy")} →{" "}
                  {format(new Date(trip.endDate), "MMM d, yyyy")}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  {differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1}{" "}
                  days
                </p>

                {/* Notes */}
                {trip.notes && (
                  <p className="text-sm text-gray-700 italic mb-3">“{trip.notes}”</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setEditingTrip(trip)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDelete(trip._id!)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default App
