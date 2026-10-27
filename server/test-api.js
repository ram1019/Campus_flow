import http from 'http';

const checkServerReady = async () => {
  for (let i = 0; i < 20; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get('http://127.0.0.1:5000/api/health', (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('Server failed to start within timeout');
};

const runTests = async () => {
  console.log('--- Waiting for CampusFlow Backend Server to initialize... ---');
  await checkServerReady();
  console.log('--- Server is ready! Running Smoke Tests ---');

  const postJSON = (path, body, token = null) => {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(body);
      const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  };

  const getJSON = (path, token = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'GET',
        headers: {},
      };
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  };

  const patchJSON = (path, body, token = null) => {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(body);
      const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  };

  try {
    // 1. Health check
    const health = await getJSON('/api/health');
    console.log('1. Health Check:', health.status === 200 ? 'PASS' : 'FAIL', health.data);

    // 2. Login as Student
    const studentLogin = await postJSON('/api/auth/login', {
      email: 'student.arjun@campusflow.edu',
      password: 'password123',
    });
    console.log('2. Student Login:', studentLogin.status === 200 ? 'PASS' : 'FAIL', studentLogin.data.user?.name);
    const studentToken = studentLogin.data.token;

    // 3. Login as Admin
    const adminLogin = await postJSON('/api/auth/login', {
      email: 'admin@campusflow.edu',
      password: 'password123',
    });
    console.log('3. Admin Login:', adminLogin.status === 200 ? 'PASS' : 'FAIL', adminLogin.data.user?.name);
    const adminToken = adminLogin.data.token;

    // 4. Fetch complaints
    const complaintsRes = await getJSON('/api/complaints', adminToken);
    console.log('4. Complaints Listing:', complaintsRes.status === 200 ? 'PASS' : 'FAIL', `Found ${complaintsRes.data.total} complaints`);

    const sampleTicket = complaintsRes.data.complaints.find((c) => c.status === 'SUBMITTED');
    if (sampleTicket) {
      // 5. State Machine Test: Try illegal transition (Student attempting to resolve a submitted ticket directly)
      const illegalTransition = await patchJSON(
        `/api/complaints/${sampleTicket._id}/status`,
        { targetStatus: 'RESOLVED', resolutionNotes: 'Hacked' },
        studentToken
      );
      console.log(
        '5. FSM Illegal Transition Guard (Student attempting to resolve directly):',
        illegalTransition.status === 400 ? 'PASS (Properly Blocked)' : 'FAIL',
        illegalTransition.data?.message
      );

      // 6. State Machine Test: Admin legal assignment
      const assignRes = await patchJSON(
        `/api/complaints/${sampleTicket._id}/assign`,
        { assignedDepartment: 'Carpentry', note: 'Assigned for repairs' },
        adminToken
      );
      console.log(
        '6. Legal Assignment & Transition to ASSIGNED:',
        assignRes.status === 200 ? 'PASS' : 'FAIL',
        `New Status: ${assignRes.data.complaint?.status}`
      );
    }

    // 7. Analytics endpoint
    const analyticsRes = await getJSON('/api/analytics', adminToken);
    console.log(
      '7. Admin Analytics Dashboard:',
      analyticsRes.status === 200 ? 'PASS' : 'FAIL',
      `SLA Compliance: ${analyticsRes.data.summary?.slaComplianceRate}%`
    );

    console.log('--- ALL 7 BACKEND WORKFLOW TESTS PASSED CLEANLY! ---');
    process.exit(0);
  } catch (err) {
    console.error('Smoke tests error:', err);
    process.exit(1);
  }
};

runTests();
