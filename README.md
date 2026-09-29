# Client Portal

Full-stack portal for an IT services company to manage startup clients, projects, and tasks. Admins manage everything; clients see only their own work in read-only mode.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios (`client/`)
- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT + bcrypt (`server/`)

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

## Environment variables

### `server/.env`

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/client-portal` | Mongo connection string |
| `JWT_SECRET` | long random string | Signs JWT access tokens |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin for the Vite app |

Copy `server/.env.example` to `server/.env` and adjust values.

### `client/.env`

| Variable | Example |
| --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` |

Copy `client/.env.example` to `client/.env`.

## Install and run

```bash
# API
cd server
npm install
npm run seed
npm run dev

# UI (new terminal)
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Seed accounts

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | `admin@codexlabz.com` | `Admin@123` |
| CLIENT | `client@demo.com` | `Client@123` |

The seed is idempotent: re-running it will not duplicate those users.

## How portal logins work

When an admin creates a client, the API also creates a `CLIENT` user:

- Login email = `contactEmail`
- Password = `portalPassword` (bcrypt hashed, never returned)
- If `contactEmail` is already used, creation fails with `400 Email already in use`

## End-to-end check

1. Seed the database and start both apps.
2. Log in as admin.
3. Create a client (company, contact email, portal password).
4. Create a project for that client and add tasks (mark some `DONE`).
5. Log out, then log in with the client’s contact email and portal password.
6. Confirm the client dashboard shows only that company’s projects and the correct progress percent.

## API shape

Success: `{ "success": true, "data": ... }`  
Error: `{ "success": false, "message": "..." }`

All routes except `POST /api/auth/login` require `Authorization: Bearer <token>`.
