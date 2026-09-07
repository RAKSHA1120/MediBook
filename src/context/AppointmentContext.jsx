import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

const AppointmentContext = createContext(null);

export function AppointmentProvider({ children }) {
  const [appointments, setAppointments] = useState([]);

  const fetchBackendAppointments = useCallback(async () => {
    try {
      const response = await api.get("/Appointments");
      if (response.success && Array.isArray(response.data)) {
        const formatBackendTime = (timeStr) => {
          if (!timeStr) return "10:30 AM";
          if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
          const parts = timeStr.split(":");
          if (parts.length >= 2) {
            let hours = parseInt(parts[0], 10);
            const minutes = parts[1];
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12;
            const hh = String(hours).padStart(2, "0");
            return `${hh}:${minutes} ${ampm}`;
          }
          return timeStr;
        };

        const normalizedBackend = response.data.map((apt) => ({
          id: apt.id,
          patientId: apt.patientId,
          patientName: apt.patientName || "Patient",
          doctorId: apt.doctorId,
          doctorName: apt.doctorName || "Doctor",
          hospitalId: apt.hospitalId,
          hospitalName: apt.hospitalName || "MediCare Hospital",
          hospital: apt.hospitalName || "MediCare Hospital",
          appointmentDate: apt.appointmentDate,
          date: apt.appointmentDate ? String(apt.appointmentDate).split("T")[0] : "",
          time: formatBackendTime(apt.appointmentTime),
          appointmentTime: apt.appointmentTime,
          status: apt.status || "Pending",
          appointmentType: apt.appointmentType || "Consultation",
          specialty: apt.appointmentType || "Consultation",
          reason: apt.reason || "Regular consultation",
          consultationFee: apt.consultationFee ?? 500,
          fee: apt.consultationFee ?? 500,
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt
        }));

        setAppointments(normalizedBackend);
      }
    } catch (e) {
      console.error("Failed to fetch backend appointments:", e);
    }
  }, []);

  useEffect(() => {
    fetchBackendAppointments();
  }, [fetchBackendAppointments]);

  const reloadAppointments = useCallback(() => {
    fetchBackendAppointments();
  }, [fetchBackendAppointments]);

  // Appointment operations using Backend
  const addAppointment = useCallback(async (newAppt) => {
    // The frontend should have already posted it or we can just trigger a reload
    reloadAppointments();
    return { success: true };
  }, [reloadAppointments]);

  const cancelAppointment = useCallback(async (appointmentId) => {
    try {
      const response = await api.put(`/Appointments/${appointmentId}/status`, { status: "Cancelled" });
      if (response.success || response.status === 204) {
        reloadAppointments();
        return { success: true };
      }
      return { success: false, message: "Failed to cancel appointment" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [reloadAppointments]);

  const rescheduleAppointment = useCallback(async (appointmentId, newDate, newTime) => {
    try {
      const response = await api.put(`/Appointments/${appointmentId}/reschedule`, {
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: "Confirmed"
      });
      if (response.success || response.status === 204) {
        reloadAppointments();
        return { success: true };
      }
      return { success: false, message: "Failed to reschedule" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [reloadAppointments]);

  const isSlotBooked = useCallback((doctorId, date, time) => {
    return appointments.some(a => 
      String(a.doctorId) === String(doctorId) && 
      a.date === date && 
      a.time === time && 
      a.status.toLowerCase() !== "cancelled"
    );
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
    throw new Error("useAppointments must be used within an AppointmentProvider");
  }
  return context;
}
