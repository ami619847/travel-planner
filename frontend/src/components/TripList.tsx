import { Trip } from "../../../types/Trip";
import TripCard from "./TripCard";
import { isBefore } from "date-fns";

interface TripListProps {
    trips: Trip[];
    filter: "all" | "upcoming" | "past";
    sortOrder: "asc" | "desc";
    searchTerm: string;
    onEdit: (trip: Trip) => void;
    onDelete: (id: string) => void;
    onSelect: (trip: Trip) => void;
    highlightMatch: (text: string, query: string) => React.ReactNode;
}

export default function TripList({
    trips,
    filter,
    sortOrder,
    searchTerm,
    onEdit,
    onDelete,
    onSelect,
    highlightMatch
}: TripListProps) {
    return (
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
                .map((trip) => (
                    <TripCard
                        key={trip._id}
                        trip={trip}
                        onEdit={onEdit} //setEditingTrip
                        onDelete={onDelete} //handleDelete
                        onSelect={onSelect} //setSelectedTrip
                        highlightMatch={highlightMatch}
                        searchTerm={searchTerm}
                    />
                ))
            }
        </div>
    );
}