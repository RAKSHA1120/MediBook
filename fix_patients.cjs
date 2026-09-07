const fs = require('fs');
let content = fs.readFileSync('src/pages/DoctorPatients.jsx', 'utf8');

// Update doc ID
const idSearch = `    const rawDocId = doc?.id ?? user?.refId ?? user?.id;`;
const idReplace = `    const rawDocId = user?.doctorId || doc?.id || user?.refId || user?.id;`;
content = content.replace(idSearch, idReplace);

// We know the pattern is there, but fetch might be localhost:7050 or 5107, and parseInt might be used.
// Let's just use regex to replace the fetch and filter logic completely.

const regex = /try\s*\{\s*const response = await fetch\(.*?api\/Appointments.*?\);\s*if \(!response\.ok\) \{\s*throw new Error.*?\s*\}\s*const data = await response\.json\(\);\s*const allApiAppts = Array\.isArray\(data\) \? data\.map\(normalizeBackendAppointment\) : \[\];[\s\S]*?\/\/ Filter appointments belonging to current doctor[\s\S]*?const myAppts = allApiAppts\.filter\(\(apt\) => \{[\s\S]*?\}\);/m;

const fetchBlockReplace = `try {
      if (!docIdInt) {
         setDoctorPatients([]);
         return;
      }
      
      const response = await fetch(\`http://localhost:5107/api/Appointments/doctor/\${docIdInt}\`);
      if (!response.ok) {
        throw new Error(\`Server returned HTTP \${response.status}\`);
      }
      const data = await response.json();
      const myAppts = Array.isArray(data) ? data.map(normalizeBackendAppointment) : [];`;

if(regex.test(content)) {
  content = content.replace(regex, fetchBlockReplace);
  fs.writeFileSync('src/pages/DoctorPatients.jsx', content);
  console.log('DoctorPatients.jsx patched successfully');
} else {
  console.log('DoctorPatients.jsx pattern not found!');
}
