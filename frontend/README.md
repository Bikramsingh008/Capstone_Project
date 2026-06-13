# 💻 Arogya AI Healthcare - Frontend React Web Client

This is the user interface and frontend application for **Arogya AI Healthcare**, a single-page web client built using React, Vite, and Tailwind CSS. It connects to the Arogya Node/Express API to deliver patient dashboards, AI diagnostics, doctor booking portals, and admin management.

---

## 🎨 Design System & User Experience

Arogya incorporates a futuristic, highly interactive **dark-mode glassmorphic theme** designed to feel premium and responsive:
* **Typography:** Clean, modern Sans-Serif font system styled with curated weights.
* **Colors:** Deep obsidian backgrounds (`#000000`, `#020617`) paired with vibrant electric blue accents (`#1FBCF9`) and magenta highlights for mental wellness cards.
* **Animations:** Subtle transition and scale states utilizing Framer Motion (`motion`) and micro-animations to enhance interactive feedback.
* **Component-Driven Architecture:** Segmented into clean tabs for unified dashboard layouts.

---

## 📂 Folder Directory

```
frontend/
├── public/                 # Static asset hosting
├── src/
│   ├── assets/             # Images, icons, logos
│   ├── AuthPage/           # Authentication forms
│   ├── Pages/              # High-level route views
│   │   ├── AdminPanel/     # AdminDashboard.jsx & AdminLogin.jsx
│   │   └── LandingPage/    # Main landing page & Navbar.jsx
│   ├── dashboard/          # Core Dashboard tabs
│   │   ├── ChatAssistant.jsx       # empathetic doctor chat interface
│   │   ├── DoctorAppointments.jsx  # search and book calendars
│   │   ├── HealthReports.jsx       # symptom reporter & prescription analyzer
│   │   ├── MedicationManager.jsx   # schedule forms & active cards
│   │   ├── MentalWellness.jsx      # mood logs & journals
│   │   └── WellnessTips.jsx        # advice rotate engines
│   ├── hooks/              # Custom React lifecycle hooks
│   ├── App.jsx             # Route definitions (react-router-dom)
│   ├── index.css           # Global CSS and Tailwind directives
│   └── main.jsx            # DOM entry mount point
├── package.json            # Client dependency manifest
└── vite.config.js          # Vite build parameters
```

---

## 📦 Key Client Dependencies

* **`react` & `react-dom`:** UI rendering engine (v19).
* **`react-router-dom`:** Multi-view routing.
* **`axios`:** Asynchronous client API requests to the backend server.
* **`jspdf`:** Dynamic confirmed appointment ticket PDF generator.
* **`lucide-react` & Emojis:** Modern visual iconography.
* **`tailwindcss` & `@tailwindcss/vite`:** Utility first CSS layout engine (version 4).

---

## 🚀 Execution & Production Build

### Running Locally
To launch the client interface in hot-reloading development mode:
```bash
npm install
npm run dev
```
By default, the server spins up at `http://localhost:5173/`.

### Production Compilation
To optimize, bundle, and compile the assets into static HTML/CSS/JS ready for deployment:
```bash
npm run build
```
This generates a production-ready `/dist` folder. To preview the build locally:
```bash
npm run preview
```
