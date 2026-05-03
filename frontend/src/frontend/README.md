# 🍱 SmartBreak — SDU Food Ordering Frontend

An alpha frontend for the SmartBreak food ordering web app for SDU students and staff.

## Tech Stack
- **React 18** + **Vite**
- **React Router DOM v6** — client-side routing
- **Zustand** — auth & cart state (persisted in localStorage)
- **Axios** — HTTP client with JWT interceptor
- **Plain CSS** — no frameworks, fully custom

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure backend URL (optional)
```bash
cp .env.example .env
# Edit .env and set VITE_API_URL=http://your-backend:8000
```
> If no `.env` is set, the app automatically falls back to **mock data** for all API calls. It runs fully offline.

### 3. Start the dev server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## Demo Accounts (Mock Login)

| Role | Email | Password |
|------|-------|----------|
| 🎓 Student | student@sdu.edu.kz | student123 |
| 👨‍🍳 Cafe Staff | cafe@sdu.edu.kz | cafe123 |
| 🛵 Delivery | delivery@sdu.edu.kz | delivery123 |

---

## Project Structure

```
src/
├── api/
│   └── client.js          # Axios instance with JWT interceptor
├── components/
│   ├── Navbar.jsx          # Top nav with role-aware links
│   ├── ProtectedRoute.jsx  # Role-based route guard
│   ├── LoadingSpinner.jsx  # Reusable spinner
│   └── EmptyState.jsx      # Reusable empty state
├── pages/
│   ├── Login.jsx           # Login form
│   ├── Register.jsx        # Register with role selection
│   ├── customer/
│   │   ├── Menu.jsx        # Menu grid + category filter + search
│   │   ├── Cart.jsx        # Cart management + checkout
│   │   └── OrderStatus.jsx # Order tracking with timeline
│   ├── cafe/
│   │   ├── Dashboard.jsx   # Incoming orders + status advance
│   │   └── ManageMenu.jsx  # Add / edit / delete menu items
│   └── delivery/
│       └── Dashboard.jsx   # Ready orders + mark delivered
├── store/
│   ├── authStore.js        # Zustand: user + JWT token
│   └── cartStore.js        # Zustand: cart items + pickup time
└── styles/
    ├── global.css          # Design tokens, reset, utilities
    ├── auth.css            # Login & register pages
    ├── navbar.css          # Navigation bar
    ├── menu.css            # Menu, cart, order status
    └── dashboard.css       # Cafe & delivery dashboards
```

---

## Backend API Endpoints Expected

| Method | Path | Used by |
|--------|------|---------|
| POST | `/users/login` | Login |
| POST | `/users/register` | Register |
| GET | `/menu` | Menu page, Manage Menu |
| POST | `/menu` | Manage Menu (create) |
| PUT | `/menu/:id` | Manage Menu (edit / toggle) |
| DELETE | `/menu/:id` | Manage Menu (delete) |
| POST | `/orders` | Cart checkout |
| GET | `/orders/my` | Customer order status |
| GET | `/orders` | Cafe dashboard |
| PATCH | `/orders/:id/status` | Cafe advance status |
| GET | `/deliveries/ready` | Delivery dashboard |
| PATCH | `/deliveries/:id/deliver` | Mark delivered |

---

## Mock Data Fallback

Every API call is wrapped in try/catch. If the request fails (backend offline), the app silently falls back to realistic mock data. All fallback locations are marked with:
```js
// MOCK FALLBACK: ...
console.warn('Using mock ...');
```

---

## Build for Production
```bash
npm run build
# Output: dist/
```
