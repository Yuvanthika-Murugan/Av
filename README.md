# FreelanceHub — Full-Stack Freelancer Social Platform

A modern full-stack social platform for freelancers with **Instagram-style post feed**, admin moderation, 5-hour session management, and a **premium shuttle-color dark/light theme**.

---

## Tech Stack

| Layer       | Technology                                   |
|-------------|----------------------------------------------|
| Frontend    | React 18 · Tailwind CSS · Framer Motion      |
| Backend     | Node.js · Express.js                         |
| Database    | MongoDB (Mongoose ODM)                       |
| Auth        | JWT (5-hour expiry) · bcryptjs               |
| Images      | Cloudinary (or local disk fallback)          |
| Charts      | Recharts                                     |
| State       | React Context API                            |
| Routing     | React Router v6                              |

---

## Features

### User Panel
- Register · Login · Secure session (5h auto-logout)
- Create/Edit/Delete freelancer posts with image upload
- Instagram-style infinite scroll feed
- Like & comment on approved posts
- Real-time session countdown bar
- Profile management (bio, skills, avatar)
- Notification center
- Activity / session history

### Admin Panel
- Dashboard with live stats and charts
- Post approval workflow (Approve / Reject with reason)
- User management (Block / Unblock with reason)
- Activity logs (login time, logout time, IP, device, session status)
- CSV export of logs
- Admin-only protected routes

### Theme
- **Dark mode** (default): Navy #0a0f1e · Charcoal · Neon Blue #3b82f6 · Purple #8b5cf6
- **Light mode**: Soft slate #f0f4ff · White cards · Vibrant accents
- Toggle persisted to localStorage — click ☀/🌙 in the sidebar

---

## Project Structure

```
freelancehub/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js       # Cloudinary + multer upload config
│   │   └── seed.js             # Admin user seeder
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Logout, Profile
│   │   ├── postController.js   # CRUD, Like, Comment, Feed
│   │   └── adminController.js  # Dashboard, Approvals, Users
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verify + session check + admin guard
│   ├── models/
│   │   ├── User.js             # Users with bcrypt hashing
│   │   ├── Post.js             # Posts with approval workflow
│   │   └── Activity.js         # LoginLog, Like, Comment, BlockedUser
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── userRoutes.js
│   │   └── logRoutes.js
│   ├── server.js               # Express app entry point
│   ├── .env                    # Environment variables (edit this!)
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── UI.jsx      # PageHeader, StatCard, Button, Input, Modal, Table…
    │   │   ├── layout/
    │   │   │   ├── UserLayout.jsx   # User sidebar + routing shell
    │   │   │   └── AdminLayout.jsx  # Admin sidebar + routing shell
    │   │   └── user/
    │   │       ├── PostCard.jsx     # Feed post card with like/comment
    │   │       └── SessionBar.jsx   # 5-hour countdown bar
    │   ├── context/
    │   │   ├── AuthContext.jsx  # JWT storage, auto-logout, axios interceptors
    │   │   └── ThemeContext.jsx # Dark/light toggle with persistence
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Landing.jsx
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── user/
    │   │   │   ├── Dashboard.jsx   # Stats + chart + recent posts
    │   │   │   ├── Feed.jsx        # Infinite scroll feed with search/filter
    │   │   │   ├── CreatePost.jsx  # Form with image upload
    │   │   │   ├── EditPost.jsx
    │   │   │   ├── Profile.jsx     # Profile + post management
    │   │   │   └── Notifications.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx  # Stats + chart + quick actions
    │   │   │   ├── AdminPosts.jsx      # Post table with Approve/Reject
    │   │   │   ├── AdminUsers.jsx      # User table with Block/Unblock
    │   │   │   └── ActivityLogs.jsx    # Login/logout records
    │   │   └── NotFound.jsx
    │   ├── utils/
    │   │   └── api.js          # Axios API wrappers for all endpoints
    │   ├── styles/
    │   │   └── index.css       # CSS variables, dark/light, animations
    │   ├── App.jsx             # Route definitions + protected routes
    │   └── index.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## Installation & Setup

### 1. Clone and install

```bash
# Install backend dependencies
cd freelancehub/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment variables

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/freelancehub
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=5h

# Cloudinary (optional — fallback to local disk if not set)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin account (auto-created on first run)
ADMIN_EMAIL=admin@freelancehub.com
ADMIN_PASSWORD=Admin@123456

NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Run the app

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend
npm start
```

### 4. Login

| Role  | Email                     | Password      |
|-------|---------------------------|---------------|
| Admin | admin@freelancehub.com    | Admin@123456  |
| User  | Register a new account    | Any 8+ chars  |

---

## API Endpoints

### Auth
| Method | Route                         | Auth     | Description            |
|--------|-------------------------------|----------|------------------------|
| POST   | /api/auth/register            | Public   | Create account         |
| POST   | /api/auth/login               | Public   | Login + create session |
| POST   | /api/auth/logout              | User     | End session            |
| GET    | /api/auth/me                  | User     | Get profile            |
| PUT    | /api/auth/update-profile      | User     | Update profile         |
| PUT    | /api/auth/change-password     | User     | Change password        |

### Posts
| Method | Route                         | Auth     | Description                  |
|--------|-------------------------------|----------|------------------------------|
| GET    | /api/posts                    | Optional | Public feed (approved only)  |
| POST   | /api/posts                    | User     | Create post (pending)        |
| GET    | /api/posts/my-posts           | User     | Own posts                    |
| GET    | /api/posts/:id                | Optional | Single post + comments       |
| PUT    | /api/posts/:id                | User     | Edit post (re-pends approval)|
| DELETE | /api/posts/:id                | User     | Delete own post              |
| POST   | /api/posts/:id/like           | User     | Toggle like                  |
| POST   | /api/posts/:id/comment        | User     | Add comment                  |
| GET    | /api/posts/:id/comments       | Public   | Get comments                 |

### Admin
| Method | Route                         | Auth     | Description            |
|--------|-------------------------------|----------|------------------------|
| GET    | /api/admin/dashboard          | Admin    | Stats + recent data    |
| GET    | /api/admin/posts              | Admin    | All posts (filterable) |
| PUT    | /api/admin/posts/:id/approve  | Admin    | Approve post           |
| PUT    | /api/admin/posts/:id/reject   | Admin    | Reject with reason     |
| DELETE | /api/admin/posts/:id          | Admin    | Delete post            |
| GET    | /api/admin/users              | Admin    | All users              |
| PUT    | /api/admin/users/:id/block    | Admin    | Block user             |
| PUT    | /api/admin/users/:id/unblock  | Admin    | Unblock user           |

### Logs
| Method | Route                         | Auth     | Description            |
|--------|-------------------------------|----------|------------------------|
| GET    | /api/logs                     | Admin    | All login/logout logs  |
| GET    | /api/logs/my-sessions         | User     | Own session history    |

---

## Security Features
- ✅ JWT tokens with 5-hour expiry
- ✅ Session records in DB — invalidated on logout or block
- ✅ bcryptjs password hashing (salt rounds: 12)
- ✅ Rate limiting (100 req/15min general, 10 req/15min auth)
- ✅ Helmet.js security headers
- ✅ XSS-Clean middleware
- ✅ Role-based route guards (user / admin)
- ✅ Blocked user session termination
- ✅ Axios 401 interceptor for auto-logout on expired tokens

---

## Theme Switching
Click the **☀/🌙 icon** in the sidebar. The choice is saved to `localStorage` and applied instantly across all pages via CSS custom properties (`var(--bg-primary)`, `var(--neon)`, etc.).

---

## Production Build

```bash
cd frontend
npm run build
# Serve the build/ folder from Express or a CDN
```

---

## Cloudinary Setup (Optional)
1. Create a free account at cloudinary.com
2. Copy Cloud Name, API Key, API Secret into `.env`
3. Images are auto-optimized to 800×600 and stored in `freelancehub/posts/`
4. Without Cloudinary configured, images save to `backend/uploads/` locally

---

*Built with ❤️ using React + Node.js + MongoDB*
# Avgift
