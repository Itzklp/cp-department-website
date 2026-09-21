# 🎓 CP Department Website — Backend API

A REST API backend for a college **Computer Engineering / CP Department** website. It powers the department's public data (faculty, publications, projects, patents, PhD theses, conferences, talks, awards, events, published books) and an admin/faculty dashboard with authentication, role-based access control, bulk Excel uploads, and activity logging.

Built with **Node.js, Express 5, and MongoDB (Mongoose)**.

---

## ✨ Features

- 🔐 **JWT-based authentication** — login, Google Sign-In, forgot/reset password (via email), first-login password change
- 👥 **Role-based access control** — `faculty`, `hod`, and `admin` roles, enforced with route-level middleware
- 🧑‍🏫 **Faculty management** — CRUD, per-faculty dashboard data, bulk import from Excel
- 📚 **Academic records modules** — Publications, Conferences, Patents, PhD Theses, Projects, Published Books, Faculty Awards, Invited Talks, Department Talks, Department Events — each with full CRUD + search + bulk Excel upload
- 🛠️ **Admin panel APIs** — list/suspend/reactivate users, change roles, soft-delete users
- 📝 **Activity/audit logging** — tracks key actions (e.g., logins, password resets) with IP, timestamp, and actor, viewable by admins
- 📤 **Excel (.xlsx) bulk upload** — via Multer + SheetJS (`xlsx`) for most data modules
- 📧 **Transactional email** — password reset emails via Nodemailer
- 🌐 **CORS-enabled REST API** with JSON body parsing and request logging (Morgan)

---

## 🧱 Tech Stack

| Layer                | Technology |
|-----------------------|------------|
| Runtime                | Node.js |
| Web framework           | Express 5 |
| Database                | MongoDB + Mongoose 8 |
| Authentication           | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` for password hashing |
| Google Sign-In            | `google-auth-library` |
| File uploads              | `multer` |
| Excel parsing              | `xlsx` (SheetJS) |
| Email                       | `nodemailer` |
| Logging                      | `morgan` (HTTP), custom `logModel` (audit trail) |
| Console styling               | `colors` |
| Dev tooling                     | `nodemon` |

---

## 📂 Project Structure

```
cp-department-website/
├── config/
│   └── db.js                  # MongoDB connection (Mongoose)
├── controllers/                # Route/business logic, one per resource
│   ├── adminController.js
│   ├── authController.js
│   ├── conferenceController.js
│   ├── dashboardController.js
│   ├── departmentEventsController.js
│   ├── departmentTalkController.js
│   ├── facultyAwardController.js
│   ├── facultyController.js
│   ├── invitedTalkController.js
│   ├── logController.js
│   ├── patentController.js
│   ├── phdThesisController.js
│   ├── projectsController.js
│   ├── publicationController.js
│   ├── publishedBooksController.js
│   └── testController.js
├── middleware/
│   └── authMiddleware.js      # protect (JWT auth) & authorize (role check)
├── models/                     # Mongoose schemas, one per resource
│   ├── conferenceModel.js
│   ├── departmentEventsModel.js
│   ├── departmentTalkModel.js
│   ├── facultyAwardModel.js
│   ├── facultyModels.js
│   ├── invitedTalkModel.js
│   ├── logModel.js
│   ├── patentModel.js
│   ├── phdThesisModel.js
│   ├── projectsModel.js
│   ├── publicationModel.js
│   ├── publishedBooksModel.js
│   └── userModel.js
├── routes/                     # Express routers, one per resource
│   ├── adminRoute.js
│   ├── authRoute.js
│   ├── conferenceRoute.js
│   ├── dashboardRoute.js
│   ├── departmentEventsRoute.js
│   ├── departmentTalkRoute.js
│   ├── facultyAwardRoute.js
│   ├── facultyRoute.js
│   ├── invitedTalkRoute.js
│   ├── logRoute.js
│   ├── patentRoute.js
│   ├── phdThesisRoute.js
│   ├── projectsRoute.js
│   ├── publicationRoute.js
│   ├── publishedBooksRoute.js
│   └── testRoute.js
├── utils/
│   ├── logger.js               # Writes entries to the audit log collection
│   └── sendEmail.js            # Nodemailer wrapper for transactional emails
├── data/                       # Static/seed data (if any)
├── uploads/                    # Temp storage for bulk-upload Excel files
├── seedAdmin.js                # Script to seed the first admin user
├── server.js                   # App entry point / route registration
├── package.json
├── .env.example                 # Sample environment variables
└── .gitignore
```

Each resource module (e.g. *Publication*, *Patent*, *PhD Thesis*) follows the same **Route → Controller → Model** pattern, keeping the codebase consistent and easy to extend.

---

## 🔑 Authentication & Authorization

- Every protected route is guarded by `protect` (validates the `Authorization: Bearer <token>` JWT and attaches `req.user`).
- Role-gated routes additionally use `authorize('admin')`, `authorize('hod')`, etc.
- Suspended (`status: "SUSPENDED"`) or soft-deleted (`isDeleted: true`) accounts are automatically blocked, even with a valid token.
- Passwords are hashed with `bcryptjs` before being saved; the `password` field is excluded from query results by default.
- Password resets use a hashed, time-limited (10-minute) token emailed to the user.

**User roles:** `faculty` (default) · `hod` · `admin`

---

## 🌐 API Overview

Base URL: `http://localhost:<PORT>/api/v1`

All routes below are **protected** (require a valid JWT) unless marked *Public*. Routes marked **[admin]** additionally require the `admin` role.

### Auth — `/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | Login with email & password *(Public)* |
| POST | `/google-login` | Login/register via Google Sign-In *(Public)* |
| POST | `/forgotpassword` | Request a password-reset email *(Public)* |
| PUT | `/resetpassword/:resettoken` | Reset password using emailed token *(Public)* |
| PUT | `/updatepassword` | Update password for the logged-in user |
| GET | `/me` | Get the current logged-in user's profile |

### Faculty — `/faculty`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all faculty |
| POST | `/` | Add a faculty member **[admin]** |
| PUT | `/:id` | Update a faculty member **[admin]** |
| DELETE | `/:id` | Delete a faculty member **[admin]** |
| GET | `/my-dashboard` | Get dashboard data for the logged-in faculty user |
| POST | `/bulk-upload` | Bulk import faculty from an `.xlsx` file **[admin]** |

### Dashboard — `/dashboard`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/my-dashboard` | Aggregated stats/records for the logged-in faculty user |

### Admin — `/admin` *(all routes **[admin]**)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users |
| PATCH | `/users/:id/status` | Suspend / reactivate a user |
| PATCH | `/users/:id/role` | Change a user's role |
| DELETE | `/users/:id` | Soft-delete a user |

### Logs — `/logs` *(admin)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | View the system audit log **[admin]** |

### Academic record modules
The following modules all share the same CRUD + bulk-upload pattern:

`/project` · `/publication` · `/conference` · `/publishedBook` · `/departmentEvent` · `/invitedTalk` · `/departmentTalk` · `/facultyAward` · `/patent` · `/phdThesis`

| Method | Endpoint pattern | Description |
|---|---|---|
| GET | `/` | List all records |
| GET | `/:id` | Get a single record by ID |
| POST | `/` | Create a new record |
| PUT | `/:id` | Update a record |
| DELETE | `/:id` | Delete a record |
| GET | `/search...` | Search (e.g. by title/name — varies per module) |
| POST | `/bulk` | Bulk import records from an `.xlsx` file |

Module-specific extras:
- **Projects** (`/project`): `POST /add` to create, `GET /faculty/:facultyId` to list a faculty member's projects.
- **Publications** (`/publication`): `GET /professor/:professorId`, `GET /search`.
- **Published Books** (`/publishedBook`): `GET /author/:author`, `GET /search`.
- **Department Events** (`/departmentEvent`): `GET /search/title`.

### Test — `/test`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health-check endpoint *(Public)* |

### Root
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Returns `Hello, World!` — server liveness check |

---

## 🗄️ Data Models (summary)

| Model | Key fields |
|---|---|
| **User** | name, email, password (hashed), role, facultyProfile, status, isDeleted, isFirstLogin, resetPasswordToken/Expire |
| **Faculty** | psrn, firstName, lastName, email, instituteEmail, department, researchArea, teaches, joiningDate, designation, mobileNo, chamberNo |
| **Project** | psrn, projectPI/projectCoPI (ref → Faculty), collaborator, projectTitle, fundingAgency, scheme, dateSanctioned, projectStartDate, dateCompletion |
| **Publication** | title, authors (ref → Faculty), year, journal |
| **Conference** | type, authors, title, conferenceName, pages, publisher, location, date |
| **Published Book** | title, author, type, publisher, series, year, link |
| **Patent** | authors, title, applicationNumber, filingDate, country, status |
| **PhD Thesis** | scholarName, studentId, designation, sourceOfStipend, sponsoredProjectName, thesisTitle, supervisor, coSupervisor, DAC members, year, milestone dates, fellowship info |
| **Faculty Award** | facultyName, title, organization, journalInfo, year, category |
| **Invited Talk** | speaker, title, event, organizer, location, date, mode, role |
| **Department Talk** | speaker, designation, affiliation, title, date, type |
| **Department Event** | title, coordinators, type, description, date, organizedBy |
| **Log** | user (ref → User), email, action, details, ipAddress, timestamp |

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository
```bash
git clone https://github.com/Itzklp/cp-department-website.git
cd cp-department-website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root (see `.env.example`):

```env
PORT=8080
MONGO_URL=your-mongodb-connection-string

# Auth
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=30d

# Email (for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL=your-email@example.com
SMTP_PASSWORD=your-email-password
FROM_NAME=CP Department
FROM_EMAIL=noreply@example.com

# Google Sign-In
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

> ⚠️ Update the values to match what `config/db.js`, `authController.js`, and `utils/sendEmail.js` actually read in your version of the code — variable names may differ slightly if you customize those files.

### 4. Seed an admin account (optional, first-time setup)
```bash
node seedAdmin.js
```
This creates a default admin user (edit `seedAdmin.js` to change the seeded email/password before running).

### 5. Run the server
```bash
# Development (auto-restarts with nodemon)
npm run server

# Production
node server.js
```

The API will be available at `http://localhost:8080` (or your configured `PORT`).

---

## 📤 Bulk Upload via Excel

Most academic-record modules support importing records in bulk:

```
POST /api/v1/<module>/bulk
Content-Type: multipart/form-data
Field name: file   (an .xlsx spreadsheet)
```

Uploaded files are temporarily handled via Multer (`uploads/`) and parsed with `xlsx`, then inserted into MongoDB. Only `.xlsx` files are accepted.

---

## 🧪 Health Check

```bash
curl http://localhost:8080/api/v1/test
curl http://localhost:8080/
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run server` | Start the server in dev mode with `nodemon` |
| `node server.js` | Start the server directly |
| `node seedAdmin.js` | Seed an initial admin user |

---

## 🔒 Security Notes

- Never commit your `.env` file (already covered by `.gitignore`).
- Rotate `JWT_SECRET` and any SMTP/Google credentials if they are ever exposed.
- Admin-only and auth-only routes are enforced server-side via `protect` / `authorize` middleware — do not rely on the frontend alone to hide privileged actions.

---

## 👤 Author

**Kalp Dalsania**

---

## 📄 License

ISC
