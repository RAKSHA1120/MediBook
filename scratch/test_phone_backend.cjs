const http = require('http');

function postJson(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5107,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let resBody = '';
      res.on('data', (chunk) => resBody += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: resBody });
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Backend Phone Validation ---');

  // Test 1: Register with 9-digit mobile
  const reg9 = await postJson('/api/Auth/register', {
    name: 'Test',
    mobile: '987654321',
    password: 'Password@123',
    gender: 'Male',
    age: 25
  });
  console.log('Register 9 digits:', reg9.status, reg9.body);

  // Test 2: Register with 11-digit mobile
  const reg11 = await postJson('/api/Auth/register', {
    name: 'Test',
    mobile: '98765432101',
    password: 'Password@123',
    gender: 'Male',
    age: 25
  });
  console.log('Register 11 digits:', reg11.status, reg11.body);

  // Test 3: Register with +91 mobile
  const regPlus = await postJson('/api/Auth/register', {
    name: 'Test',
    mobile: '+919876543210',
    password: 'Password@123',
    gender: 'Male',
    age: 25
  });
  console.log('Register +91:', regPlus.status, regPlus.body);

  // Test 4: Register with letters
  const regLetters = await postJson('/api/Auth/register', {
    name: 'Test',
    mobile: '98765abc10',
    password: 'Password@123',
    gender: 'Male',
    age: 25
  });
  console.log('Register letters:', regLetters.status, regLetters.body);

  // Test 5: Register with space
  const regSpace = await postJson('/api/Auth/register', {
    name: 'Test',
    mobile: '98765 43210',
    password: 'Password@123',
    gender: 'Male',
    age: 25
  });
  console.log('Register space:', regSpace.status, regSpace.body);

  // Test 6: Login with invalid mobile (starts with digit, 9 digits)
  const login9 = await postJson('/api/Auth/login', {
    loginId: '987654321',
    password: 'Password@123'
  });
  console.log('Login 9 digits:', login9.status, login9.body);

  // Test 7: Login with +91 mobile
  const loginPlus = await postJson('/api/Auth/login', {
    loginId: '+919876543210',
    password: 'Password@123'
  });
  console.log('Login +91:', loginPlus.status, loginPlus.body);

  // Test 8: Reset password with 9-digit mobile
  const reset9 = await postJson('/api/Users/reset-password', {
    mobile: '987654321',
    newPassword: 'Password@123'
  });
  console.log('Reset password 9 digits:', reset9.status, reset9.body);

  // Test 9: Create patient with invalid phone
  const patInvalid = await postJson('/api/Patients', {
    name: 'Test Pat',
    mobile: '98765@3210'
  });
  console.log('Create patient invalid:', patInvalid.status, patInvalid.body);

  // Test 10: Create doctor with invalid phone
  const docInvalid = await postJson('/api/Doctors', {
    name: 'Test Doc',
    specialty: 'Cardiology',
    hospitalId: 1,
    phone: '123456789'
  });
  console.log('Create doctor invalid:', docInvalid.status, docInvalid.body);

  // Test 11: Create hospital with invalid phone
  const hospInvalid = await postJson('/api/Hospitals', {
    name: 'Test Hosp',
    phone: '+919876543210'
  });
  console.log('Create hospital invalid:', hospInvalid.status, hospInvalid.body);

  console.log('--- Done Backend Phone Validation ---');
}

runTests();
