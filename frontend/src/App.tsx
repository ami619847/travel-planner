import { useEffect, useState, FormEvent } from "react" ;
import './App.css'
import { getTrips, postTrip, deleteTrip } from "./api";
import { Trip } from "../../types/Trip";

function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

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
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
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
          <li key={trip._id} style={{ marginBottom: "1rem" }}>
            <strong>{trip.destination}</strong> ({new Date(trip.startDate).toLocaleDateString()} → {new Date(trip.endDate).toLocaleDateString()})
            <br />
            {trip.notes}
            <br />
            <button onClick={() => handleDelete(trip._id!)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App
