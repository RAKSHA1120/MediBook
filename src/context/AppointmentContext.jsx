import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getStoredAppointments,
  saveStoredAppointments,
  checkIsSlotBooked,
  normalizeStatus
} from "../utils/appointmentStorage";

const AppointmentContext = createContext(null);

export function AppointmentProvider({ children }) {
  const [appointments, setAppointments] = useState(() => getStoredAppointments());

  // Reload appointments from localStorage
  const reloadAppointments = useCallback(() => {
    const fresh = getStoredAppointments();
    setAppointments(fresh);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      reloadAppointments();
    };
    window.addEventListener("medibook_appointments_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("medibook_appointments_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [reloadAppointments]);

  // Add a new appointment
  const addAppointment = useCallback((newAppt) => {
    const current = getStoredAppointments();
    const isBooked = checkIsSlotBooked(current, newAppt.doctorId, newAppt.date, newAppt.time);
    if (isBooked) {
      return { success: false, message: "This time slot has already been booked. Please select another slot." };
    }
    const updated = [newAppt, ...current];
    setAppointments(updated);
    saveStoredAppointments(updated);
    return { success: true };
  }, []);

  // Cancel an existing appointment
  const cancelAppointment = useCallback((appointmentId) => {
    const current = getStoredAppointments();
    const updated = current.map((appt) => {
      if (String(appt.id) === String(appointmentId)) {
        return { ...appt, status: "cancelled" };
      }
      return appt;
    });
    setAppointments(updated);
    saveStoredAppointments(updated);
    return { success: true };
  }, []);

  // Reschedule an existing appointment
  const rescheduleAppointment = useCallback((appointmentId, newDate, newTime, newFormattedDate) => {
    const current = getStoredAppointments();
    const targetIdStr = String(appointmentId ?? "").trim().toLowerCase();
    const apptToReschedule = current.find((a) => String(a.id ?? "").trim().toLowerCase() === targetIdStr);
    if (!apptToReschedule) {
      return { success: false, message: "Appointment not found." };
    }

    // Check if the target new slot is already booked by ANOTHER appointment for the same doctor
    const isBooked = checkIsSlotBooked(
      current,
      apptToReschedule.doctorId,
      newDate,
      newTime,
      appointmentId,
      apptToReschedule.doctorName || apptToReschedule.doctor
    );

    if (isBooked) {
      return { success: false, message: "The selected new time slot is already booked." };
    }

    const updated = current.map((a) => {
      if (String(a.id ?? "").trim().toLowerCase() === targetIdStr) {
        return {
          ...a,
          date: newDate,
          time: newTime,
          formattedDate: newFormattedDate || a.formattedDate,
          status: "confirmed"
        };
      }
      return a;
    });

    setAppointments(updated);
    saveStoredAppointments(updated);
    return { success: true };
  }, []);

  // Helper to check if a slot is booked
  const isSlotBooked = useCallback((doctorId, date, time) => {
    return checkIsSlotBooked(appointments, doctorId, date, time);
  }, [appointments]);

  const value = {
    appointments,
    addAppointment,
    cancelAppointment,
    rescheduleAppointment,
    isSlotBooked,
    reloadAppointments
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (!context) {
    // Graceful fallback if component is used outside provider
    const fallbackAppointments = getStoredAppointments();
    return {
      appointments: fallbackAppointments,
      addAppointment: (newAppt) => {
        const current = getStoredAppointments();
        const isBooked = checkIsSlotBooked(current, newAppt.doctorId, newAppt.date, newAppt.time);
        if (isBooked) {
          return { success: false, message: "This time slot has already been booked." };
        }
        const updated = [newAppt, ...current];
        saveStoredAppointments(updated);
        return { success: true };
      },
      cancelAppointment: (id) => {
        const current = getStoredAppointments();
        const updated = current.map((a) => (String(a.id) === String(id) ? { ...a, status: "cancelled" } : a));
        saveStoredAppointments(updated);
        return { success: true };
      },
      rescheduleAppointment: (id, newDate, newTime, newFormattedDate) => {
        const current = getStoredAppointments();
        const updated = current.map((a) =>
          String(a.id) === String(id)
            ? { ...a, date: newDate, time: newTime, formattedDate: newFormattedDate || a.formattedDate, status: "confirmed" }
            : a
        );
        saveStoredAppointments(updated);
        return { success: true };
      },
      isSlotBooked: (doctorId, date, time) => {
        return checkIsSlotBooked(getStoredAppointments(), doctorId, date, time);
      },
      reloadAppointments: () => {}
    };
  }
  return context;
}
