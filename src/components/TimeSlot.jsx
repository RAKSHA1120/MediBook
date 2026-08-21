import { timeSlots } from "../data/appointments";

/**
 * TimeSlot
 *
 * Displays time slots grouped by period (Morning / Afternoon / Evening).
 *
 * Slot states:
 *   available   → clickable
 *   selected    → primary blue, highlighted
 *   booked      → disabled, red tint
 *   disabled    → disabled, grey (same visual as booked but neutral)
 *
 * Props:
 *   selectedSlot  {object|null}  currently selected slot object
 *   onTimeSelect  {function}     called with the full slot object on click
 */
function TimeSlot({ selectedSlot, onTimeSelect }) {

  const handleClick = (slot) => {
    if (!slot.available) return;
    if (onTimeSelect) onTimeSelect(slot);
  };

  // Group slots by their label (Morning / Afternoon / Evening)
  const groups = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.label]) acc[slot.label] = [];
    acc[slot.label].push(slot);
    return acc;
  }, {});

  const getSlotState = (slot) => {
    if (selectedSlot && selectedSlot.id === slot.id) return "selected";
    if (!slot.available) return "booked";
    return "available";
  };

  return (
    <div className="timeslot-container">
      {Object.entries(groups).map(([group, slots]) => (
        <div key={group} className="timeslot-group">
          <p className="timeslot-group-label">{group}</p>

          <div
            className="timeslot-grid"
            role="listbox"
            aria-label={`${group} time slots`}
          >
            {slots.map((slot) => {
              const state      = getSlotState(slot);
              const isSelected = state === "selected";
              const isBooked   = state === "booked";

              return (
                <button
                  key={slot.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isBooked}
                  aria-label={`${slot.time} — ${
                    isSelected ? "Selected" : isBooked ? "Not available" : "Available"
                  }`}
                  disabled={isBooked}
                  onClick={() => handleClick(slot)}
                  className={[
                    "timeslot-chip",
                    isSelected && "timeslot-chip--selected",
                    isBooked   && "timeslot-chip--booked",
                  ].filter(Boolean).join(" ")}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TimeSlot;
