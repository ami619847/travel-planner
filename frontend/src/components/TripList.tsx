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
    loading: boolean;
}

export default function TripList({
    trips,
    filter,
    sortOrder,
    searchTerm,
    onEdit,
    onDelete,
    onSelect,
    highlightMatch,
    loading
}: TripListProps) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
            </div>
        )
    }

    // Filter and sort trips
    const filteredTrips = trips
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

    // Empty state if no trips at all
    if (trips.length === 0) {
        return (
            <div className="text-center text-gray-500 py-6">
                No trips yet. Add your first trip!
            </div>
        );
    }

    // Empty state if no trips match the filter/search
    if (filteredTrips.length === 0) {
        return (
            <div className="text-center text-gray-500 py-6">
                No trips match your filters.
            </div>
        );
    }

    // Normal state
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips
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