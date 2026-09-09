import React from "react";
import "./TimeSlot.css";

/**
 * Reusable TimeSlot component for rendering individual appointment time slots.
 * Supports statuses: "available", "selected", "booked", "disabled".
 */
function TimeSlot({
  time,
  status = "available",
  onClick,
  selected = false,
  disabled = false,
  className = ""
}) {
  // Resolve effective status from props
  let effectiveStatus = status;
  if (selected || status === "selected") {
    effectiveStatus = "selected";
  } else if (disabled || status === "disabled") {
    effectiveStatus = "disabled";
  } else if (status === "booked") {
    effectiveStatus = "booked";
  }

  const isClickable = effectiveStatus === "available" || effectiveStatus === "selected";
  const isDisabled = effectiveStatus === "booked" || effectiveStatus === "disabled";

  let badgeLabel = null;
  if (effectiveStatus === "booked") {
    badgeLabel = "Booked";
  } else if (effectiveStatus === "disabled") {
    badgeLabel = "Unavailable";
  }

  return (
    <button
      type="button"
      className={`time-slot-btn status-${effectiveStatus} ${className}`}
      onClick={isClickable ? onClick : undefined}
      disabled={isDisabled}
      aria-label={`Time slot ${time}${badgeLabel ? ` (${badgeLabel})` : ""}`}
      aria-selected={effectiveStatus === "selected"}
    >
      <span className="slot-time-text">{time}</span>
      {badgeLabel && <span className="slot-status-badge">{badgeLabel}</span>}
    </button>
  );
}

/**
 * Helper wrapper for rendering time slot groups (e.g. Morning / Afternoon).
 */
export function TimeSlotGroup({ title, icon, children }) {
  return (
    <div className="time-slot-group">
      {title && (
        <h4 className="time-slot-group-title">
          {icon}
          <span>{title}</span>
        </h4>
      )}
      <div className="time-slots-grid">{children}</div>
    </div>
  );
}

export default TimeSlot;
