const fetch = require('node-fetch');

async function testPut() {
    const doctorId = 1; // Assuming doctor 1 exists
    const url = `http://localhost:5246/api/Doctors/${doctorId}`;
    
    // First GET the doctor
    let res = await fetch(url);
    if (!res.ok) {
        console.log("Doctor not found.");
        return;
    }
    const doc = await res.json();
    console.log("Before:", doc.name);
    
    // Update the doctor
    doc.name = doc.name + " Updated";
    
    // PUT
    const putRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
    });
    
    console.log("PUT status:", putRes.status);
    
    // Verify
    res = await fetch(url);
    const updatedDoc = await res.json();
    console.log("After:", updatedDoc.name);
}

testPut();
