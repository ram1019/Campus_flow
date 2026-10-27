import User from './models/User.js';
import Complaint from './models/Complaint.js';
import Notification from './models/Notification.js';
import AuditLog from './models/AuditLog.js';
import { ComplaintStatus, PriorityLevels, calculateSlaDeadline } from './services/fsmService.js';
import { connectDB, disconnectDB } from './config/db.js';

export const seedDefaultDataIfNeeded = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }
    console.log('Database is empty. Automatically seeding initial demo data...');
    await runSeed();
  } catch (err) {
    console.error('Auto seed check error:', err.message);
  }
};

export const runSeed = async () => {
  try {
    // Clear collections
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Creating demo users...');
    const defaultPassword = 'password123';

    const admin = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'admin@campusflow.edu',
      password: defaultPassword,
      role: 'admin',
      department: 'General Administration',
      phone: '+91 98765 43210',
    });

    const staffElec = await User.create({
      name: 'Suresh Kumar',
      email: 'staff.electrical@campusflow.edu',
      password: defaultPassword,
      role: 'staff',
      department: 'Electrical',
      phone: '+91 98765 43211',
    });

    const staffNet = await User.create({
      name: 'Priya Menon',
      email: 'staff.network@campusflow.edu',
      password: defaultPassword,
      role: 'staff',
      department: 'IT & Network',
      phone: '+91 98765 43212',
    });

    const staffPlumb = await User.create({
      name: 'Ramesh Patil',
      email: 'staff.plumbing@campusflow.edu',
      password: defaultPassword,
      role: 'staff',
      department: 'Plumbing',
      phone: '+91 98765 43213',
    });

    const studentArjun = await User.create({
      name: 'Arjun Verma',
      email: 'student.arjun@campusflow.edu',
      password: defaultPassword,
      role: 'student',
      department: 'None',
      hostelOrRoom: 'Hostel B - Room 204',
      phone: '+91 98765 43214',
      studentId: 'CS2023048',
    });

    const studentAnanya = await User.create({
      name: 'Ananya Iyer',
      email: 'student.ananya@campusflow.edu',
      password: defaultPassword,
      role: 'student',
      department: 'None',
      hostelOrRoom: 'Hostel A - Room 112',
      phone: '+91 98765 43215',
      studentId: 'EC2023112',
    });

    console.log('Seeding complaints with state transitions and realistic histories...');

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 3600 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
    const fiveHoursAgo = new Date(now.getTime() - 5 * 3600 * 1000);

    // Complaint 1: IN_PROGRESS
    const c1 = await Complaint.create({
      ticketNumber: 'CF-202610-1001',
      title: 'Wi-Fi access point rebooting frequently in Central Library',
      description: 'The Wi-Fi signal drops every 10 minutes on the 2nd-floor reading area. Multiple students preparing for exams are unable to maintain stable connections to university portal.',
      category: 'Wi-Fi & Network',
      location: {
        zone: 'Central Campus',
        building: 'Dr. APJ Abdul Kalam Library',
        roomNumber: '2nd Floor Reading Hall B',
      },
      priority: PriorityLevels.HIGH,
      status: ComplaintStatus.IN_PROGRESS,
      createdBy: studentArjun._id,
      assignedDepartment: 'IT & Network',
      assignedTo: staffNet._id,
      images: [],
      slaDeadline: calculateSlaDeadline(PriorityLevels.HIGH, oneDayAgo),
      createdAt: oneDayAgo,
      timeline: [
        {
          status: ComplaintStatus.SUBMITTED,
          changedBy: studentArjun._id,
          note: 'Complaint submitted by student.',
          timestamp: oneDayAgo,
        },
        {
          status: ComplaintStatus.ASSIGNED,
          changedBy: admin._id,
          note: 'Assigned to IT & Network department technician Priya Menon.',
          timestamp: new Date(oneDayAgo.getTime() + 2 * 3600 * 1000),
        },
        {
          status: ComplaintStatus.IN_PROGRESS,
          changedBy: staffNet._id,
          note: 'Technician on site inspecting PoE switch and access point firmware logs.',
          timestamp: fiveHoursAgo,
        },
      ],
    });

    // Complaint 2: RESOLVED (Awaiting student closure)
    const c2 = await Complaint.create({
      ticketNumber: 'CF-202610-1002',
      title: 'Water pipe leakage causing flooding in Hostel B washroom',
      description: 'Major water pipe under the third sink in 2nd-floor common washroom is cracked and leaking water continuously onto the floor.',
      category: 'Plumbing',
      location: {
        zone: 'Hostel Block',
        building: 'Hostel Block B (Boys)',
        roomNumber: 'Floor 2 Common Washroom',
      },
      priority: PriorityLevels.CRITICAL,
      status: ComplaintStatus.RESOLVED,
      createdBy: studentArjun._id,
      assignedDepartment: 'Plumbing',
      assignedTo: staffPlumb._id,
      images: [],
      resolution: {
        notes: 'Replaced cracked PVC fitting and pressure tested inlet valve. No further leaks detected. Area cleaned.',
        proofImage: '',
        resolvedAt: fiveHoursAgo,
        resolvedBy: staffPlumb._id,
      },
      slaDeadline: calculateSlaDeadline(PriorityLevels.CRITICAL, twoDaysAgo),
      createdAt: twoDaysAgo,
      timeline: [
        {
          status: ComplaintStatus.SUBMITTED,
          changedBy: studentArjun._id,
          note: 'Urgent complaint submitted.',
          timestamp: twoDaysAgo,
        },
        {
          status: ComplaintStatus.ASSIGNED,
          changedBy: admin._id,
          note: 'Dispatched to Plumbing unit supervisor Ramesh Patil.',
          timestamp: new Date(twoDaysAgo.getTime() + 1 * 3600 * 1000),
        },
        {
          status: ComplaintStatus.IN_PROGRESS,
          changedBy: staffPlumb._id,
          note: 'Water main isolated; replacement pipe coupling being installed.',
          timestamp: new Date(twoDaysAgo.getTime() + 4 * 3600 * 1000),
        },
        {
          status: ComplaintStatus.RESOLVED,
          changedBy: staffPlumb._id,
          note: 'Replaced cracked PVC fitting and pressure tested. All clear.',
          timestamp: fiveHoursAgo,
        },
      ],
    });

    // Complaint 3: ASSIGNED
    const c3 = await Complaint.create({
      ticketNumber: 'CF-202610-1003',
      title: 'Ceiling fan making loud grinding noise and sparking',
      description: 'Ceiling fan above row 3 sparks occasionally when switched on high speed. Potential electrical safety hazard.',
      category: 'Electrical',
      location: {
        zone: 'Academic Block',
        building: 'Ramanujan Science Complex',
        roomNumber: 'Lecture Hall 304',
      },
      priority: PriorityLevels.HIGH,
      status: ComplaintStatus.ASSIGNED,
      createdBy: studentAnanya._id,
      assignedDepartment: 'Electrical',
      assignedTo: staffElec._id,
      images: [],
      slaDeadline: calculateSlaDeadline(PriorityLevels.HIGH, fiveHoursAgo),
      createdAt: fiveHoursAgo,
      timeline: [
        {
          status: ComplaintStatus.SUBMITTED,
          changedBy: studentAnanya._id,
          note: 'Hazard ticket registered.',
          timestamp: fiveHoursAgo,
        },
        {
          status: ComplaintStatus.ASSIGNED,
          changedBy: admin._id,
          note: 'Assigned to Suresh Kumar for capacitor and motor inspection.',
          timestamp: new Date(fiveHoursAgo.getTime() + 30 * 60 * 1000),
        },
      ],
    });

    // Complaint 4: SUBMITTED (New, unassigned)
    const c4 = await Complaint.create({
      ticketNumber: 'CF-202610-1004',
      title: 'Broken chair desk armrest in Seminar Room 102',
      description: 'Three wooden desk armrests are loose and cracked, with nails protruding slightly. Needs repair or carpentry replacement.',
      category: 'Carpentry',
      location: {
        zone: 'Academic Block',
        building: 'Visvesvaraya Engineering Block',
        roomNumber: 'Seminar Room 102',
      },
      priority: PriorityLevels.MEDIUM,
      status: ComplaintStatus.SUBMITTED,
      createdBy: studentAnanya._id,
      assignedDepartment: 'Carpentry',
      assignedTo: null,
      images: [],
      slaDeadline: calculateSlaDeadline(PriorityLevels.MEDIUM, now),
      createdAt: now,
      timeline: [
        {
          status: ComplaintStatus.SUBMITTED,
          changedBy: studentAnanya._id,
          note: 'Complaint registered by student.',
          timestamp: now,
        },
      ],
    });

    // Complaint 5: CLOSED (With student 5-star rating & review)
    const c5 = await Complaint.create({
      ticketNumber: 'CF-202610-1005',
      title: 'HDMI ceiling projector in Seminar Hall C not displaying input',
      description: 'Projector displays "No Signal" despite connecting laptops via HDMI/VGA cables.',
      category: 'Lab & Equipment',
      location: {
        zone: 'Academic Block',
        building: 'Main Administrative & Auditorium Block',
        roomNumber: 'Seminar Hall C',
      },
      priority: PriorityLevels.MEDIUM,
      status: ComplaintStatus.CLOSED,
      createdBy: studentArjun._id,
      assignedDepartment: 'IT & Network',
      assignedTo: staffNet._id,
      images: [],
      resolution: {
        notes: 'Replaced faulty in-wall HDMI repeater cable and re-calibrated projector display input resolution.',
        proofImage: '',
        resolvedAt: new Date(twoDaysAgo.getTime() + 12 * 3600 * 1000),
        resolvedBy: staffNet._id,
      },
      feedback: {
        rating: 5,
        comment: 'Resolved quickly before our departmental symposium! Thank you so much for the swift help.',
        submittedAt: oneDayAgo,
      },
      slaDeadline: calculateSlaDeadline(PriorityLevels.MEDIUM, new Date(twoDaysAgo.getTime() - 24 * 3600 * 1000)),
      createdAt: new Date(twoDaysAgo.getTime() - 24 * 3600 * 1000),
      timeline: [
        {
          status: ComplaintStatus.SUBMITTED,
          changedBy: studentArjun._id,
          note: 'Ticket submitted.',
          timestamp: new Date(twoDaysAgo.getTime() - 24 * 3600 * 1000),
        },
        {
          status: ComplaintStatus.ASSIGNED,
          changedBy: admin._id,
          note: 'Assigned to Priya Menon (IT).',
          timestamp: twoDaysAgo,
        },
        {
          status: ComplaintStatus.IN_PROGRESS,
          changedBy: staffNet._id,
          note: 'Testing cable continuity and switch port.',
          timestamp: new Date(twoDaysAgo.getTime() + 4 * 3600 * 1000),
        },
        {
          status: ComplaintStatus.RESOLVED,
          changedBy: staffNet._id,
          note: 'Replaced faulty cable and tested signal display.',
          timestamp: new Date(twoDaysAgo.getTime() + 12 * 3600 * 1000),
        },
        {
          status: ComplaintStatus.CLOSED,
          changedBy: studentArjun._id,
          note: 'Student verified and marked closed with 5-star rating.',
          timestamp: oneDayAgo,
        },
      ],
    });

    // Complaint 6: REOPENED
    const c6 = await Complaint.create({
      ticketNumber: 'CF-202610-1006',
      title: 'Air conditioner tripping circuit breaker in Computer Lab 4',
      description: 'The split AC unit in Computer Lab 4 runs for 10 minutes then trips the main distribution board circuit breaker.',
      category: 'Electrical',
      location: {
        zone: 'Academic Block',
        building: 'Turing Computer Science Building',
        roomNumber: 'Computer Lab 4 (Ground Floor)',
      },
      priority: PriorityLevels.HIGH,
      status: ComplaintStatus.REOPENED,
      createdBy: studentAnanya._id,
      assignedDepartment: 'Electrical',
      assignedTo: staffElec._id,
      reopenReason: 'Technician reset the breaker yesterday, but as soon as full class turned on lab PCs today, the breaker tripped again.',
      images: [],
      slaDeadline: calculateSlaDeadline(PriorityLevels.HIGH, now),
      createdAt: oneDayAgo,
      timeline: [
        {
          status: ComplaintStatus.SUBMITTED,
          changedBy: studentAnanya._id,
          note: 'Ticket registered.',
          timestamp: oneDayAgo,
        },
        {
          status: ComplaintStatus.ASSIGNED,
          changedBy: admin._id,
          note: 'Assigned to Suresh Kumar.',
          timestamp: new Date(oneDayAgo.getTime() + 2 * 3600 * 1000),
        },
        {
          status: ComplaintStatus.RESOLVED,
          changedBy: staffElec._id,
          note: 'Reset breaker and tightened terminal wiring.',
          timestamp: fiveHoursAgo,
        },
        {
          status: ComplaintStatus.REOPENED,
          changedBy: studentAnanya._id,
          note: 'Reopened: Tripped again under lab load.',
          timestamp: new Date(fiveHoursAgo.getTime() + 1 * 3600 * 1000),
        },
      ],
    });

    // Seed initial notifications
    await Notification.create([
      {
        recipient: studentArjun._id,
        title: 'Issue Resolved — Please Confirm',
        message: 'Your complaint "Water pipe leakage causing flooding in Hostel B washroom" (CF-202610-1002) has been resolved. Please review and close the ticket.',
        type: 'STATUS_CHANGE',
        complaint: c2._id,
        isRead: false,
      },
      {
        recipient: staffNet._id,
        title: 'New Complaint Assigned to You',
        message: 'You have been assigned ticket CF-202610-1001: "Wi-Fi access point rebooting frequently in Central Library"',
        type: 'ASSIGNED',
        complaint: c1._id,
        isRead: false,
      },
      {
        recipient: admin._id,
        title: 'New Complaint Submitted',
        message: 'New ticket CF-202610-1004 [MEDIUM]: "Broken chair desk armrest in Seminar Room 102"',
        type: 'STATUS_CHANGE',
        complaint: c4._id,
        isRead: false,
      },
    ]);

    // Initial audit logs
    await AuditLog.create([
      {
        action: 'DATABASE_INITIALIZED',
        performedBy: admin._id,
        userRole: 'admin',
        metadata: { info: 'Demo campus seed successfully populated.' },
      },
    ]);

    console.log('Demo seed completed successfully!');
    console.log('Demo Accounts created:');
    console.log('  Admin:   admin@campusflow.edu / password123');
    console.log('  Staff:   staff.electrical@campusflow.edu / password123');
    console.log('  Staff:   staff.network@campusflow.edu / password123');
    console.log('  Staff:   staff.plumbing@campusflow.edu / password123');
    console.log('  Student: student.arjun@campusflow.edu / password123');
    console.log('  Student: student.ananya@campusflow.edu / password123');
  } catch (err) {
    console.error('Error during seeding:', err);
    throw err;
  }
};

// If executed directly via `node src/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await runSeed();
    await disconnectDB();
    process.exit(0);
  })();
}
