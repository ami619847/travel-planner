import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Trip } from "../../../types/Trip";
import L from "leaflet";
import { format } from "date-fns";

interface MapViewProps {
    trips: Trip[];
    selectedTrip: Trip | null;
}

const defaultCenter = { lat: 20, lng: 0 }; // Default world view

export default function MapView({ trips, selectedTrip }: MapViewProps) {
    const center = selectedTrip && selectedTrip.latitude && selectedTrip.longitude
        ? { lat: selectedTrip.latitude, lng: selectedTrip.longitude }
        : defaultCenter;

    // Fix Leaflet’s default marker icon
    const markerIcon = new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });

    return (
        <MapContainer
            center={center}
            zoom={selectedTrip ? 6 : 2}
            style={{ height: "400px", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {trips.map((trip) => (
                trip.latitude !== undefined &&
                    trip.longitude !== undefined &&
                    !isNaN(trip.latitude) &&
                    !isNaN(trip.longitude) ? (
                    <Marker
                        key={trip._id}
                        position={{ lat: trip.latitude, lng: trip.longitude }}
                        icon={markerIcon}
                    >
                        <Popup>
                            <strong>{trip.destination}</strong>
                            <br />
                            {format(new Date(trip.startDate), "MMM d, yyyy")} →{" "}
                            {format(new Date(trip.endDate), "MMM d, yyyy")}
                        </Popup>
                    </Marker>
                ) : null
            ))}
        </MapContainer>
    );
}
