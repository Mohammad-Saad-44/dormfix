# DormFix — Backend Setup Guide

## What Was Added

A complete **Node.js / Express / PostgreSQL** backend for your DormFix app.
The frontend UI is **100% unchanged** — only the data layer was swapped from
`localStorage` to real database calls.

---

## Project Structure

```
dormfix/                        ← your original frontend (unchanged)
dormfix-backend/
├── database/
│   └── schema.sql              ← PostgreSQL schema (auto-applied by Docker)
├── pgadmin/
│   └── servers.json            ← pgAdmin auto-connect config
├── src/
│   ├── middleware/
│   │   └── auth.js             ← JWT middleware
│   ├── routes/
│   │   ├── auth.js             ← /api/auth/*
│   │   ├── complaints.js       ← /api/complaints/*
│   │   ├── notifications.js    ← /api/notifications/*
│   │   └── users.js            ← /api/users/*
│   ├── db.js                   ← pg Pool connection
│   ├── index.js                ← Express server entry
│   ├── migrate.js              ← Run schema manually
│   └── seed.js                 ← Insert demo data
├── frontend-api-client/        ← Drop-in replacements for frontend files
│   ├── api.ts                  ← → src/app/services/api.ts
│   ├── App.tsx                 ← → src/app/App.tsx
│   ├── ComplaintsContext.tsx   ← → src/app/contexts/ComplaintsContext.tsx
│   ├── SignInPage.tsx          ← → src/app/components/SignInPage.tsx
│   └── SignUpPage.tsx          ← → src/app/components/SignUpPage.tsx
├── docker-compose.yml          ← PostgreSQL + pgAdmin
├── package.json
└── .env.example
```

---

## Quick Start

### 1. Start the database (Docker required)

```bash
cd dormfix-backend
docker compose up -d
```

This starts:
- **PostgreSQL** on `localhost:5432` (auto-creates schema from `database/schema.sql`)
- **pgAdmin 4** on `http://localhost:5050`

### 2. Install & configure the backend

```bash
cd dormfix-backend
npm install

# Copy and edit environment file
cp .env.example .env
```

The default `.env` values match the Docker Compose config, so no changes
are needed for local development.

### 3. Seed demo data

```bash
npm run seed
```

This inserts all 7 demo users with proper bcrypt password hashes and the
4 sample complaints.

### 4. Start the backend

```bash
npm run dev    # development (nodemon auto-reload)
# or
npm start      # production
```

Server runs on **http://localhost:3001**

Health check: **http://localhost:3001/api/health**

---

## Integrate With Your Frontend

Copy the files from `frontend-api-client/` into your frontend project:

```bash
# From inside your dormfix/ frontend folder:

# 1. Create the services directory
mkdir -p src/app/services

# 2. Copy the API client
cp ../dormfix-backend/frontend-api-client/api.ts src/app/services/api.ts

# 3. Replace context (data layer only, same interface)
cp ../dormfix-backend/frontend-api-client/ComplaintsContext.tsx src/app/contexts/ComplaintsContext.tsx

# 4. Replace auth pages (backend calls only, same UI)
cp ../dormfix-backend/frontend-api-client/SignInPage.tsx src/app/components/SignInPage.tsx
cp ../dormfix-backend/frontend-api-client/SignUpPage.tsx src/app/components/SignUpPage.tsx

# 5. Replace App.tsx (JWT signout, same layout)
cp ../dormfix-backend/frontend-api-client/App.tsx src/app/App.tsx
```

Then add the API URL to your frontend's Vite config:

```bash
# In dormfix/.env (create if it doesn't exist)
VITE_API_URL=http://localhost:3001/api
```

---

## pgAdmin Access

Open **http://localhost:5050** in your browser.

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@dormfix.com      |
| Password | admin123               |

The DormFix PostgreSQL server is **pre-configured** — you'll see it listed
immediately under Servers in the left sidebar. No manual connection setup needed.

### Useful pgAdmin queries

```sql
-- View all users
SELECT id, email, name, role, hostel, is_demo FROM users;

-- View all complaints
SELECT id, category, status, hostel, student_name, technician FROM complaints;

-- View all notifications
SELECT id, type, message, user_email, is_read FROM notifications ORDER BY created_at DESC;
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Sign in, receive JWT |
| GET | `/api/auth/me` | Get current user (JWT required) |
| POST | `/api/auth/check-email` | Check if email is available |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/complaints` | Get complaints (filtered by role) |
| GET | `/api/complaints/:id` | Get one complaint |
| POST | `/api/complaints` | Create complaint (student only) |
| PATCH | `/api/complaints/:id` | Update complaint (assign, resolve, rate) |
| DELETE | `/api/complaints/:id` | Delete complaint |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user's notifications |
| PATCH | `/api/notifications/:id/read` | Mark one as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/technicians` | List technicians (supervisor only) |
| GET | `/api/users/profile` | Get own profile |
| PATCH | `/api/users/profile` | Update profile |
| POST | `/api/users/change-password` | Change password |

All routes except auth require `Authorization: Bearer <token>` header.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | ahmed.raza@giki.edu.pk | student123 |
| Supervisor (H1) | supervisor.irfan@giki.edu.pk | super123 |
| Supervisor (H2) | supervisor.khalid@giki.edu.pk | super123 |
| Supervisor (H3) | supervisor.rizwan@giki.edu.pk | super123 |
| Technician | kashif.ali@giki.edu.pk | tech123 |
| Technician | bilal.ahmad@giki.edu.pk | tech123 |
| Technician | usman.khan@giki.edu.pk | tech123 |

---

## Database Schema

### `users`
```
id, email, password_hash, name, role, hostel, room_number,
registration_number, department, is_demo, created_at, updated_at
```

### `complaints`
```
id (CN#xxx), category, urgency, status, description, room_number, hostel,
student_name, student_email, photo, technician, work_id, assigned_on,
assigned_by, resolved_on, rating, feedback, created_at, updated_at
```

### `notifications`
```
id (NOT#xxx), type, message, time_label, is_read,
user_email, complaint_id, created_at
```

---

## Stopping Services

```bash
# Stop containers (keeps data)
docker compose stop

# Stop and delete all data
docker compose down -v
```
