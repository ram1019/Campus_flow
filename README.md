# CampusFlow — Smart Campus Management & Issue Resolution Platform

> An enterprise-grade, full-stack campus infrastructure and issue management platform featuring strict Finite State Machine (FSM) state transitions, Role-Based Access Control (RBAC), SLA countdown governance, image attachments, audit history trails, in-app notifications, and comprehensive administrative analytics.

---

## 1. Problem Statement

Students, faculty, and residents on university campuses frequently face broken or malfunctioning infrastructure—such as recurring Wi-Fi drops in lecture halls, leaking hostel washroom plumbing, electrical hazards (sparking ceiling fans or tripped breakers), damaged lab furniture, or classroom projector failures.

Without a centralized, transparent platform:
- Complaints are lost in manual registers or informal chat messages.
- Students do not know whether their complaints have been received, assigned, or acted upon.
- Maintenance technicians lack clear prioritization and assignment queues.
- Campus facility administrators have zero visibility into departmental response times, recurring failure zones, or SLA compliance breaches.

**CampusFlow solves this by bringing every stage of campus issue reporting, staff assignment, technician repair progression, and student confirmation into a unified, transparent application.**

---

## 2. Target Users

1. **Students & Campus Residents**:
   - Report issues in hostels, classrooms, libraries, laboratories, or sports facilities.
   - Attach photos of problems and specify campus zones, buildings, and room numbers.
   - Track ticket progress through live status badges and audit timelines.
   - Verify resolution quality, submit 1–5 star ratings, and close or reopen tickets.

2. **Maintenance Staff & Department Technicians** (Electrical, Plumbing, IT & Network, Carpentry, Housekeeping, Civil):
   - Receive department-specific task dispatches.
   - Transition tickets to `IN_PROGRESS` when starting on-site work.
   - Transition tickets to `RESOLVED` with mandatory resolution documentation and proof photos.

3. **Campus Facility Administrators (Dean / Estate Office)**:
   - Oversee campus-wide infrastructure health.
   - Assign unassigned complaints to designated departments and specific technicians.
   - Reassign or escalate high-priority and hazard tickets.
   - Monitor real-time analytics: total volume, active workloads, average resolution hours, SLA compliance rates, and department performance scorecards.

---

## 3. Key Engineering Highlights & Technical Workflows

### 1. Robust Finite State Machine (FSM) Lifecycle
State transitions are strictly verified and guarded on the backend:

$$\text{SUBMITTED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{IN\_PROGRESS} \longrightarrow \text{RESOLVED} \longrightarrow \text{CLOSED} \ (\text{or } \text{REOPENED})$$

- A student **cannot** mark their own complaint as `RESOLVED` (only authorized staff/admin can).
- A staff member **cannot** mark a ticket `CLOSED` (only the student creator can verify and close after rating).
- Any attempt to bypass the state machine (e.g. `SUBMITTED` $\rightarrow$ `RESOLVED`) is rejected by the backend with HTTP 400 and an explicit rejection explanation.

### 2. SLA Priority Deadlines & Automated Overdue Flags
- **CRITICAL** (e.g. electrical sparking, burst water main): **12-hour resolution SLA**
- **HIGH** (e.g. AC failure in computer lab, library Wi-Fi failure): **24-hour resolution SLA**
- **MEDIUM** (e.g. classroom projector display issue, broken chair desk): **48-hour resolution SLA**
- **LOW** (e.g. minor paint peeling, general cosmetic maintenance): **72-hour resolution SLA**

Tickets exceeding their SLA deadline automatically receive a visible `SLA Breached` badge and impact departmental compliance ratings.

### 3. Role-Based Access Control (RBAC) & Scoped Views
- Secured using industry-standard **JSON Web Tokens (JWT)** and **bcryptjs** password encryption.
- Multi-role authorization middleware (`student`, `staff`, `admin`) gates sensitive API endpoints.
- Scoped query filtration: students view their own tickets; technicians view their assigned department queue; administrators inspect the entire campus.

### 4. Complete Audit Trail & Timeline
- Every state transition, technician assignment, status change, and student review appends an immutable entry to the ticket's `timeline` sub-document with actor name, role, timestamp, and notes.

### 5. Media & Photo Proof Attachments
- Students upload defect images during reporting (stored via Multer with validation).
- Technicians upload proof of repair photos upon completion.

### 6. Interactive Executive Analytics Dashboard
- Comprehensive calculations: Total tickets, Active vs Resolved, SLA compliance rate, Average turnaround time (hours), Student satisfaction index (average star rating).
- Department workload distribution bar charts.
- Infrastructure issues categorized by facility type.
- Live administrative event stream reflecting system-wide state changes.

---

## 4. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, React Router v6
- **Backend**: Node.js, Express.js (ES Modules)
- **Database & ODM**: MongoDB, Mongoose 8 (with automatic embedded in-memory fallback for zero-configuration execution on any machine)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Media Handling**: Multer multipart file upload with mime-type filters and static serving
- **Logging & Utilities**: Morgan HTTP logging, Date manipulation, Concurrently

---

## 5. Instant Demo Credentials

CampusFlow includes pre-seeded demo accounts across all three roles so evaluators can test the entire state-transition lifecycle immediately without manually registering:

| Role | Name & Department | Email | Password |
|---|---|---|---|
| **Student** | Arjun Verma (Hostel B, CS Dept) | `student.arjun@campusflow.edu` | `password123` |
| **Student** | Ananya Iyer (Hostel A, EC Dept) | `student.ananya@campusflow.edu` | `password123` |
| **Staff / Tech** | Priya Menon (IT & Network) | `staff.network@campusflow.edu` | `password123` |
| **Staff / Tech** | Suresh Kumar (Electrical) | `staff.electrical@campusflow.edu` | `password123` |
| **Staff / Tech** | Ramesh Patil (Plumbing) | `staff.plumbing@campusflow.edu` | `password123` |
| **Administrator** | Dr. Rajesh Sharma (Estate Admin) | `admin@campusflow.edu` | `password123` |

> 💡 **Tip for Evaluators**: On the login page and navigation header, use the **"Instant Evaluator Demo Logins"** or **"Demo Role"** switcher pill to switch between Student, Staff, and Admin with one click!

---

## 6. Local Setup & Installation Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git**

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd END_PROJECT
```

### Step 2: Install Dependencies
Run the installation command from the root directory (installs root, server, and client packages):
```bash
npm run install:all
```
*(Or navigate into `server` and `client` individually and run `npm install`)*

### Step 3: Run the Application
Start both the Express backend and React frontend with a single command:
```bash
npm run dev
```

- **Frontend Client**: Accessible at [http://localhost:3000](http://localhost:3000)
- **Backend API**: Accessible at [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

> 🚀 **Zero-Configuration MongoDB**: If you do not have an external MongoDB instance running, CampusFlow will **automatically boot an embedded in-memory MongoDB database** and populate it with realistic campus complaints and users! If you wish to connect to your own MongoDB Atlas URI, simply set `MONGODB_URI` in `server/.env`.

---

## 7. Running the Automated Smoke Test Suite

To verify backend health, JWT authentication, FSM state-machine guards, legal assignments, and analytics calculation:
```bash
npm test
```
Or inside the server directory:
```bash
cd server
npm test
```

All 7 test suites will execute and validate the complete workflow.

---

## 8. Step-by-Step Evaluator Walkthrough

1. **Sign in as Student (`student.arjun@campusflow.edu` / `password123`)**:
   - Click **"Report Issue"** in the top bar.
   - Fill in category (e.g. *Classroom & Lecturing*), title (e.g. *Projector flickering*), zone (*Academic Block*), building (*Ramanujan Hall*), and priority (*High*).
   - Submit the ticket. Notice it enters `SUBMITTED` status with an automatic 24-hour SLA countdown.

2. **Switch to Administrator (`admin@campusflow.edu` / `password123`)**:
   - Go to **Dashboard** or **All Complaints**.
   - Notice the newly submitted ticket in the queue.
   - Click **"Assign"** on the ticket, choose the *IT & Network* department, and assign technician *Priya Menon*.
   - Confirm assignment: the ticket automatically transitions to `ASSIGNED`.

3. **Switch to Staff Technician (`staff.network@campusflow.edu` / `password123`)**:
   - Notice the in-app notification bell badge alerting the technician of the new assignment.
   - Click **"Start Work on Site"**: the ticket transitions to `IN_PROGRESS`.
   - Click **"Mark Resolved"**, enter resolution summary notes, and confirm: ticket enters `RESOLVED`.

4. **Switch back to Student (`student.arjun@campusflow.edu` / `password123`)**:
   - Notice the green notification banner: *"Your ticket has been marked resolved! Please review and close."*
   - Inspect the ticket details to view the technician's resolution report.
   - Click **"Confirm Resolution & Close"**, select a 5-star rating, leave a review, and confirm: ticket enters `CLOSED`.
   - Check the **State Transition Audit Trail** to observe every transition recorded with timestamps and actor roles!

5. **Open Admin Analytics (`/analytics`)**:
   - View real-time SLA compliance %, average turnaround hours, category distribution bars, and department performance tables.

---

## 9. Project Directory Structure

```text
END_PROJECT/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Badges, Modals, Timeline)
│   │   ├── context/            # AuthContext (JWT/roles), NotificationContext
│   │   ├── pages/              # Dashboard, ComplaintsList, Detail, NewComplaint, Analytics, Login, Register
│   │   ├── services/           # API wrapper with JWT injection
│   │   ├── App.jsx             # Route definitions & Protected Route guards
│   │   ├── main.jsx            # React root
│   │   └── index.css           # Tailwind custom styling & theme
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite config with API proxy
│   └── package.json
│
├── server/                     # Backend Application (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/             # DB connection with auto-embedded fallback
│   │   ├── controllers/        # Auth, Complaint, Analytics, Notification controllers
│   │   ├── middleware/         # Auth (JWT & RBAC), Multer image upload
│   │   ├── models/             # User, Complaint, Notification, AuditLog schemas
│   │   ├── routes/             # REST route definitions
│   │   ├── services/           # Finite State Machine (FSM) validation engine & SLA calculator
│   │   ├── seed.js             # Demo data population script
│   │   └── server.js           # Express app setup & route mounts
│   ├── uploads/                # Attached complaint & proof images
│   ├── test-api.js             # Automated API & FSM integration test suite
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── ARCHITECTURE.md             # System architecture, state machine diagrams & data models
├── package.json                # Monorepo runner scripts (concurrently)
└── README.md                   # Complete documentation & evaluator guide
```

---

## 10. Submission Metadata

- **Project Name**: CampusFlow — Smart Campus Management Platform
- **Problem Statement**: Centralized tracking, state-transition enforcement, and SLA governance for university campus facility issues.
- **Tech Stack**: React 18, Vite, Tailwind CSS, Node.js, Express.js, MongoDB / Mongoose, JWT, Multer
- **Major Features**:
  1. Finite State Machine (FSM) state lifecycle with server-side validation.
  2. Role-Based Access Control (Student, Staff / Technician, Campus Administrator).
  3. Priority-based SLA resolution countdowns with breach detection.
  4. Photo attachments for defect reporting and resolution proof.
  5. Complete audit timeline logging every transition with actor and timestamp.
  6. In-app notification center with real-time polling.
  7. Advanced filtering, search, and sorting across campus facilities.
  8. Administrative operations analytics dashboard with department performance scorecards.
#   C a m p u s _ f l o w  
 