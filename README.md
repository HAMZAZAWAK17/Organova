# ⬡ Organova

> Full-stack task management app — React Native (Expo) + Node.js/Express + MySQL

---

## 📁 Project Structure

```
Organova/
├── Rules/
│   └── README_SECURITY_RULES.md   ← OWASP mandatory rules
├── backend/                        ← Node.js + Express + MySQL
│   ├── database/
│   │   ├── schema.sql              ← CREATE DATABASE + all tables
│   │   └── seed.sql                ← Dev seed data
│   ├── src/
│   │   ├── config/db.js            ← MySQL pool (env vars only)
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js  ← JWT verify + RBAC
│   │   │   ├── rateLimiter.js      ← Global + auth rate limits
│   │   │   └── validate.middleware.js
│   │   ├── validators/             ← express-validator rules
│   │   ├── controllers/            ← Business logic
│   │   ├── routes/                 ← Express routers
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/                       ← React Native (Expo)
    ├── src/
    │   ├── constants/theme.js      ← Design tokens
    │   ├── context/AuthContext.js  ← JWT + SecureStore
    │   ├── navigation/
    │   ├── screens/
    │   │   ├── auth/               ← Login, Register
    │   │   └── main/               ← Dashboard, CreateTask, TaskDetail, Profile
    │   ├── services/               ← Axios API calls
    │   └── utils/validators.js     ← Frontend validation
    ├── App.js
    ├── app.json
    └── package.json
```

---

## 🗄️ Database Tables

| Table            | Purpose                                    |
|------------------|--------------------------------------------|
| `users`          | Accounts (admin / user), bcrypt passwords  |
| `refresh_tokens` | JWT refresh token hashes                   |
| `categories`     | Task categories per user                   |
| `tasks`          | Core task management                       |
| `tags`           | Labels for tasks                           |
| `task_tags`      | Many-to-many tasks ↔ tags                  |
| `comments`       | Comments on tasks                          |
| `notifications`  | In-app notifications                       |
| `audit_logs`     | Security audit trail                       |

---

## 🔐 OWASP Security Implementation

| Rule | Where enforced |
|------|---------------|
| **1 – Input Sanitization** | `express-validator` `.escape()` + `sanitizeText()` in frontend |
| **2 – Input Validation** | Frontend (`validators.js`) + Backend (`express-validator` chains) |
| **3 – Rate Limiting** | `globalLimiter` (100/15min) + `authLimiter` (10/15min) on all routes |
| **4 – Secrets Management** | All credentials in `.env`, JWT in `SecureStore` (not AsyncStorage) |
| **5 – SQL Injection Prevention** | `mysql2` parameterized queries (`?` placeholders) everywhere |

---

## 🚀 Getting Started

### Backend

```bash
cd backend
cp .env.example .env          # fill in your DB credentials & JWT secret
npm install
# Import schema into MySQL:
mysql -u root -p < database/schema.sql
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env          # set API_BASE_URL
npm install
npx expo start
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → JWT |
| GET  | `/api/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/tasks` | List tasks (paginated, filterable) |
| GET    | `/api/tasks/:id` | Get task detail |
| POST   | `/api/tasks` | Create task |
| PUT    | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/categories` | List categories |
| POST   | `/api/categories` | Create category |
| PUT    | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/tasks/:taskId/comments` | List comments |
| POST   | `/api/tasks/:taskId/comments` | Add comment |
| DELETE | `/api/tasks/:taskId/comments/:id` | Delete comment |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/notifications` | List notifications |
| PATCH  | `/api/notifications/:id/read` | Mark one as read |
| PATCH  | `/api/notifications/read-all` | Mark all as read |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/users/profile` | Get profile |
| PUT    | `/api/users/profile` | Update name |
| PUT    | `/api/users/change-password` | Change password |
