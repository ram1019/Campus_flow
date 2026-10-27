# 🎓 CampusFlow — Smart Campus Management & Issue Resolution Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb)
![Status](https://img.shields.io/badge/status-active-success)

> An enterprise-grade, full-stack campus infrastructure and issue management platform featuring strict **Finite State Machine (FSM)** state transitions, **Role-Based Access Control (RBAC)**, SLA countdown governance, image attachments, audit history trails, in-app notifications, and comprehensive administrative analytics.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Target Users](#-target-users)
- [Key Engineering Highlights](#-key-engineering-highlights)
- [Technology Stack](#-technology-stack)
- [Demo Credentials](#-instant-demo-credentials)
- [Local Setup](#-local-setup--installation)
- [Running Tests](#-running-the-automated-smoke-test-suite)
- [Evaluator Walkthrough](#-step-by-step-evaluator-walkthrough)
- [Project Structure](#-project-directory-structure)
- [Submission Metadata](#-submission-metadata)

---

## 🚨 Problem Statement

Students, faculty, and residents on university campuses frequently face broken or malfunctioning infrastructure — such as recurring Wi-Fi drops in lecture halls, leaking hostel washroom plumbing, electrical hazards, damaged lab furniture, or classroom projector failures.

Without a centralized, transparent platform:
- Complaints are lost in manual registers or informal chat messages.
- Students do not know whether their complaints have been received, assigned, or acted upon.
- Maintenance technicians lack clear prioritization and assignment queues.
- Facility administrators have **zero visibility** into departmental response times, recurring failure zones, or SLA compliance breaches.

**CampusFlow solves this by bringing every stage of campus issue reporting, staff assignment, technician repair progression, and student confirmation into a unified, transparent application.**

---

## 👥 Target Users

### 1. Students & Campus Residents
- Report issues in hostels, classrooms, libraries, laboratories, or sports facilities.
- Attach photos of problems and specify campus zones, buildings, and room numbers.
- Track ticket progress through live status badges and audit timelines.
- Verify resolution quality, submit 1–5 star ratings, and close or reopen tickets.

### 2. Maintenance Staff & Department Technicians
*(Electrical, Plumbing, IT & Network, Carpentry, Housekeeping, Civil)*
- Receive department-specific task dispatches.
- Transition tickets to `IN_PROGRESS` when starting on-site work.
- Transition tickets to `RESOLVED` with mandatory resolution documentation and proof photos.

### 3. Campus Facility Administrators *(Dean / Estate Office)*
- Oversee campus-wide infrastructure health.
- Assign unassigned complaints to designated departments and specific technicians.
- Reassign or escalate high-priority and hazard tickets.
- Monitor real-time analytics: total volume, active workloads, average resolution hours, SLA compliance rates, and department performance scorecards.

---

## ⚙️ Key Engineering Highlights

### 1. 🔄 Robust Finite State Machine (FSM) Lifecycle

State transitions are strictly verified and guarded on the backend:

```
SUBMITTED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED (or REOPENED)
```

- A **student cannot** mark their own complaint as `RESOLVED` — only authorized staff/admin can.
- A **staff member cannot** mark a ticket `CLOSED` — only the student creator can verify and close after rating.
- Any attempt to bypass the state machine (e.g. `SUBMITTED → RESOLVED`) is rejected with **HTTP 400** and an explicit rejection explanation.

---

### 2. ⏱️ SLA Priority Deadlines & Automated Overdue Flags

| Priority | Example | SLA Deadline |
|---|---|---|
| 🔴 **CRITICAL** | Electrical sparking, burst water main | **12 hours** |
| 🟠 **HIGH** | AC failure in lab, library Wi-Fi down | **24 hours** |
| 🟡 **MEDIUM** | Projector display issue, broken chair | **48 hours** |
| 🟢 **LOW** | Minor paint peeling, cosmetic maintenance | **72 hours** |

Tickets exceeding their SLA deadline automatically receive a visible **`SLA Breached`** badge and impact departmental compliance ratings.

---

### 3. 🔐 Role-Based Access Control (RBAC) & Scoped Views
- Secured using industry-standard **JSON Web Tokens (JWT)** and **bcryptjs** password encryption.
- Multi-role authorization middleware (`student`, `staff`, `admin`) gates sensitive API endpoints.
- Scoped query filtration: students view their own tickets; technicians view their assigned department queue; administrators inspect the entire campus.

### 4. 📜 Complete Audit Trail & Timeline
- Every state transition, technician assignment, status change, and student review appends an **immutable entry** to the ticket's `timeline` sub-document with actor name, role, timestamp, and notes.

### 5. 🖼️ Media & Photo Proof Attachments
- Students upload defect images during reporting (stored via **Multer** with validation).
- Technicians upload proof of repair photos upon completion.

### 6. 📊 Interactive Executive Analytics Dashboard
- Comprehensive calculations: Total tickets, Active vs Resolved, SLA compliance rate, Average turnaround time, Student satisfaction index.
- Department workload distribution bar charts.
- Infrastructure issues categorized by facility type.
- Live administrative event stream reflecting system-wide state changes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, React Router v6 |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB, Mongoose 8 *(with auto embedded in-memory fallback)* |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Media Handling** | Multer multipart file upload with mime-type filters |
| **Dev Tools** | Morgan HTTP logging, Concurrently |

---

## 🔑 Instant Demo Credentials

CampusFlow includes **pre-seeded demo accounts** across all three roles so evaluators can test the entire state-transition lifecycle immediately without registering:

| Role | Name & Department | Email | Password |
|---|---|---|---|
| 🎓 **Student** | Arjun Verma *(Hostel B, CS)* | `student.arjun@campusflow.edu` | `password123` |
| 🎓 **Student** | Ananya Iyer *(Hostel A, EC)* | `student.ananya@campusflow.edu` | `password123` |
| 🔧 **Staff / Tech** | Priya Menon *(IT & Network)* | `staff.network@campusflow.edu` | `password123` |
| 🔧 **Staff / Tech** | Suresh Kumar *(Electrical)* | `staff.electrical@campusflow.edu` | `password123` |
| 🔧 **Staff / Tech** | Ramesh Patil *(Plumbing)* | `staff.plumbing@campusflow.edu` | `password123` |
| 👔 **Administrator** | Dr. Rajesh Sharma *(Estate Admin)* | `admin@campusflow.edu` | `password123` |

> 💡 **Tip for Evaluators**: Use the **"Instant Evaluator Demo Logins"** or **"Demo Role"** switcher pill on the login page to switch between Student, Staff, and Admin with one click!

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Git**

### Step 1 — Clone the Repository
```bash
git clone https://github.com/ram1019/Campus_flow.git
cd Campus_flow
```

### Step 2 — Install Dependencies
```bash
npm run install:all
```
*(Or navigate into `server` and `client` individually and run `npm install`)*

### Step 3 — Run the Application
```bash
npm run dev
```

| Service | URL |
|---|---|
| 🌐 Frontend Client | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:5000 |
| ❤️ API Health Check | http://localhost:5000/api/health |

> 🚀 **Zero-Configuration MongoDB**: If you do not have an external MongoDB instance running, CampusFlow will **automatically boot an embedded in-memory MongoDB database** and populate it with realistic campus data! To use your own MongoDB Atlas URI, set `MONGODB_URI` in `server/.env`.

---

## 🧪 Running the Automated Smoke Test Suite

To verify backend health, JWT authentication, FSM state-machine guards, legal assignments, and analytics:

```bash
# From project root
npm test

# Or inside the server directory
cd server && npm test
```

All **7 test suites** will execute and validate the complete workflow.

---

## 🗺️ Step-by-Step Evaluator Walkthrough

**Step 1 — Sign in as Student** (`student.arjun@campusflow.edu` / `password123`)
- Click **"Report Issue"** → fill in category, title, zone, building, and priority → Submit.
- The ticket enters `SUBMITTED` status with an automatic SLA countdown.

**Step 2 — Switch to Administrator** (`admin@campusflow.edu` / `password123`)
- Go to **Dashboard** or **All Complaints** → find the new ticket.
- Click **"Assign"** → choose *IT & Network* department → assign technician *Priya Menon*.
- Ticket automatically transitions to `ASSIGNED`.

**Step 3 — Switch to Staff Technician** (`staff.network@campusflow.edu` / `password123`)
- Notice the 🔔 notification bell badge for the new assignment.
- Click **"Start Work on Site"** → ticket transitions to `IN_PROGRESS`.
- Click **"Mark Resolved"** → enter resolution notes → ticket enters `RESOLVED`.

**Step 4 — Switch back to Student** (`student.arjun@campusflow.edu` / `password123`)
- See the green notification: *"Your ticket has been marked resolved! Please review and close."*
- Click **"Confirm Resolution & Close"** → select a 5-star rating → ticket enters `CLOSED`.
- Check the **State Transition Audit Trail** to see every transition recorded with timestamps!

**Step 5 — Open Admin Analytics** (`/analytics`)
- View real-time SLA compliance %, average turnaround hours, category distribution bars, and department performance tables.

---

## 📁 Project Directory Structure

```
Campus_flow/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI: Navbar, Badges, Modals, Timeline
│   │   ├── context/            # AuthContext (JWT/roles), NotificationContext
│   │   ├── pages/              # Dashboard, ComplaintsList, Detail, NewComplaint, Analytics, Login, Register
│   │   ├── services/           # API wrapper with JWT injection
│   │   ├── App.jsx             # Route definitions & Protected Route guards
│   │   ├── main.jsx            # React root
│   │   └── index.css           # Tailwind custom styling & theme
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/             # DB connection with auto-embedded fallback
│   │   ├── controllers/        # Auth, Complaint, Analytics, Notification
│   │   ├── middleware/         # Auth (JWT & RBAC), Multer image upload
│   │   ├── models/             # User, Complaint, Notification, AuditLog
│   │   ├── routes/             # REST route definitions
│   │   ├── services/           # FSM validation engine & SLA calculator
│   │   ├── seed.js             # Demo data population script
│   │   └── server.js           # Express app setup & route mounts
│   ├── uploads/                # Complaint & proof images
│   ├── test-api.js             # Automated API & FSM integration tests
│   ├── .env.example
│   └── package.json
│
├── ARCHITECTURE.md             # System architecture, state machine diagrams & data models
├── package.json                # Monorepo runner scripts (concurrently)
└── README.md
```

---

## 📝 Submission Metadata

| Field | Details |
|---|---|
| **Project Name** | CampusFlow — Smart Campus Management Platform |
| **Problem Domain** | University campus facility issue tracking & SLA governance |
| **Tech Stack** | React 18, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, JWT, Multer |

### Major Features
1. ✅ Finite State Machine (FSM) lifecycle with server-side validation
2. ✅ Role-Based Access Control (Student / Staff / Administrator)
3. ✅ Priority-based SLA countdowns with automatic breach detection
4. ✅ Photo attachments for defect reporting and resolution proof
5. ✅ Complete audit timeline logging every transition with actor & timestamp
6. ✅ In-app notification centre with real-time polling
7. ✅ Advanced filtering, search, and sorting across campus facilities
8. ✅ Administrative analytics dashboard with department performance scorecards

---

<div align="center">
  <sub>Built with ❤️ for the <strong>Building Web Applications with React</strong> course end-term project.</sub>
</div>


Demo video drive link -- https://drive.google.com/file/d/199FhAt5KcKPYOuLJrpVHWHPkUEAO-I4I/view?usp=sharing
