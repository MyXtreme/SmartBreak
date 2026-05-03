# SmartBreak — Campus Food Pre-Order System

A full-stack web application for pre-ordering food and drinks on campus. Students can browse the menu, order ahead, and pick up without waiting in line.

---

## Project Structure

```
smartbreak/
├── backend/               # FastAPI Python backend
│   ├── main.py            # App entry point
│   ├── database.py        # SQLite DB setup & seeding
│   ├── auth_utils.py      # JWT + bcrypt auth helpers
│   ├── requirements.txt
│   └── routers/
│       ├── auth.py        # Login, register, /me
│       ├── menu.py        # CRUD menu items & categories
│       ├── orders.py      # Create & manage orders
│       └── admin.py       # Admin stats
│
├── frontend-user/         # React user-facing website (port 3000)
│   └── src/
│       ├── pages/
│       │   ├── Home.js    # Menu browsing
│       │   ├── Auth.js    # Login / Register
│       │   ├── Cart.js    # Basket + pickup time selection
│       │   └── Orders.js  # View my orders & status
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── CartContext.js
│       └── components/Navbar.js
│
├── frontend-admin/        # React admin panel (port 3001)
│   └── src/
│       ├── pages/
│       │   ├── Login.js       # Admin-only login
│       │   ├── Dashboard.js   # Stats overview
│       │   ├── MenuManager.js # Add/edit/delete menu items
│       │   └── OrderManager.js # Accept/decline/track orders
│       └── components/Sidebar.js
│
└── start.sh               # Start all services
```

---

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm

### Start Everything

```bash
chmod +x start.sh
./start.sh
```

Or manually:

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

**User Frontend:**
```bash
cd frontend-user
npm install
npm start
# Opens http://localhost:3000
```

**Admin Frontend:**
```bash
cd frontend-admin
npm install
PORT=3001 npm start
# Opens http://localhost:3001
```

---

## Admin Accounts

| Email | Password | Name |
|-------|----------|------|
| 230103148@sdu.edu.kz | Admin@1 | Aruzhan Kaparova |
| 230103256@sdu.edu.kz | Admin@2 | Akbota Zhalgas |
| 230103126@sdu.edu.kz | Admin@3 | Salima Shamshiyeva |
| 230103220@sdu.edu.kz | Admin@4 | Mukhtar Mukhametkali |

> **Security:** Passwords are hashed with bcrypt. Change default passwords after first login by updating the `database.py` seed values and deleting `smartbreak.db` to re-seed.

---

## Key Features

### User Website (port 3000)
- **Home** — Browse full menu without logging in
- **Categories** — Filter by Coffee, Lemonade, Sandwich, Macaron, Snack
- **Add to Cart** — Redirects to login if not authenticated
- **Cart** — Review items, adjust quantities, select pickup time
- **Pickup Times** — 9:20, 10:20, 11:20, 12:20, 13:20, 14:20, 15:20, 16:20 (all ±10 min windows)
- **My Orders** — Real-time status: Pending → In Process → Ready
- **Any email** can register (no SDU restriction for users)

### Admin Panel (port 3001)
- **Protected Login** — Only 4 admin emails can access
- **Dashboard** — Live stats (orders, revenue, users, menu count)
- **Menu Manager** — Add/edit/delete/hide items; set stock for countable categories
- **Order Manager** — See all orders with user info + pickup time; Accept → In Process → Ready, or Decline
- **Auto-refresh** — Orders page refreshes every 30 seconds

### Stock Management Logic
- **Countable categories** (Sandwich, Macaron, Snack): Track available_amount
  - When amount reaches 0 → shows "No available" text + greyscale photo on both sites
  - Declining an order restores stock automatically
- **Unlimited categories** (Coffee, Lemonade): No stock tracking

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | User | Current user info |
| GET | /api/menu/categories | — | All categories |
| GET | /api/menu/items | — | Active menu items |
| GET | /api/menu/items/all | Admin | All items including hidden |
| POST | /api/menu/items | Admin | Create item |
| PUT | /api/menu/items/:id | Admin | Update item |
| DELETE | /api/menu/items/:id | Admin | Delete item |
| POST | /api/orders/ | User | Place order |
| GET | /api/orders/my | User | My orders |
| GET | /api/orders/all | Admin | All orders |
| PATCH | /api/orders/:id/status | Admin | Update status |
| GET | /api/admin/stats | Admin | Dashboard stats |

---

## Technology Stack

- **Backend:** Python FastAPI + aiosqlite (SQLite) + PyJWT + bcrypt
- **User Frontend:** React + React Router + Axios
- **Admin Frontend:** React + React Router + Axios
- **Auth:** JWT tokens (24h expiry), bcrypt password hashing
- **Database:** SQLite (file: `smartbreak.db`)

---

## Design

- **User site:** Warm café aesthetic — cream, espresso, caramel palette with Playfair Display + DM Sans
- **Admin panel:** Dark professional UI — near-black background with amber accents, Syne + Inter fonts


---

## Deployment

### Backend → Railway
1. Push the `backend/` folder (or whole repo) to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the repo; Railway auto-detects Python via `Procfile`
4. After deploy, copy the public URL (e.g. `https://smartbreak-backend.up.railway.app`)

### Frontends → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. For **frontend-user**: set Root Directory = `frontend-user`, add env var:
   ```
   REACT_APP_API_URL = https://your-railway-url.up.railway.app/api
   ```
3. For **frontend-admin**: repeat with Root Directory = `frontend-admin`, same env var
4. Each gets a live URL (e.g. `https://smartbreak-user.vercel.app`)

---

## Team Members & Student IDs

| Name | Student ID | Role |
|------|-----------|------|
| Aruzhan Kaparova | 230103148 | Backend Developer |
| Akbota Zhalgas | 230103256 | Backend Developer |
| Salima Shamshiyeva | 230103126 | Frontend Developer |
| Mukhtar Mukhametkali | 230103220 | Frontend Developer |
