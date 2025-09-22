import { Trip } from "../../../types/Trip";
import { format, differenceInDays } from "date-fns";
import { useEffect } from "react";

interface TripModalProps {
    selectedTrip: Trip;
    onClose: () => void;
    onEdit: (trip: Trip) => void;
    onDelete: (id: string) => void;
}

export default function TripModal({ selectedTrip, onClose, onEdit, onDelete }: TripModalProps) {
    // Close modal on Esc key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                {/* Trip Details */}
                <h2 className="text-2xl font-bold mb-4">{selectedTrip.destination}</h2>
                <p className="text-gray-600 mb-1">
                    {format(new Date(selectedTrip.startDate), "MMM d, yyyy")} →{" "}
                    {format(new Date(selectedTrip.endDate), "MMM d, yyyy")}
                </p>
                <p className="text-gray-500 mb-3">
                    {differenceInDays(
                        new Date(selectedTrip.endDate),
                        new Date(selectedTrip.startDate)
                    ) + 1}{" "}
                    days
                </p>

                {selectedTrip.notes && (
                    <p className="italic text-gray-700 mb-4">“{selectedTrip.notes}”</p>
                )}

                {/* Actions inside modal */}
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(selectedTrip);
                            onClose();
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(selectedTrip._id!);
                            onClose();
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}