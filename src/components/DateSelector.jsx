import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import "./DateSelector.css";

function DateSelector({
  dates,
  selectedDate,
  onDateSelect,
  isDateBooked
}) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="date-selector-container">
      {/* Scroll Left Button */}
      <button 
        type="button"
        className="scroll-btn prev-btn" 
        onClick={() => scroll("left")}
        aria-label="Previous dates"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Date List Container */}
      <div className="date-selector-list" ref={scrollContainerRef}>
        {dates.map((dateObj) => {
          const { dateString, dayName, dayNum, monthName } = dateObj;
          const isSelected = selectedDate === dateString;
          const isBooked = isDateBooked(dateString);
          
          let stateLabel = "Available";
          let stateClass = "state-available";
          
          if (isSelected) {
            stateLabel = "Selected";
            stateClass = "state-selected";
          } else if (isBooked) {
            stateLabel = "Booked";
            stateClass = "state-booked";
          }

          return (
            <button
              key={dateString}
              type="button"
              className={`date-item-card ${isSelected ? "selected" : ""} ${isBooked ? "booked" : ""}`}
              onClick={() => {
                if (!isBooked) {
                  onDateSelect(dateString);
                }
              }}
              disabled={isBooked}
            >
              <span className="date-month">{monthName}</span>
              <span className="date-num">{dayNum}</span>
              <span className="date-day">{dayName}</span>
              
              <span className={`date-state-badge ${stateClass}`}>
                {stateLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button 
        type="button"
        className="scroll-btn next-btn" 
        onClick={() => scroll("right")}
        aria-label="Next dates"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export default DateSelector;
