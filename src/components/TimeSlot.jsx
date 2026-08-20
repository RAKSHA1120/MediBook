import { useState } from "react";

function TimeSlot() {
  const [selectedSlot, setSelectedSlot] = useState("");

  const morningSlots = [
    { time: "09:00 AM", status: "available" },
    { time: "09:30 AM", status: "available" },
    { time: "10:00 AM", status: "booked" },
    { time: "10:30 AM", status: "available" },
    { time: "11:00 AM", status: "disabled" },
  ];

  const afternoonSlots = [
    { time: "02:00 PM", status: "available" },
    { time: "02:30 PM", status: "available" },
    { time: "03:00 PM", status: "booked" },
    { time: "03:30 PM", status: "available" },
    { time: "04:00 PM", status: "available" },
  ];

  const handleSlotClick = (slot) => {
    if (slot.status === "available") {
      setSelectedSlot(slot.time);
    }
  };

  const renderSlots = (slots) => {
    return slots.map((slot) => (
      <button
        key={slot.time}
        disabled={
          slot.status === "booked" ||
          slot.status === "disabled"
        }
        className={`time-slot ${selectedSlot === slot.time ? "selected" : slot.status
          }`}
        onClick={() => handleSlotClick(slot)}
      >
        {slot.time}

        {slot.status === "booked" && (
          <span>Booked</span>
        )}

        {slot.status === "disabled" && (
          <span>Unavailable</span>
        )}
      </button>
    ));
  };

  return (
    <div className="time-slot-container">

      <h2>Select Time</h2>

      <h3>Morning</h3>

      <div className="slot-grid">
        {renderSlots(morningSlots)}
      </div>

      <h3>Afternoon</h3>

      <div className="slot-grid">
        {renderSlots(afternoonSlots)}
      </div>

      {selectedSlot && (
        <p className="selected-time">
          Selected Time: {selectedSlot}
        </p>
      )}

    </div>
  );
}

export default TimeSlot;