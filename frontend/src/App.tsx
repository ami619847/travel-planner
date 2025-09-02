import { useEffect, useState } from "react" ;
import './App.css'
import { getTrips, addTrip } from "./api";

interface Trip {
  _id?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [destination, setDestination] = useState<string>("");

  useEffect(() => {
    getTrips()
      .then((res) => setTrips(res.data))
      .catch((err) => console.error("Error fetching trips:", err));
  }, []);

  const handleAdd = async () => {
    if (!destination.trim()) return;

    const newTrip: Trip = {
      destination,
      startDate: new Date(),
      endDate: new Date(),
    };

    try {
      const res = await addTrip(newTrip);
      setTrips((prev) => [...prev, res.data]);
      setDestination(""); // reset input
    } catch (error) {
      console.error("Error adding trip:", error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">🌍 My Trips</h1>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Add destination"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>

      <ul className="mt-6 space-y-2">
        { trips.map((t) => (
          <li
            key={t._id}
            className="p-2 border rounded shadow-sm bg-gray-50"
          >
            <span className="font-medium">{t.destination}</span>
            <span className="block text-sm text-gray-500">
              {new Date(t.startDate).toLocaleDateString()} -{" "}
              {new Date(t.endDate).toLocaleDateString()}
            </span>
          </li>
        )) }
      </ul>
    </div>
  );

//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
}

export default App
