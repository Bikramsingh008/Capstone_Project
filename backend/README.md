# ⚙️ Arogya AI Healthcare - Backend Server & API Gateway

This is the backend microservice and data layer for **Arogya AI Healthcare**. Built using Node.js and Express.js, it manages routing, orchestrates background schedulers, coordinates generative AI engines, and processes notifications (email & SMS).

---

## 🏗️ Server Architecture

The server maintains a state-controlled gateway that binds databases, worker processes, and third-party APIs together:

```
backend/
├── config/
│   └── db.js               # Mongoose database connector module
├── models/                 # Database Schema definitions
│   ├── Admin.js
│   ├── Appointment.js
│   ├── Doctor.js
│   ├── Medication.js
│   ├── Prescription.js
│   ├── Report.js
│   ├── User.js
│   └── WellnessRecord.js
├── cron.js                 # node-cron scheduler (runs ticks every minute)
├── mailer.js               # Nodemailer transporter (Gmail / Ethereal SMTP)
├── server.js               # Main Express entry point, routes, & AI controllers
├── sms.js                  # Twilio and TextBelt SMS dispatcher
├── package.json            # Node configuration & dependecies
└── .env                    # System environmental variables (gitignored)
```

---

## 📦 Key Server Dependencies

* **`express`:** Routing framework and REST API controller.
* **`mongoose`:** Object Data Modeling (ODM) library for MongoDB.
* **`@google/generative-ai`:** Google Gemini SDK integration.
* **`node-cron`:** In-process light scheduler.
* **`nodemailer`:** Handles transaction email alerts.
* **`twilio` & `axios`:** Twilio and TextBelt REST integrations for SMS dispatches.

---

## ⚙️ Background Workflows & Crons

### Medication Scheduler (`cron.js`)
* Runs a tick loop every 60 seconds (`* * * * *`).
* Captures server time (`HH:MM`) and weekday (e.g. `Monday`).
* Executes an indexed search on the `Medication` schema for matching times.
* If a match matches the active day schedule:
  1. Resolves the corresponding user's contact information.
  2. Dispatches a Twilio SMS prompt.
  3. Fires a Nodemailer email alert.
  4. Outputs logging info in the console standard output stream.

---

## 🚀 Execution & Setup

1. Configure environmental variables:
   Create a `.env` file at the root of the `/backend` folder containing your `MONGODB_URI` and `GEMINI_API_KEY` (Refer to the root `README.md` for a complete environment template).
2. Install dependecies:
   ```bash
   npm install
   ```
3. Run Server:
   ```bash
   # Development Server (hot reloading via nodemon)
   npm run dev
   
   # Standard Production start
   npm start
   ```
