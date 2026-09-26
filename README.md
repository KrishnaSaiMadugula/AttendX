# 🛡️ AttendX — Anti-Proxy Attendance Verification System

**AttendX** is a secure, real-time attendance management system engineered to eliminate proxy attendance in educational and enterprise environments. By combining **Dynamic QR Code rotation**, **Geofencing validation**, and **Device Fingerprinting**, AttendX ensures that attendance can only be marked by legitimate participants physically present at the designated location.

---

## 🌟 Key Features

### 🔐 Multi-Layer Anti-Proxy Architecture
* **Dynamic Rotating QR Codes:** The teacher dashboard generates short-lived, encrypted QR codes that cycle periodically to prevent static screenshot sharing among students.
* **Geofencing Validation:** Employs browser geolocation APIs to enforce strict physical radius checks around the classroom or venue coordinates before accepting a check-in.
* **Device Fingerprinting:** Captures unique client metadata to prevent a single physical hardware device from logging attendance for multiple accounts.

### 👩‍🏫 Educator Portal
* **Live QR Broadcasting:** Clean interface for projecting active attendance sessions on classroom displays.
* **Real-Time Attendance Monitoring:** Live feed updates showing incoming check-ins, validation statuses, and flagged anomalies.
* **Historical Reports & CSV Exports:** Instant access to past session logs with full export capabilities for record-keeping.

### 👨‍🎓 Student Interface
* **One-Tap Attendance Scanner:** Streamlined mobile-first web interface for scanning active session codes.
* **Automated Identity Verification:** Background verification of location, time window, and device integrity.

---

## 🏗️ Architecture & Tech Stack

```text
[ Student Web App ] ───▶ ( Device + Geo Checks ) ───▶ [ Firebase Auth / Firestore ]
                                                              ▲
[ Teacher Dashboard ] ───▶ ( Dynamic QR Rotation ) ───────────┘
```

* **Frontend:** React.js, Vite, Tailwind CSS
* **Backend & Cloud Services:** Firebase Authentication, Cloud Firestore, Firebase Hosting
* **Security & Verification:** Browser Geolocation API, Client Fingerprinting Utility

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** `v18.x` or higher
* **npm:** `v9.x` or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/KrishnaSaiMadugula/attendx.git](https://github.com/KrishnaSaiMadugula/attendx.git)
   cd attendx
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:5173` in your browser.

---

## 🛡️ Security & Privacy

* **Frontend Protection:** Google Cloud API Keys are scoped via HTTP Referrer restrictions (`*attendx-fdeab.web.app/*` and `http://localhost:5173/*`).
* **Database Granularity:** Data access is gated via strict Firestore Security Rules based on authenticated user roles (`teacher` vs `student`).

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.