const http = require('http');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (data) {
      if (!reqOptions.headers['Content-Type']) {
        reqOptions.headers['Content-Type'] = 'application/json';
      }
      reqOptions.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Automated Verification Tests on API...\n');

  try {
    // 1. Health check
    console.log('1. Testing GET /api/health...');
    const health = await request('http://localhost:5000/api/health');
    console.log(`Status: ${health.statusCode}, Response:`, health.body);
    if (health.statusCode !== 200) throw new Error('Health check failed');

    // 2. Slots for Sunday (should be non-working day)
    console.log('\n2. Testing GET /api/available-slots for Sunday (2026-09-06)...');
    const sundayRes = await request('http://localhost:5000/api/available-slots?date=2026-09-06');
    console.log(`Status: ${sundayRes.statusCode}, isWorkingDay: ${sundayRes.body.isWorkingDay}, message: ${sundayRes.body.message}`);
    if (sundayRes.body.isWorkingDay !== false) throw new Error('Sunday was expected to be non-working day');

    // 3. Slots for Monday (should have 6 slots between 5pm and 7pm IST)
    console.log('\n3. Testing GET /api/available-slots for Monday (2026-09-07)...');
    const mondayRes = await request('http://localhost:5000/api/available-slots?date=2026-09-07');
    console.log(`Status: ${mondayRes.statusCode}, Slots count: ${mondayRes.body.slots?.length}`);
    mondayRes.body.slots.forEach(s => console.log(`  - ${s.label}: available=${s.isAvailable}`));
    if (mondayRes.body.slots?.length !== 6) throw new Error('Expected exactly 6 20-min slots');

    const firstSlot = mondayRes.body.slots[0];

    // 4. Create booking on first slot
    console.log(`\n4. Testing POST /api/bookings on slot: ${firstSlot.label}...`);
    const bookingPayload = JSON.stringify({
      studentName: 'Simranjit Kaur',
      collegeName: 'PMN College, Rajpura',
      universityName: 'Punjabi University, Patiala',
      studentEmail: 'simranjit.kaur@gmail.com',
      studentPhone: '+91 98765 43210',
      purpose: 'Career Advice',
      shortDescription: 'Guidance on M.Sc vs Industry after B.Sc at PMN College',
      referralSource: 'Instagram',
      slotStart: firstSlot.slotStart,
      slotEnd: firstSlot.slotEnd
    });

    const createRes = await request('http://localhost:5000/api/bookings', { method: 'POST' }, bookingPayload);
    console.log(`Status: ${createRes.statusCode}, Response:`, createRes.body);
    if (createRes.statusCode !== 201) throw new Error('Booking creation failed');

    // 5. Test Double-Booking Prevention (Edge Case 1)
    console.log(`\n5. Testing Double-Booking Collision on same slot...`);
    const duplicatePayload = JSON.stringify({
      studentName: 'Amanpreet Singh',
      collegeName: 'Government Bikram College',
      universityName: 'Punjabi University, Patiala',
      studentEmail: 'amanpreet@gmail.com',
      purpose: 'Internship Guidance',
      slotStart: firstSlot.slotStart,
      slotEnd: firstSlot.slotEnd
    });

    const duplicateRes = await request('http://localhost:5000/api/bookings', { method: 'POST' }, duplicatePayload);
    console.log(`Status: ${duplicateRes.statusCode} (Expected 409 Conflict), Response:`, duplicateRes.body);
    if (duplicateRes.statusCode !== 409) throw new Error('Expected 409 Conflict for double booking attempt');
    console.log('✅ Double-booking collision successfully blocked with 409 Conflict!');

    console.log('\n🎉 ALL AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification test failed:', err);
    process.exit(1);
  }
}

// Give server 1 second to accept connections if started together
setTimeout(runTests, 1200);
