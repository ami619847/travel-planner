import { Trip } from "../../../types/Trip";
import { format, differenceInDays, isBefore } from "date-fns";

interface TripCardProps {
    trip: Trip;
    onSelect: (trip: Trip) => void;
    highlightMatch: (text: string, query: string) => React.ReactNode;
    searchTerm: string;
    onEdit: (trip: Trip) => void;
    onDelete: (id: string) => void;
}

export default function TripCard({
    trip,
    onSelect,
    highlightMatch,
    searchTerm,
    onEdit,
    onDelete,
}: TripCardProps) {
    return (
        <div
            key={trip._id}
            className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg transition flex flex-col justify-between"
            onClick={() => onSelect(trip)}
        >
            {/* Destination + Status */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                    {highlightMatch(trip.destination, searchTerm)}
                </h2>
                <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isBefore(new Date(trip.endDate), new Date())
                        ? "bg-gray-200 text-gray-600"
                        : "bg-green-200 text-green-800"
                        }`}
                >
                    {isBefore(new Date(trip.endDate), new Date()) ? "Past" : "Upcoming"}
                </span>
            </div>

            {/* Dates & Duration */}
            <p className="text-sm text-gray-600" >
                {format(new Date(trip.startDate), "MMM d, yyyy")} →{" "}
                {format(new Date(trip.endDate), "MMM d, yyyy")}
            </p >
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
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(trip);
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(trip._id!)
                    }}   
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Delete
                </button>
            </div>
        </div >
    );
}