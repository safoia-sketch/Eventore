# Eventore

Eventore is a full-stack event-management and ticket-booking platform. It allows organisers to create events, attendees to book tickets, staff to validate digital tickets, and administrators to manage approvals.

## Main features

- User registration, login and role-based access
- Event creation and administrator approval
- Public event discovery and filtering
- Ticket-type and inventory management
- Free and simulated paid bookings
- Server-side price calculation
- Protection against overselling
- Unique digital tickets and QR codes
- One-time staff check-in
- Eligible booking cancellation
- Organiser sales and attendance dashboard
- Responsive public and dashboard pages

## User roles

- **Attendee:** Discovers events, books tickets and manages bookings.
- **Organiser:** Creates events, configures tickets and views reports.
- **Staff:** Validates ticket codes and records check-ins.
- **Administrator:** Approves organisers and events.

## Technology

### Frontend

- React
- Vite
- React Router
- Bootstrap
- Custom CSS
- qrcode.react

### Backend

- Node.js
- Express
- PostgreSQL
- express-session
- bcrypt
- pg
- CORS
- dotenv

## Project structure

```text
Eventore/
├── client/
├── server/
│   └── sql/
│       └── schema.sql
└── README.md
```

## Local setup

### Requirements

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/safoia-sketch/Eventore
cd Eventore
```


Example:

```bash
git clone https://github.com/safoia-sketch/Eventore
```

### 2. Set up PostgreSQL

Create a database named:

```text
eventore
```

Run the SQL file below using pgAdmin or `psql`:

```text
server/sql/schema.sql
```

### 3. Configure the backend

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development

CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=replace_with_a_long_random_secret

DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventore
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
```

Do not commit the `.env` file.

### 4. Configure the frontend

Create `client/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Install and run the backend

```bash
cd server
npm install
npm run dev
```

The API runs at:

```text
http://localhost:5000/api
```

### 6. Install and run the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Booking protection

Eventore uses PostgreSQL transactions and row locking to protect ticket inventory. Prices and totals are calculated by the server, and successful bookings generate unique ticket codes.

The system also prevents:

- Negative ticket availability
- Duplicate booking submissions
- Purchasing above customer limits
- Reusing checked-in tickets
- Accessing another attendee’s bookings or tickets
- Cancelling bookings containing used tickets

## Testing

Run the frontend quality checks:

```bash
cd client
npm run lint
npm run build
```

The core workflow has been tested from event creation and approval through booking, digital tickets, check-in, cancellation and organiser reporting.

## Current limitations

This version uses:

- Simulated payments and refunds
- General-admission tickets
- Manual ticket-code entry
- Image URLs instead of file uploads
- Development session storage

Real payments, email delivery, camera QR scanning and reserved seating can be added in future versions.

## Project status

The core Eventore MVP is functional and ready for demonstration.