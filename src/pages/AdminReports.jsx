import { useState, useEffect, useMemo } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { api } from "../utils/api";
import { Loader2, Download, Printer, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import "./AdminShared.css";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function AdminReports() {
  const [period, setPeriod] = useState("today"); // today, weekly, monthly, yearly
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [summary, setSummary] = useState({ total: 0, completed: 0, upcoming: 0, pending: 0, cancelled: 0 });
  const [trendData, setTrendData] = useState([]);
  const [patientWise, setPatientWise] = useState([]);
  const [doctorWise, setDoctorWise] = useState([]);
  const [hospitalWise, setHospitalWise] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, trendRes, patRes, docRes, hospRes] = await Promise.all([
        api.get(`/Reports/summary?period=${period}`),
        api.get(`/Reports/trend?period=${period}`),
        api.get(`/Reports/patient-wise?period=${period}`),
        api.get(`/Reports/doctor-wise?period=${period}`),
        api.get(`/Reports/hospital-wise?period=${period}`)
      ]);

      if (!sumRes.success) throw new Error(sumRes.error || "Failed to load summary");

      setSummary(sumRes.data || { total: 0, completed: 0, upcoming: 0, pending: 0, cancelled: 0 });
      setTrendData(trendRes.data || []);
      setPatientWise(patRes.data || []);
      setDoctorWise(docRes.data || []);
      setHospitalWise(hospRes.data || []);
    } catch (err) {
      console.error("Reports API Error:", err);
      setError("Failed to load report data. Ensure you are logged in as Admin and backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const statusPieData = useMemo(() => {
    return [
      { name: "Completed", value: summary.completed },
      { name: "Upcoming", value: summary.upcoming },
      { name: "Pending", value: summary.pending },
      { name: "Cancelled", value: summary.cancelled }
    ].filter((item) => item.value > 0);
  }, [summary]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Generate CSV for Patient-wise
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "REPORT PERIOD: " + period.toUpperCase() + "\n\n";

    csvContent += "--- OVERALL SUMMARY ---\n";
    csvContent += `Total,${summary.total}\nCompleted,${summary.completed}\nUpcoming,${summary.upcoming}\nPending,${summary.pending}\nCancelled,${summary.cancelled}\n\n`;

    csvContent += "--- PATIENT WISE ---\n";
    csvContent += "Patient ID,Patient Name,Total Visits,Completed,Upcoming,Pending,Cancelled\n";
    patientWise.forEach(p => {
      csvContent += `${p.patientId},"${p.patientName}",${p.totalVisits},${p.completed},${p.upcoming},${p.pending},${p.cancelled}\n`;
    });

    csvContent += "\n--- DOCTOR WISE ---\n";
    csvContent += "Doctor ID,Doctor Name,Hospital,Total Visits,Completed,Upcoming,Pending,Cancelled\n";
    doctorWise.forEach(d => {
      csvContent += `${d.doctorId},"${d.doctorName}","${d.hospitalName}",${d.totalVisits},${d.completed},${d.upcoming},${d.pending},${d.cancelled}\n`;
    });

    csvContent += "\n--- HOSPITAL WISE ---\n";
    csvContent += "Hospital ID,Hospital Name,Total Visits,Completed,Upcoming,Pending,Cancelled\n";
    hospitalWise.forEach(h => {
      csvContent += `${h.hospitalId},"${h.hospitalName}",${h.totalVisits},${h.completed},${h.upcoming},${h.pending},${h.cancelled}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="patient-dashboard-content admin-reports-page">
      <div className="no-print">
        <PageHeader 
          title="Reports & Analytics" 
          subtitle="System-wide statistics and performance reports"
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Button variant={period === "all" ? "primary" : "outline"} size="sm" onClick={() => setPeriod("all")}>Overall</Button>
            <Button variant={period === "today" ? "primary" : "outline"} size="sm" onClick={() => setPeriod("today")}>Today</Button>
            <Button variant={period === "weekly" ? "primary" : "outline"} size="sm" onClick={() => setPeriod("weekly")}>This Week</Button>
            <Button variant={period === "monthly" ? "primary" : "outline"} size="sm" onClick={() => setPeriod("monthly")}>This Month</Button>
            <Button variant={period === "yearly" ? "primary" : "outline"} size="sm" onClick={() => setPeriod("yearly")}>This Year</Button>
            <div style={{ width: "1px", height: "30px", backgroundColor: "var(--border)", margin: "0 10px" }}></div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}><Download size={16} style={{marginRight: "6px"}}/> Export CSV</Button>
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer size={16} style={{marginRight: "6px"}}/> Print PDF</Button>
          </div>
        </PageHeader>
      </div>

      {error ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "40px", color: "var(--error)", background: "#fef2f2", borderRadius: "12px" }}>
            <AlertCircle size={24} />
            <p style={{margin: 0, fontWeight: 500}}>{error}</p>
        </div>
      ) : loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "100px", gap: "12px" }}>
            <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>Generating reports...</p>
        </div>
      ) : (
        <div className="print-container">
          <h2 className="print-only-title" style={{ display: "none" }}>MediBook Admin Report - {period.toUpperCase()}</h2>
          
          <section className="admin-stats-grid" style={{ marginBottom: "24px" }}>
            <div className="admin-stat-card">
              <h4 className="admin-stat-title">Total Visits</h4>
              <p className="admin-stat-value">{summary.total}</p>
            </div>
            <div className="admin-stat-card">
              <h4 className="admin-stat-title" style={{color: "var(--success)"}}>Completed</h4>
              <p className="admin-stat-value">{summary.completed}</p>
            </div>
            <div className="admin-stat-card">
              <h4 className="admin-stat-title" style={{color: "var(--primary)"}}>Upcoming</h4>
              <p className="admin-stat-value">{summary.upcoming}</p>
            </div>
            <div className="admin-stat-card">
              <h4 className="admin-stat-title" style={{color: "var(--warning)"}}>Pending</h4>
              <p className="admin-stat-value">{summary.pending}</p>
            </div>
            <div className="admin-stat-card">
              <h4 className="admin-stat-title" style={{color: "var(--error)"}}>Cancelled</h4>
              <p className="admin-stat-value">{summary.cancelled}</p>
            </div>
          </section>

          <section className="dashboard-main-info-grid" style={{ marginBottom: "24px" }}>
             <Card>
                <h3 className="section-main-title">Visit Trend</h3>
                <div style={{ height: "300px", width: "100%" }}>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="visits" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No trend data for this period</div>
                  )}
                </div>
             </Card>
             <Card>
                <h3 className="section-main-title">Status Distribution</h3>
                <div style={{ height: "300px", width: "100%" }}>
                  {statusPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No visits to distribute</div>
                  )}
                </div>
             </Card>
          </section>

          <section className="dashboard-main-info-grid" style={{ marginBottom: "24px" }}>
            <Card>
                <h3 className="section-main-title">Doctor-wise Visits</h3>
                <div style={{ height: "300px", width: "100%" }}>
                  {doctorWise.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={doctorWise.slice(0, 5)} layout="vertical" margin={{ left: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="doctorName" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="totalVisits" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No data available</div>
                  )}
                </div>
            </Card>
            <Card>
                <h3 className="section-main-title">Hospital-wise Visits</h3>
                <div style={{ height: "300px", width: "100%" }}>
                  {hospitalWise.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hospitalWise.slice(0, 5)} layout="vertical" margin={{ left: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="hospitalName" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="totalVisits" fill="#00C49F" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No data available</div>
                  )}
                </div>
            </Card>
          </section>

          <Card style={{ marginBottom: "24px" }}>
            <h3 className="section-main-title" style={{ marginBottom: "16px" }}>Patient-wise Report</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Total Visits</th>
                    <th>Completed</th>
                    <th>Upcoming</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {patientWise.map(p => (
                    <tr key={p.patientId}>
                      <td style={{ fontWeight: 500 }}>{p.patientName}</td>
                      <td>{p.totalVisits}</td>
                      <td style={{ color: "var(--success)" }}>{p.completed}</td>
                      <td style={{ color: "var(--primary)" }}>{p.upcoming}</td>
                      <td style={{ color: "var(--warning)" }}>{p.pending}</td>
                      <td style={{ color: "var(--error)" }}>{p.cancelled}</td>
                    </tr>
                  ))}
                  {patientWise.length === 0 && (
                    <tr><td colSpan="6" style={{textAlign: "center", color: "var(--text-muted)", padding: "20px"}}>No patient data found for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card style={{ marginBottom: "24px" }}>
            <h3 className="section-main-title" style={{ marginBottom: "16px" }}>Doctor-wise Report</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Hospital</th>
                    <th>Total Visits</th>
                    <th>Completed</th>
                    <th>Upcoming</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorWise.map(d => (
                    <tr key={d.doctorId}>
                      <td style={{ fontWeight: 500 }}>{d.doctorName}</td>
                      <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{d.hospitalName}</td>
                      <td>{d.totalVisits}</td>
                      <td style={{ color: "var(--success)" }}>{d.completed}</td>
                      <td style={{ color: "var(--primary)" }}>{d.upcoming}</td>
                      <td style={{ color: "var(--warning)" }}>{d.pending}</td>
                      <td style={{ color: "var(--error)" }}>{d.cancelled}</td>
                    </tr>
                  ))}
                  {doctorWise.length === 0 && (
                    <tr><td colSpan="7" style={{textAlign: "center", color: "var(--text-muted)", padding: "20px"}}>No doctor data found for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card style={{ marginBottom: "24px" }}>
            <h3 className="section-main-title" style={{ marginBottom: "16px" }}>Hospital-wise Report</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hospital Name</th>
                    <th>Total Visits</th>
                    <th>Completed</th>
                    <th>Upcoming</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitalWise.map(h => (
                    <tr key={h.hospitalId}>
                      <td style={{ fontWeight: 500 }}>{h.hospitalName}</td>
                      <td>{h.totalVisits}</td>
                      <td style={{ color: "var(--success)" }}>{h.completed}</td>
                      <td style={{ color: "var(--primary)" }}>{h.upcoming}</td>
                      <td style={{ color: "var(--warning)" }}>{h.pending}</td>
                      <td style={{ color: "var(--error)" }}>{h.cancelled}</td>
                    </tr>
                  ))}
                  {hospitalWise.length === 0 && (
                    <tr><td colSpan="6" style={{textAlign: "center", color: "var(--text-muted)", padding: "20px"}}>No hospital data found for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      )}
    </div>
  );
}

export default AdminReports;
