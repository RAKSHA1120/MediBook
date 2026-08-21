import { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import "./BookAppointment.css";
import appointments from "../data/appointments";

function BookAppointment() {
    const [specialty, setSpecialty] = useState("");
    const [doctor, setDoctor] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const handleBooking = (e) => {
        e.preventDefault();

        if (!specialty || !doctor || !date || !time) {
            alert("Please fill all fields");
            return;
        }

        const newAppointment = {
            id: `APT${Date.now()}`,
            doctorName: doctor,
            specialty: specialty,
            date: date,
            time: time,
            status: "Upcoming"
        };

        appointments.push(newAppointment);
        localStorage.setItem("medibook_appointments", JSON.stringify(appointments));

        alert("Appointment booked successfully!");
        
        setSpecialty("");
        setDoctor("");
        setDate("");
        setTime("");
    };

    return (
        <div className="book-appointment-page">

            <h1>Book an Appointment</h1>

            <Card>
                <form
                    className="booking-form"
                    onSubmit={handleBooking}
                >

                    {/* Specialty */}
                    <div className="form-group">
                        <label>Specialty</label>

                        <select
                            value={specialty}
                            onChange={(e) =>
                                setSpecialty(e.target.value)
                            }
                        >
                            <option value="">
                                Select Specialty
                            </option>

                            <option value="Cardiologist">
                                Cardiologist
                            </option>

                            <option value="Dermatologist">
                                Dermatologist
                            </option>

                            <option value="Neurologist">
                                Neurologist
                            </option>
                        </select>
                    </div>

                    {/* Doctor */}
                    <div className="form-group">
                        <label>Doctor</label>

                        <select
                            value={doctor}
                            onChange={(e) =>
                                setDoctor(e.target.value)
                            }
                        >
                            <option value="">
                                Select Doctor
                            </option>

                            <option value="Dr. Priya Sharma">
                                Dr. Priya Sharma
                            </option>

                            <option value="Dr. Arun Kumar">
                                Dr. Arun Kumar
                            </option>

                            <option value="Dr. Meena Raj">
                                Dr. Meena Raj
                            </option>
                        </select>
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label>Date</label>

                        <input
                            type="date"
                            value={date}
                            onChange={(e) =>
                                setDate(e.target.value)
                            }
                        />
                    </div>

                    {/* Time */}
                    <div className="form-group">
                        <label>Time</label>

                        <select
                            value={time}
                            onChange={(e) =>
                                setTime(e.target.value)
                            }
                        >
                            <option value="">
                                Select Time
                            </option>

                            <option value="09:00 AM">
                                09:00 AM
                            </option>

                            <option value="10:00 AM">
                                10:00 AM
                            </option>

                            <option value="11:00 AM">
                                11:00 AM
                            </option>

                            <option value="02:00 PM">
                                02:00 PM
                            </option>

                            <option value="04:00 PM">
                                04:00 PM
                            </option>
                        </select>
                    </div>

                    <Button type="submit">
                        Confirm Appointment
                    </Button>

                </form>
            </Card>

        </div>
    );
}

export default BookAppointment;