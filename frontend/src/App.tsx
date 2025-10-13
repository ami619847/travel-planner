import { Routes, Route, Navigate } from "react-router-dom";
import TripsPage from "./pages/TripsPage";
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trips" replace />} />
      <Route path="/trips" element={<TripsPage />} />
      <Route path="/trips/:id" element={<TripsPage />} />
    </Routes>
  )
}

export default App;
