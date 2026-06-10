# 🏨 Athithi Hotel Management System (HMS)

**Athithi** (Sanskrit for *Guest*) is a state-of-the-art Hotel Management System meticulously designed and customized for the **Sri Lankan hospitality sector**. Whether managing boutique beach villas down south in Mirissa, eco-cabanas in Ella, or high-capacity luxury resorts in Colombo, Athithi bridges standard property management operations with unique local travel, culinary, and tax practices.

---

## 🌟 Localized Sri Lankan Features

What makes **Athithi** unique is its deep alignment with local hospitality requirements:

1. **Statutory Sri Lankan Tax Calculations**:
   - Automatically handles tax structures for invoices according to local laws:
     - **Service Charge (10%)**: Standard service charge applied to room stays and additional purchases.
     - **Value Added Tax (VAT - 18%)**: Calculated on the subtotal + Service Charge.
     - **Social Security Contribution Levy (SSCL - 2.5%)**: Standard levy calculated on the core subtotal.
2. **Sri Lankan Holiday & Tourist Seasonal Pricing**:
   - The pricing engine dynamically scales room rates based on historical high seasons:
     - **Christmas & New Year Peak** (Dec 20 – Jan 5): **1.6x multiplier**
     - **Sinhala & Tamil New Year** (Apr 10 – Apr 16): **1.5x multiplier**
     - **Esala Perahera in Kandy** (Jul 25 – Aug 10): **1.4x multiplier**
     - **April Tourist Peak** (Apr 1 – Apr 30): **1.35x multiplier**
     - **Down South Season** (Nov 1 – Jan 31): **1.3x multiplier**
3. **National Identity Card (NIC) Verification**:
   - Supports validation and parsing for both **Old Sri Lankan NICs** (e.g., `123456789V` / `123456789X` - 9 digits + letter) and **New Sri Lankan NICs** (e.g., `199512345678` - 12 numeric digits).
   - Extracts birth-year estimates directly from the NIC format to update guest profiles.
4. **Tour Driver & Guide Tracking**:
   - Sri Lankan tourism frequently involves private guides and drivers. Athithi tracks driver details:
     - Name and contact number
     - Vehicle plate number
     - Accommodation requirements (requires driver lodging)
     - Meal plan requirements (requires driver meals)
5. **Sri Lankan Food & Spice Customizations**:
   - Keeps track of guests' breakfast preferences (such as **Traditional Sri Lankan Breakfast** - string hoppers, pol sambol, egg hoppers) alongside custom **Spice Tolerance** levels (`none`, `mild`, `medium`, `hot`, `sri-lankan-hot`!).

---

## 🛠️ Backend Architecture (Express & Node.js)

The backend is a robust RESTful API built on the **MERN** stack, designed to keep actions secure, atomic, and efficient.

### Tech Stack
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB with Mongoose ODM
* **Security & Auth**: JSON Web Tokens (JWT), `bcryptjs` (passwords), `helmet` (security headers), and `cors` (cross-origin resource sharing)
* **Loggers & Validators**: `morgan` (HTTP request logs) and `express-validator` (endpoint data sanitization)

### Core Folder Structure
```
backend/
├── config/             # DB connection & configuration setting seeds
├── constants/          # Sri Lankan seasons, taxes, NIC patterns, food selections
├── controllers/        # Express handlers (Auth, Billing, Bookings, Guests, Rooms)
├── middleware/         # Auth protector (JWT verification & roles), Error Handler
├── models/             # Mongoose schemas (User, Guest, Booking, Room, Bill)
├── routes/             # Express routes mounting corresponding controllers
├── services/           # Specialized business logic engines:
│   ├── pricingService.js      # Night calculation, tax computing, season scaling
│   ├── nicValidationService.js # Sri Lankan NIC regex parsing & validation
│   └── invoiceService.js       # Structured invoice formatter for LKR/USD outputs
└── server.js           # Server starter, health checks, and global error handling
```

### Models & Database Design
* **`User`**: Admin, manager, and receptionist accounts. Employs `bcryptjs` to hash credentials securely.
* **`Room`**: Details room number, type (`standard`, `deluxe`, `ocean-view`, `eco-cabana`, etc.), base price in LKR, capacity, floor, view, current status (`available`, `occupied`, `maintenance`, `reserved`), and active state.
* **`Guest`**: Stores contact information, identity credentials, driver associations, dietary preferences, and VIP tiers.
* **`Booking`**: Computes check-in/out range, overlap conflicts via a custom static model helper `hasConflict()`, nights stayed, base cost, active season multiplier, total price in LKR, and equivalent USD value at booking time.
* **`Bill`**: Calculates pre-save totals using Mongoose hooks. Consolidates multiple line-item types (`room` charges, `fb` - food & beverages, `extra` purchases) and runs them through the VAT + SSCL + Service Charge equations.

---

## 🖥️ Frontend Architecture (React 19 & Vite)

The frontend is a fast, interactive Single Page Application (SPA) utilizing Vite for microsecond reload speeds and React 19 for modern component rendering.

### Tech Stack
* **Framework**: React 19
* **Build System**: Vite
* **Routing**: React Router DOM (v7)
* **API Calls**: Axios (configured with request & response interceptors)
* **Data Presentation**: Recharts (for analytics and occupancy trends)
* **Components**: Custom Vanilla CSS UI component library with glassmorphic cards, harmonized CSS variables, and clean, responsive layout drawers
* **Form Validation**: Zod schemas
* **Feedback System**: React Hot Toast

### Core Folder Structure
```
frontend/
├── public/
└── src/
    ├── api/            # API services mapping (auth, bookings, rooms, guests, billing)
    ├── assets/         # Dynamic image placeholders and branding assets
    ├── components/     # Reusable layout and custom UI primitives (Layout, Sidebar, Spinner)
    ├── constants/      # Shared status configurations and localized options
    ├── context/        # React context (AuthContext with useReducer state)
    ├── pages/          # Main application dashboards and grids:
    │   ├── auth/          # Login screen
    │   ├── dashboard/     # Metric widgets, charts, and daily checklists
    │   ├── rooms/         # Room grid with status controls and creation drawer
    │   ├── bookings/      # Interactive calendar views and check-in panels
    │   ├── guests/        # Guest cards and Sri Lankan preference tracking
    │   └── billing/       # Billing details, dynamic item modifiers, invoice prints
    ├── App.css         # Component utility overrides
    ├── App.jsx         # Router path setup and ProtectedRoute wrapper definition
    ├── index.css       # Core typography, HSL colors, scrollbars, and modern UI variables
    └── main.jsx        # App entry point mounting index.css
```

### UX Design System Highlights
* **Harmonious Palette**: Pure CSS variables configured in `index.css` with a sleek dark-sidebar scheme and beautiful gradient backgrounds.
* **Glassmorphism**: Elegant card styling with backdrop filters and drop-shadows.
* **Micro-Animations**: Hover actions, smooth transition drawers, and pulsing loaders that provide instant visual response.
* **Responsive Sidebar Layout**: Collapses automatically on tablets and mobile devices, optimizing real estate.

---

## 🔗 Key Data Flows

### Booking Conflict & Multiplier Flow
1. Staff creates a booking form.
2. The client checks for dates. The backend queries `Booking.hasConflict` to verify that the room is not already occupied during the requested dates.
3. The pricing engine (`pricingService.js`) checks if any night in the booking falls within Sri Lankan peak periods (e.g., Sinhala New Year). If yes, the highest multiplier is used to adjust `pricePerNight`.
4. Final checkout details are calculated and returned.

### Real-Time Billing & Invoicing Flow
1. When a guest checks in, a Booking record moves to `checked-in` and an empty `Bill` is initialized.
2. During the stay, items are added to the bill (e.g., "Kottu Roti & Lion Beer" under `fb`, or "Whale Watching Excursion" under `extra`).
3. The Bill schema’s `pre('save')` hook automatically aggregates all items, calculates the 10% Service Charge, appends 18% VAT and 2.5% SSCL, and computes the final LKR and USD conversions using a default/current exchange rate.
4. When printed, `invoiceService.js` builds a structured format to output clean invoices.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** v18+ or later
* **MongoDB** locally installed or a MongoDB Atlas URI

### 1. Setup Backend
Open a terminal in the `/backend` folder:
1. Create a `.env` file from the variables below:
   ```env
   MONGO_URI=mongodb://localhost:27017/athithi-hms
   JWT_SECRET=athithi-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *Note: On first database connection, the system will automatically seed a default admin user: **Email:** `staff@hotel.lk` | **Password:** `password123`.*

### 2. Setup Frontend
Open a terminal in the `/frontend` folder:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the default port: `http://localhost:5173`.
4. Use `staff@hotel.lk` / `password123` to log in and access the system.
