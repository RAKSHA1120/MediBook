export const TIME_SLOTS = {
  Morning: [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM"
  ],
  Afternoon: [
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM"
  ],
  Evening: []
};

// Helper to get formatted date string: YYYY-MM-DD
export const getRelativeDateString = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

// Generate dynamic booked slots for a given doctor
export const getMockBookedAppointments = (doctorId = 1) => {
  const booked = {};

  // Offset 2 (day after tomorrow): Fully booked date
  const fullyBookedDate = getRelativeDateString(2);
  const allSlots = [
    ...(TIME_SLOTS.Morning || []),
    ...(TIME_SLOTS.Afternoon || [])
  ];
  booked[fullyBookedDate] = allSlots;

  // Offset 1 (tomorrow): Partially booked slots
  const tomorrowDate = getRelativeDateString(1);
  booked[tomorrowDate] = ["09:30 AM", "10:30 AM", "01:00 PM", "02:30 PM"];

  // Offset 4: Partially booked slots
  const offset4Date = getRelativeDateString(4);
  booked[offset4Date] = ["11:00 AM", "03:00 PM"];

  return booked;
};

// Generate dynamic disabled slots for a given doctor
export const getMockDisabledAppointments = (doctorId = 1) => {
  const disabled = {};

  // Offset 1 (tomorrow): Partially disabled slots
  const tomorrowDate = getRelativeDateString(1);
  disabled[tomorrowDate] = ["11:30 AM", "12:00 PM", "01:30 PM"];

  // Offset 3: Partially disabled slots
  const offset3Date = getRelativeDateString(3);
  disabled[offset3Date] = ["09:00 AM", "12:30 PM"];

  return disabled;
};
