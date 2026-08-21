import { appointmentDates } from "../data/appointments";

/**
 * DateSelector
 *
 * Horizontal scrollable date strip.
 *
 * States per chip:
 *   available → clickable, green "Open" badge
 *   booked    → disabled, red "Booked" badge, strikethrough date
 *   selected  → primary blue fill
 *
 * Props:
 *   selectedDate  {object|null}  currently selected date object
 *   onDateSelect  {function}     called with the full date object on click
 */
function DateSelector({ selectedDate, onDateSelect }) {

  const handleClick = (date) => {
    if (date.status === "booked") return;
    if (onDateSelect) onDateSelect(date);
  };

  const getState = (date) => {
    if (selectedDate && selectedDate.id === date.id) return "selected";
    if (date.status === "booked") return "booked";
    return "available";
  };

  return (
    <div className="date-selector">
      {/* Month / year label */}
      <p className="date-selector-month">
        {appointmentDates[0]?.month}&nbsp;
        {appointmentDates[0]?.fullDate.slice(0, 4)}
      </p>

      {/* Scrollable strip */}
      <div
        className="date-strip"
        role="listbox"
        aria-label="Select an appointment date"
        aria-orientation="horizontal"
      >
        {appointmentDates.map((date) => {
          const state = getState(date);
          const isSelected = state === "selected";
          const isBooked   = state === "booked";

          return (
            <button
              key={date.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-disabled={isBooked}
              aria-label={`${date.day} ${date.date} ${date.month} — ${
                isSelected ? "Selected" : isBooked ? "Fully booked" : "Available"
              }`}
              disabled={isBooked}
              onClick={() => handleClick(date)}
              className={[
                "date-chip",
                isSelected  && "date-chip--selected",
                isBooked    && "date-chip--booked",
                !isSelected && !isBooked && "date-chip--available",
              ].filter(Boolean).join(" ")}
            >
              <span className="date-chip__day">{date.day}</span>
              <span className="date-chip__num">{date.date}</span>
              <span className="date-chip__badge">
                {isSelected ? "Selected" : isBooked ? "Booked" : "Open"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="date-selector-legend" aria-hidden="true">
        <span className="ds-legend-item ds-legend--available">
          <span className="ds-legend-dot" />Available
        </span>
        <span className="ds-legend-item ds-legend--selected">
          <span className="ds-legend-dot" />Selected
        </span>
        <span className="ds-legend-item ds-legend--booked">
          <span className="ds-legend-dot" />Booked
        </span>
      </div>
    </div>
  );
}

export default DateSelector;
