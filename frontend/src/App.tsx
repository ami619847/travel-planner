import { useEffect, useState } from "react";
import './App.css'
import { getTrips, postTrip, deleteTrip, updateTrip } from "./api";
import { Trip } from "../../types/Trip";
import TripModal from "./components/TripModal";
import TripList from "./components/TripList";
import TripForm from "./components/TripForm";
import MapView from "./components/MapView";
import axios from "axios";

function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true); // start spinner
        const res = await getTrips();
        setTrips(res.data);
      } catch (err) {
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false); // stop spinner
      }
    };

    fetchTrips();
  }, []);

  const handleAddTrip = async (formData: Omit<Trip, "_id">) => {
    try {
      const res = await postTrip(formData);
      setTrips([...trips, res.data]);
    } catch (err: unknown) {
      console.error("Error creating trip:", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error || "Failed to create trip. Please try again.";
        alert(message);
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Unexpected error occurred.");
      }
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await deleteTrip(id);
      setTrips(trips.filter((trip) => trip._id !== id));
    } catch (err: unknown) {
      console.error("Error deleting trip:", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error || "Failed to delete trip. Please try again.";
        alert(message);
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Unexpected error occurred.");
      }
    }
  };

  const handleUpdate = async (trip: Trip) => {
    try {
      const res = await updateTrip(trip._id!, trip);
      setTrips(trips.map((t) => (t._id === trip._id ? res.data : t)));
      setEditingTrip(null); // reset editing mode
    } catch (err: unknown) {
      console.error("Error updating trip:", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error || "Failed to update trip. Please try again.";
        alert(message);
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Unexpected error occurred.");
      }
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

      {/* Add/Edit trip form */}
      <TripForm
        onAddTrip={handleAddTrip}
        onUpdateTrip={handleUpdate}
        editingTrip={editingTrip}
        setEditingTrip={setEditingTrip}
      />

      <TripList
        trips={trips}
        filter={filter}
        sortOrder={sortOrder}
        searchTerm={searchTerm}
        onEdit={setEditingTrip}
        onDelete={handleDelete}
        onSelect={setSelectedTrip}
        highlightMatch={highlightMatch}
        loading={loading}
      />

      {selectedTrip && (
        <TripModal
          selectedTrip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onEdit={setEditingTrip}
          onDelete={handleDelete}
        />
      )}

      {!selectedTrip && <MapView trips={trips} selectedTrip={selectedTrip} />}
    </div>
  );
}

export default App;
