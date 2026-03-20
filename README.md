# CollabFlow

A real-time project and task management app — think of it as a lightweight Notion + Trello hybrid. Built with React, Node.js, Express, MongoDB Atlas, and Socket.io.

---

## What this app does

- Create workspaces and invite team members
- Manage projects inside each workspace
- Kanban board with drag and drop task management
- Real-time updates across all connected users via Socket.io
- Invite members by email (Resend) or directly by User ID
- JWT-based auth with access + refresh tokens

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Zustand, TanStack Query |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Real-time | Socket.io |
| Auth | JWT (access + refresh tokens) |
| Email | Resend |
| Container | Docker (optional) |

---

## Project Structure

```
Project1/
├── docker-compose.yml
├── client/                         # React frontend
│   ├── src/
│   │   ├── api/                    # Axios API calls
│   │   │   ├── axios.js            # Axios instance + interceptors
│   │   │   ├── auth.api.js
│   │   │   ├── workspace.api.js
│   │   │   ├── project.api.js
│   │   │   ├── task.api.js
│   │   │   └── invite.api.js
│   │   ├── store/                  # Zustand global state
│   │   │   ├── authStore.js
│   │   │   └── workspaceStore.js
│   │   ├── hooks/
│   │   │   └── useSocket.js        # Socket.io hook
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx       # Workspaces + Projects
│   │   │   ├── Board.jsx           # Kanban board
│   │   │   └── AcceptInvite.jsx    # Email invite accept page
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── InviteMemberModal.jsx
│   │   │   └── board/
│   │   │       ├── KanbanColumn.jsx
│   │   │       ├── TaskCard.jsx
│   │   │       └── TaskModal.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                         # Express backend
    ├── src/
    │   ├── controllers/
    │   │   ├── auth.controller.js
    │   │   ├── workspace.controller.js
    │   │   ├── project.controller.js
    │   │   ├── task.controller.js
    │   │   └── invite.controller.js
    │   ├── models/
    │   │   ├── User.model.js
    │   │   ├── Workspace.model.js
    │   │   ├── Project.model.js
    │   │   ├── Task.model.js
    │   │   └── Invite.model.js
    │   ├── routes/
    │   │   ├── auth.routes.js
    │   │   ├── workspace.routes.js
    │   │   ├── project.routes.js
    │   │   ├── projectAction.routes.js
    │   │   ├── task.routes.js
    │   │   └── invite.routes.js
    │   ├── middleware/
    │   │   └── auth.middleware.js   # JWT protect middleware
    │   ├── socket/
    │   │   └── index.js             # Socket.io handlers
    │   ├── utils/
    │   │   └── sendEmail.js         # Resend email utility
    │   └── index.js                 # App entry point
    ├── .env                         # Environment variables (never commit this)
    └── package.json
```

---

## Running the project on a new machine

### Prerequisites

Make sure you have these installed:

- Node.js v20+
- npm
- Git

Check with:
```bash
node --version
npm --version
```

---

### Step 1 — Clone the repo

```bash
git clone <your-repo-url>
cd Project1
```

---

### Step 2 — Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/collabflow
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

JWT_SECRET=<generate_a_random_64_char_hex_string>
JWT_REFRESH_SECRET=<generate_another_random_64_char_hex_string>

RESEND_API_KEY=re_your_resend_api_key
```

To generate JWT secrets, run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run it twice — once for JWT_SECRET and once for JWT_REFRESH_SECRET.

Start the server:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Atlas Connected
🚀 Server running on http://localhost:5000
```

---

### Step 3 — Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

App will be available at `http://localhost:5173`

---

### Step 4 — MongoDB Atlas setup (if setting up fresh)

1. Go to mongodb.com/atlas and create a free account
2. Create a new cluster (free M0 tier)
3. Go to **Database Access** → create a user with read/write permissions
4. Go to **Network Access** → add your IP address (or 0.0.0.0/0 for all IPs)
5. Go to **Connect** → copy the connection string
6. Paste it in `server/.env` as `MONGO_URI`

---

### Step 5 — Resend setup (for email invites)

1. Go to resend.com and create a free account
2. Go to **API Keys** → Create API Key → copy it
3. Verify your email address in Resend dashboard
4. Paste the key in `server/.env` as `RESEND_API_KEY`
5. Update the `from` field in `server/src/utils/sendEmail.js` to your verified email

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout |

### Workspaces
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/workspaces` | Yes | Get my workspaces |
| POST | `/api/workspaces` | Yes | Create workspace |
| DELETE | `/api/workspaces/:id` | Yes | Delete workspace |
| POST | `/api/workspaces/:id/members` | Yes | Add member by User ID |

### Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/workspaces/:id/projects` | Yes | Get projects |
| POST | `/api/workspaces/:id/projects` | Yes | Create project |
| DELETE | `/api/projects/:id` | Yes | Delete project |

### Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects/:id/tasks` | Yes | Get tasks (grouped by status) |
| POST | `/api/projects/:id/tasks` | Yes | Create task |
| PATCH | `/api/projects/tasks/:id` | Yes | Update task |
| DELETE | `/api/projects/tasks/:id` | Yes | Delete task |
| PATCH | `/api/projects/tasks/:id/subtasks` | Yes | Toggle subtask |

### Invites
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/invites/send` | Yes | Send email invite |
| GET | `/api/invites/accept?token=xxx` | No | Accept invite via link |
| GET | `/api/invites/workspace/:id` | Yes | List pending invites |
| DELETE | `/api/invites/:id` | Yes | Cancel invite |

---

## Environment Variables Reference

| Variable | Where | Description |
|---|---|---|
| `MONGO_URI` | server | MongoDB Atlas connection string |
| `PORT` | server | Backend port (default 5000) |
| `CLIENT_URL` | server | Frontend URL for CORS |
| `JWT_SECRET` | server | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | server | Secret for signing refresh tokens |
| `RESEND_API_KEY` | server | Resend API key for sending emails |
| `NODE_ENV` | server | development or production |

---

## Known issues and things to fix later

- Email invites only work if sender email is verified on Resend (free tier limitation). To send to anyone, add a custom domain in Resend dashboard.
- Docker setup is not fully tested yet — use manual `npm run dev` for both server and client for now.
- No role-based UI restrictions yet — viewers can still see edit buttons (backend blocks them though).
- Access token expires in 15 minutes — refresh token flow is implemented but needs more testing.

---

## Features still to build

- [ ] Email invite flow fully working end to end
- [ ] Docker compose working correctly
- [ ] User profile page with avatar upload
- [ ] Notifications system (bell icon)
- [ ] Analytics dashboard (tasks completed chart)
- [ ] Deploy — Railway for backend, Vercel for frontend
- [ ] TypeScript migration
- [ ] Search tasks across projects

---

## Useful commands

```bash
# Generate a JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Kill process on port 5000 (if EADDRINUSE error)
kill -9 $(lsof -t -i:5000)

# Clear Vite cache
rm -rf client/node_modules/.vite

# Clean install server
cd server && rm -rf node_modules package-lock.json && npm install

# Clean install client
cd client && rm -rf node_modules package-lock.json && npm install
```

---

## Notes

- Never commit the `.env` file — make sure it's in `.gitignore`
- JWT tokens: access token expires in 15 mins, refresh token in 7 days
- MongoDB Atlas free tier (M0) is enough for development and small production use
- Resend free tier gives 3,000 emails/month which is fine for most use cases
