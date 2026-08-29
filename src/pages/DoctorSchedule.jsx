import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, CalendarClock } from "lucide-react";
import { getCurrentUser } from "../utils/storage";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";

function DoctorSchedule() {
    const [schedule, setSchedule] = useState({
        Monday: ["09:00 AM - 01:00 PM"],
        Tuesday: ["09:00 AM - 01:00 PM"],
        Wednesday: ["09:00 AM - 01:00 PM"],
        Thursday: ["09:00 AM - 01:00 PM"],
        Friday: ["09:00 AM - 01:00 PM"],
        Saturday: [],
        Sunday: []
    });

    const [newSlot, setNewSlot] = useState({ day: "Monday", start: "09:00", end: "13:00" });

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            const savedSchedule = localStorage.getItem(`medibook_schedule_${user.refId}`);
            if (savedSchedule) {
                setSchedule(JSON.parse(savedSchedule));
            }
        }
    }, []);

    const handleSave = () => {
        const user = getCurrentUser();
        if (user) {
            localStorage.setItem(`medibook_schedule_${user.refId}`, JSON.stringify(schedule));
            alert("Schedule saved successfully!");
        }
    };

    const addSlot = () => {
        const formatTime = (time24) => {
            const [hours, minutes] = time24.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
        };

        const slotString = `${formatTime(newSlot.start)} - ${formatTime(newSlot.end)}`;
        
        setSchedule(prev => ({
            ...prev,
            [newSlot.day]: [...prev[newSlot.day], slotString]
        }));
    };

    const removeSlot = (day, index) => {
        setSchedule(prev => {
            const updatedDay = [...prev[day]];
            updatedDay.splice(index, 1);
            return { ...prev, [day]: updatedDay };
        });
    };

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <main className="patient-dashboard-content">
            <PageHeader title="My Schedule" subtitle="Manage your weekly availability and time slots." />

            <div className="dashboard-main-info-grid">
                <div className="next-appointment-column">
                    <Card>
                        <h3 style={{ margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
                            <CalendarClock size={20} color="#0284c7" /> Add New Time Slot
                        </h3>
                        
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "20px" }}>
                            <div style={{ flex: 1, minWidth: "120px" }}>
                                <label className="input-label">Day of Week</label>
                                <select 
                                    className="field-select" 
                                    value={newSlot.day} 
                                    onChange={(e) => setNewSlot({...newSlot, day: e.target.value})}
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: "100px" }}>
                                <label className="input-label">Start Time</label>
                                <input 
                                    type="time" 
                                    className="field-input" 
                                    value={newSlot.start}
                                    onChange={(e) => setNewSlot({...newSlot, start: e.target.value})}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: "100px" }}>
                                <label className="input-label">End Time</label>
                                <input 
                                    type="time" 
                                    className="field-input" 
                                    value={newSlot.end}
                                    onChange={(e) => setNewSlot({...newSlot, end: e.target.value})}
                                />
                            </div>
                            <Button variant="primary" onClick={addSlot} style={{ height: "42px" }}>
                                <Plus size={16} /> Add Slot
                            </Button>
                        </div>
                    </Card>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px", marginBottom: "24px" }}>
                        <Button variant="primary" onClick={handleSave}>Save Schedule to Profile</Button>
                    </div>
                </div>

                <div className="quick-actions-column">
                    <Card>
                        <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem" }}>Weekly Overview</h3>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {days.map(day => (
                                <div key={day} style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
                                    <h4 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "1rem" }}>{day}</h4>
                                    
                                    {schedule[day].length === 0 ? (
                                        <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Not Available / Off</span>
                                    ) : (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {schedule[day].map((slot, idx) => (
                                                <div key={idx} style={{ 
                                                    display: "flex", alignItems: "center", gap: "8px", 
                                                    padding: "6px 12px", backgroundColor: "#f1f5f9", 
                                                    borderRadius: "16px", fontSize: "0.875rem", border: "1px solid #cbd5e1" 
                                                }}>
                                                    <Clock size={14} color="#64748b" />
                                                    <span>{slot}</span>
                                                    <button 
                                                        onClick={() => removeSlot(day, idx)}
                                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0, display: "flex" }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default DoctorSchedule;
