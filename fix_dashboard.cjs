const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// Add api import
if (!content.includes('import { api }')) {
  content = content.replace('import { getCurrentUser } from "../utils/auth";', 'import { getCurrentUser } from "../utils/auth";\nimport { api } from "../utils/api";');
}

// Update loadDoctorData
const fetchBlockSearch = `    const rawDocId = doc?.id ?? user?.refId ?? user?.id;
    const rawDocName = doc?.name ?? user?.name;

    const docIdInt = rawDocId || "";
    const normDocName = String(rawDocName || "").trim().toLowerCase();

    try {
      const response = await fetch("http://localhost:5107/api/Appointments");
      if (!response.ok) {
        throw new Error(\`Server returned HTTP \${response.status}\`);
      }
      const data = await response.json();
      const allApiAppts = Array.isArray(data) ? data.map(normalizeBackendAppointment) : [];

      // Filter appointments belonging to current doctor
      const myAppts = allApiAppts.filter((apt) => {
        const aptDocIdInt = apt.doctorId || "";
        const aptDocNameStr = String(apt.doctorName || "").trim().toLowerCase();

        // 1. Doctor ID match
        if (docIdInt && aptDocIdInt && docIdInt === aptDocIdInt) return true;

        // 2. Doctor Name match
        if (normDocName && aptDocNameStr && (normDocName === aptDocNameStr || normDocName.includes(aptDocNameStr) || aptDocNameStr.includes(normDocName))) return true;

        // 3. Fallback for doctor ID 1 / default doctor if no specific doctor ID
        if ((!docIdInt || docIdInt === 1) && (!aptDocIdInt || aptDocIdInt === 1)) return true;

        return false;
      });

      setAppointments(myAppts);`;

const fetchBlockReplace = `    const rawDocId = user?.doctorId || doc?.id || user?.refId || user?.id;
    const docIdInt = rawDocId || "";

    try {
      if (!docIdInt) {
         setAppointments([]);
         return;
      }
      
      const response = await api.get(\`/Appointments/doctor/\${docIdInt}\`);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch appointments");
      }
      
      const data = response.data;
      const myAppts = Array.isArray(data) ? data.map(normalizeBackendAppointment) : [];
      setAppointments(myAppts);`;

if(content.includes(fetchBlockSearch)) {
  content = content.replace(fetchBlockSearch, fetchBlockReplace);
  fs.writeFileSync('src/pages/Dashboard.jsx', content);
  console.log('Dashboard.jsx patched successfully');
} else {
  console.log('Dashboard.jsx pattern not found!');
}
