import { useEffect, useState, FormEvent } from "react";
import { Trip } from "../../../types/Trip";

interface TripFormProps {
  onAddTrip: (formData: Omit<Trip, "_id">) => void;
  onUpdateTrip: (trip: Trip) => void;
  editingTrip: Trip | null;
  setEditingTrip: (trip: Trip | null) => void;
}

export default function TripForm({
  onAddTrip,
  onUpdateTrip,
  editingTrip,
  setEditingTrip,
}: TripFormProps) {
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  // sync form with editingTrip when editing
  useEffect(() => {
    if (editingTrip) {
      setFormData({
        destination: editingTrip.destination,
        startDate: new Date(editingTrip.startDate).toISOString().split("T")[0],
        endDate: new Date(editingTrip.endDate).toISOString().split("T")[0],
        notes: editingTrip.notes || "",
      });
    } else {
      setFormData({
        destination: "",
        startDate: "",
        endDate: "",
        notes: "",
      });
    }
  }, [editingTrip]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (editingTrip) {
      // Update existing
      onUpdateTrip({
        ...editingTrip,
        ...formData,
      });
      setEditingTrip(null);
    } else {
      // Add new
      onAddTrip({
        ...formData,
      } as Omit<Trip, "_id">);
    }

    // Reset form after submit
    setFormData({
      destination: "",
      startDate: "",
      endDate: "",
      notes: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 p-4 rounded-lg shadow ${
        editingTrip ? "bg-yellow-50 mt-6" : "bg-gray-50"
      }`}
    >
      {editingTrip && (
        <h2 className="text-xl font-semibold text-yellow-600">Edit Trip</h2>
      )}

      <input
        type="text"
        placeholder="Destination"
        value={formData.destination}
        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
        className="p-2 border rounded"
        required
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          className="p-2 border rounded w-1/2"
          required
        />
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          className="p-2 border rounded w-1/2"
          required
        />
      </div>
      <textarea
        placeholder="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="p-2 border rounded"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className={`font-semibold py-2 rounded flex-1 ${
            editingTrip
              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
              : "bg-blue-500 hover:bg-blue-700 text-white"
          }`}
        >
          {editingTrip ? "Save" : "Add Trip"}
        </button>
        {editingTrip && (
          <button
            type="button"
            onClick={() => setEditingTrip(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// import React, { useEffect, useState } from "react";
// import { Trip, NewTrip } from "../../../types/Trip";

// interface TripFormProps {
//     editingTrip: Trip | null;
//     onAddTrip: (trip: NewTrip) => void;
//     onUpdateTrip: (id: string, trip: NewTrip) => void;
//     onCancelEdit: () => void; // <-- new prop
// }

// export default function TripForm({ editingTrip, onAddTrip, onUpdateTrip, onCancelEdit }: TripFormProps) {
//     const [formData, setFormData] = useState<NewTrip>({
//         destination: "",
//         startDate: "",
//         endDate: "",
//         notes: "",
//     });

//     useEffect(() => {
//         if (editingTrip) {
//             setFormData({
//                 destination: editingTrip.destination,
//                 startDate: editingTrip.startDate,
//                 endDate: editingTrip.endDate,
//                 notes: editingTrip.notes || "",
//             });
//         } else {
//             setFormData({ destination: "", startDate: "", endDate: "", notes: "" });
//         }
//     }, [editingTrip]);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!formData.destination || !formData.startDate || !formData.endDate) return;

//         if (editingTrip && editingTrip._id) {
//             onUpdateTrip(editingTrip._id, formData);
//         } else {
//             onAddTrip(formData);
//         }

//         setFormData({ destination: "", startDate: "", endDate: "", notes: "" });
//     };

//     return (
//         <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg shadow">
//             <h2 className="text-xl font-semibold mb-4">
//                 {editingTrip ? "Edit Trip" : "Add Trip"}
//             </h2>

//             <input
//                 name="destination"
//                 type="text"
//                 placeholder="Destination"
//                 value={formData.destination}
//                 onChange={handleChange}
//                 required
//                 className="w-full p-2 mb-3 border rounded"
//             />

//             <input
//                 name="startDate"
//                 type="date"
//                 value={formData.startDate}
//                 onChange={handleChange}
//                 required
//                 className="w-full p-2 mb-3 border rounded"
//             />

//             <input
//                 name="endDate"
//                 type="date"
//                 value={formData.endDate}
//                 onChange={handleChange}
//                 required
//                 className="w-full p-2 mb-3 border rounded"
//             />

//             <textarea
//                 name="notes"
//                 placeholder="Notes (optional)"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 className="w-full p-2 mb-3 border rounded"
//             />

//             <div className="flex gap-3">
//                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
//                     {editingTrip ? "Update Trip" : "Add Trip"}
//                 </button>
//                 {editingTrip && (
//                     <button
//                         type="button"
//                         onClick={onCancelEdit} // <-- call parent to exit edit mode
//                         className="px-4 py-2 bg-gray-500 text-white rounded"
//                     >
//                         Cancel
//                     </button>
//                 )}
//             </div>
//         </form>
//     );
// }
