import { useState } from "react";
import "./DateSelector.css";

function DateSelector() {

    const [selectedDate, setSelectedDate] = useState("");

    const dates = [
        {
            day: "Mon",
            date: "18",
            status: "available"
        },
        {
            day: "Tue",
            date: "19",
            status: "available"
        },
        {
            day: "Wed",
            date: "20",
            status: "booked"
        },
        {
            day: "Thu",
            date: "21",
            status: "available"
        },
        {
            day: "Fri",
            date: "22",
            status: "available"
        }
    ];

    const handleDateClick = (date) => {
        if (date.status === "available") {
            setSelectedDate(date.date);
        }
    };

    return (
        <div className="date-selector">

            <h2>Select Date</h2>

            <div className="date-list">

                {dates.map((item) => (

                    <button
                        key={item.date}
                        disabled={item.status === "booked"}
                        className={
                            selectedDate === item.date
                                ? "date-box selected"
                                : `date-box ${item.status}`
                        }
                        onClick={() => handleDateClick(item)}
                    >

                        <span>{item.day}</span>

                        <strong>{item.date}</strong>

                        {item.status === "booked" && (
                            <small>Booked</small>
                        )}

                    </button>

                ))}

            </div>

            {selectedDate && (
                <p className="selected-date">
                    Selected Date: {selectedDate}
                </p>
            )}

        </div>
    );
}

export default DateSelector;