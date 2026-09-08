import { useState, useEffect, useMemo } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { api } from "../utils/api";
import { Loader2, Download, Printer, AlertCircle } from "lucide-react";

import "./AdminShared.css";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

/* ─────────────────────────────────────────
   Lightweight SVG Line Chart
   ───────────────────────────────────────── */
function SvgLineChart({ data, dataKey = "visits", xKey = "date" }) {
  const W = 500, H = 220, PAD = { top: 16, right: 16, bottom: 40, left: 40 };
  if (!data || data.length === 0)
    return <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No trend data for this period</div>;

  const values = data.map(d => Number(d[dataKey]) || 0);
  const maxV = Math.max(...values, 1);
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const xPos = i => PAD.left + (i / (data.length - 1 || 1)) * iW;
  const yPos = v => PAD.top + iH - (v / maxV) * iH;

  const points = data.map((d, i) => `${xPos(i)},${yPos(Number(d[dataKey]) || 0)}`).join(" ");
  const fillPoints = `${PAD.left},${PAD.top + iH} ${points} ${xPos(data.length - 1)},${PAD.top + iH}`;

  // Y ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxV * f));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
      {/* Grid */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yPos(v)} y2={yPos(v)} stroke="#e5e7eb" strokeDasharray="4 3" />
          <text x={PAD.left - 6} y={yPos(v) + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{v}</text>
        </g>
      ))}
      {/* Area fill */}
      <polygon points={fillPoints} fill="var(--primary)" fillOpacity={0.1} />
      {/* Line */}
      <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots + X labels */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xPos(i)} cy={yPos(Number(d[dataKey]) || 0)} r={4} fill="var(--primary)" />
          <text x={xPos(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="#9ca3af">
            {String(d[xKey]).slice(0, 5)}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────
   Lightweight SVG Horizontal Bar Chart
   ───────────────────────────────────────── */
function SvgBarChart({ data, dataKey = "totalVisits", nameKey = "doctorName", color = "var(--primary)" }) {
  const W = 500, ROW_H = 44, PAD = { top: 12, right: 20, bottom: 12, left: 120 };
  if (!data || data.length === 0)
    return <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No data available</div>;

  const items = data.slice(0, 5);
  const H = PAD.top + items.length * ROW_H + PAD.bottom;
  const maxV = Math.max(...items.map(d => Number(d[dataKey]) || 0), 1);
  const barW = W - PAD.left - PAD.right;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
      {items.map((d, i) => {
        const val = Number(d[dataKey]) || 0;
        const bw = (val / maxV) * barW;
        const y = PAD.top + i * ROW_H;
        const label = String(d[nameKey]);
        return (
          <g key={i}>
            {/* Name */}
            <text x={PAD.left - 8} y={y + ROW_H / 2 + 4} textAnchor="end" fontSize={11} fill="#374151">
              {label.length > 14 ? label.slice(0, 13) + "…" : label}
            </text>
            {/* Bar background */}
            <rect x={PAD.left} y={y + 8} width={barW} height={ROW_H - 18} rx={4} fill="#f3f4f6" />
            {/* Bar fill */}
            <rect x={PAD.left} y={y + 8} width={bw} height={ROW_H - 18} rx={4} fill={color} />
            {/* Value */}
            <text x={PAD.left + bw + 6} y={y + ROW_H / 2 + 4} fontSize={10} fill="#6b7280">{val}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────
   Lightweight SVG Donut / Pie Chart
   ───────────────────────────────────────── */
function SvgPieChart({ data }) {
  const SIZE = 220, CX = 110, CY = 100, R_OUT = 85, R_IN = 52;
  if (!data || data.length === 0)
    return <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No visits to distribute</div>;

  const total = data.reduce((s, d) => s + d.value, 0);
  let angle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = CX + R_OUT * Math.cos(angle);
    const y1 = CY + R_OUT * Math.sin(angle);
    const x2 = CX + R_IN * Math.cos(angle);
    const y2 = CY + R_IN * Math.sin(angle);
    angle += sweep;
    const x3 = CX + R_OUT * Math.cos(angle);
    const y3 = CY + R_OUT * Math.sin(angle);
    const x4 = CX + R_IN * Math.cos(angle);
    const y4 = CY + R_IN * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const path = [
      `M ${x1} ${y1}`,
      `A ${R_OUT} ${R_OUT} 0 ${large} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${R_IN} ${R_IN} 0 ${large} 0 ${x2} ${y2}`,
      "Z"
    ].join(" ");
    return { path, color: COLORS[i % COLORS.length], name: d.name, value: d.value };
  });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: "100%", height: "100%" }}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />
      ))}
      {/* Centre label */}
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#374151">{total}</text>
      <text x={CX} y={CY + 10} textAnchor="middle" fontSize={10} fill="#9ca3af">Total</text>
      {/* Legend */}
      {slices.map((s, i) => (
        <g key={i} transform={`translate(8, ${SIZE - slices.length * 18 + i * 18})`}>
          <rect width={10} height={10} rx={2} fill={s.color} />
          <text x={14} y={9} fontSize={10} fill="#374151">{s.name} ({s.value})</text>
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────
   Main Page
   ───────────────────────────────────────── */
function AdminReports() {
  const [period, setPeriod] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
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
                <div style={{ height: "260px", width: "100%" }}>
                  <SvgLineChart data={trendData} dataKey="visits" xKey="date" />
                </div>
             </Card>
             <Card>
                <h3 className="section-main-title">Status Distribution</h3>
                <div style={{ height: "260px", width: "100%" }}>
                  <SvgPieChart data={statusPieData} />
                </div>
             </Card>
          </section>

          <section className="dashboard-main-info-grid" style={{ marginBottom: "24px" }}>
            <Card>
                <h3 className="section-main-title">Doctor-wise Visits</h3>
                <div style={{ height: "260px", width: "100%" }}>
                  <SvgBarChart data={doctorWise} dataKey="totalVisits" nameKey="doctorName" color="var(--primary)" />
                </div>
            </Card>
            <Card>
                <h3 className="section-main-title">Hospital-wise Visits</h3>
                <div style={{ height: "260px", width: "100%" }}>
                  <SvgBarChart data={hospitalWise} dataKey="totalVisits" nameKey="hospitalName" color="#00C49F" />
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
