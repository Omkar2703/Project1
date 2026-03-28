# CollabFlow

A real-time project and task management SaaS app — think lightweight Notion + Trello hybrid with AI superpowers. Built with React, Node.js, Express, MongoDB Atlas, and Socket.io.

---

## What this app does

- Create workspaces and invite team members
- Manage projects inside each workspace
- Kanban board with drag and drop task management
- Real-time updates across all connected users via Socket.io
- Invite members by email (Nodemailer + Gmail SMTP) or directly by User ID
- JWT-based auth with access + refresh tokens
- AI Task Breakdown — type a goal, AI breaks it into tasks on the board (Mistral AI)
- Automated email reminders for due and overdue tasks (node-cron)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Zustand, TanStack Query v5 |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Real-time | Socket.io |
| Auth | JWT (access token 15min + refresh token 7days) |
| Email | Nodemailer + Gmail SMTP |
| AI | Mistral AI (mistral-small-latest) |
| Scheduling | node-cron (daily task reminders) |
| Container | Docker (optional, not fully tested yet) |

---

## Project Structure

```
Project1/
├── docker-compose.yml
├── README.md
├── client/                               # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js                  # Axios instance + interceptors + auto token refresh
│   │   │   ├── auth.api.js
│   │   │   ├── workspace.api.js
│   │   │   ├── project.api.js
│   │   │   ├── task.api.js
│   │   │   ├── invite.api.js
│   │   │   └── ai.api.js                 # AI breakdown API call
│   │   ├── store/
│   │   │   ├── authStore.js              # Zustand auth state (persisted)
│   │   │   └── workspaceStore.js         # Active workspace state
│   │   ├── hooks/
│   │   │   └── useSocket.js              # Socket.io hook + project room joining
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx             # Sidebar + main content
│   │   │   └── AuthLayout.jsx            # Centered auth card layout
│   │   ├── pages/
│   │   │   ├── Login.jsx                 # Handles invite token redirect after login
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx             # Workspaces + Projects + delete + invite
│   │   │   ├── Board.jsx                 # Kanban board + drag & drop + AI button
│   │   │   └── AcceptInvite.jsx          # Email invite accept page
│   │   ├── components/
│   │   │   ├── Sidebar.jsx               # Nav + user info + copy user ID
│   │   │   ├── InviteMemberModal.jsx     # Email tab + User ID tab
│   │   │   └── board/
│   │   │       ├── KanbanColumn.jsx      # Droppable column + add task input
│   │   │       ├── TaskCard.jsx          # Draggable card + priority + subtask progress
│   │   │       ├── TaskModal.jsx         # Edit task + subtasks + due date
│   │   │       └── AIBreakdownModal.jsx  # AI goal input + example prompts
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js                    # Proxy /api to localhost:5000
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── server/                               # Express backend
    ├── src/
    │   ├── controllers/
    │   │   ├── auth.controller.js        # register, login, getMe, refresh, logout
    │   │   ├── workspace.controller.js   # create, get, addMember, delete
    │   │   ├── project.controller.js     # create, get, delete
    │   │   ├── task.controller.js        # create, get, update, delete, toggleSubtask
    │   │   ├── invite.controller.js      # sendInvite, acceptInvite, getInvites, cancel
    │   │   └── ai.controller.js          # breakdownGoal with Mistral AI
    │   ├── models/
    │   │   ├── User.model.js             # name, email, password (hashed), avatar
    │   │   ├── Workspace.model.js        # name, owner, members (with roles)
    │   │   ├── Project.model.js          # name, description, color, workspace ref
    │   │   ├── Task.model.js             # title, status, priority, assignee, subtasks, order
    │   │   └── Invite.model.js           # email, token, workspace, role, status, expiresAt
    │   ├── routes/
    │   │   ├── auth.routes.js
    │   │   ├── workspace.routes.js
    │   │   ├── project.routes.js         # GET + POST for workspace projects
    │   │   ├── projectAction.routes.js   # DELETE /api/projects/:id
    │   │   ├── task.routes.js            # GET + POST + PATCH + DELETE for tasks
    │   │   ├── invite.routes.js
    │   │   └── ai.routes.js
    │   ├── middleware/
    │   │   └── auth.middleware.js        # JWT protect middleware → sets req.user
    │   ├── socket/
    │   │   └── index.js                  # join-project, task-created, task-updated, task-deleted
    │   ├── jobs/
    │   │   └── taskReminder.job.js       # Cron job — runs daily at 8 AM
    │   ├── utils/
    │   │   ├── sendEmail.js              # Nodemailer invite email
    │   │   └── sendReminderEmail.js      # Due soon + overdue reminder emails
    │   └── index.js                      # App entry point
    ├── .env                              # Never commit this!
    ├── .gitignore
    ├── Dockerfile
    └── package.json
```

---

## Running on a new machine

### Prerequisites

```bash
node --version    # needs v20+
npm --version
git --version
```

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/Omkar2703/Project1.git
cd Project1
```

---

### Step 2 — Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/collabflow
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

JWT_SECRET=<generate_below>
JWT_REFRESH_SECRET=<generate_below>

GMAIL_USER=yourcollabflowgmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

MISTRAL_API_KEY=your_mistral_api_key
```

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run twice — one for JWT_SECRET, one for JWT_REFRESH_SECRET.

Start backend:
```bash
npm run dev
```

Expected output:
```
✅ MongoDB Atlas Connected
🚀 Server running on http://localhost:5000
✅ Task reminder cron job scheduled — runs daily at 8:00 AM
```

---

### Step 3 — Frontend setup

```bash
cd ../client
npm install
npm run dev
```

App available at **http://localhost:5173**

---

### Step 4 — MongoDB Atlas (fresh setup)

1. Go to **mongodb.com/atlas** → create free account
2. Create cluster → free M0 tier
3. **Database Access** → create user with read/write
4. **Network Access** → add IP (or 0.0.0.0/0 for all)
5. **Connect** → copy connection string → paste in `.env` as `MONGO_URI`

---

### Step 5 — Gmail SMTP (for email invites + reminders)

> Must use a personal Gmail (@gmail.com) — college/work accounts don't support App Passwords

1. Enable **2-Step Verification** on your Gmail
2. Go to **myaccount.google.com/security**
3. Search **"App Passwords"** → Create → name it `CollabFlow`
4. Copy the 16-digit password
5. Add to `.env` as `GMAIL_USER` and `GMAIL_APP_PASSWORD`

---

### Step 6 — Mistral AI (for AI task breakdown)

1. Go to **console.mistral.ai** → sign up free, no card needed
2. **API Keys** → Create new key
3. Copy key → add to `.env` as `MISTRAL_API_KEY`

Free tier model used: `mistral-small-latest`

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get tokens |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout |

### Workspaces
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/workspaces` | Yes | Get my workspaces |
| POST | `/api/workspaces` | Yes | Create workspace |
| DELETE | `/api/workspaces/:id` | Yes | Delete workspace (owner only) |
| POST | `/api/workspaces/:id/members` | Yes | Add member by User ID (admin only) |

### Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/workspaces/:id/projects` | Yes | Get projects in workspace |
| POST | `/api/workspaces/:id/projects` | Yes | Create project |
| DELETE | `/api/projects/:id` | Yes | Delete project (admin only) |

### Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects/:id/tasks` | Yes | Get tasks grouped by status |
| POST | `/api/projects/:id/tasks` | Yes | Create task |
| PATCH | `/api/projects/tasks/:id` | Yes | Update task (drag & drop, edit) |
| DELETE | `/api/projects/tasks/:id` | Yes | Delete task |
| PATCH | `/api/projects/tasks/:id/subtasks` | Yes | Toggle subtask complete |

### Invites
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/invites/send` | Yes | Send email invite |
| GET | `/api/invites/accept?token=xxx` | No | Accept invite via link |
| GET | `/api/invites/workspace/:id` | Yes | List pending invites |
| DELETE | `/api/invites/:id` | Yes | Cancel invite |

### AI
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/breakdown` | Yes | Break goal into tasks using Mistral AI |

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | Backend port (default 5000) |
| `CLIENT_URL` | Frontend URL for CORS (http://localhost:5173) |
| `JWT_SECRET` | Secret for signing access tokens (64 char hex) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (64 char hex) |
| `GMAIL_USER` | Gmail address used to send emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16 digits, no spaces) |
| `MISTRAL_API_KEY` | Mistral AI API key for task breakdown |
| `NODE_ENV` | development or production |

---

## Features

### Done
- User registration and login with JWT auth
- Access token (15min) + refresh token (7 days) with auto refresh
- Workspaces — create, delete, invite members
- Projects — create, delete inside workspaces
- Kanban board with drag and drop (4 columns: Todo, In Progress, Review, Done)
- Real-time task sync across all users via Socket.io
- Tasks — create, edit, delete, subtasks, due dates, priority, assignee
- Invite members by email (sends HTML email via Gmail SMTP)
- Invite members by User ID (direct add)
- Email invite accept flow — login redirect, register redirect
- Delete workspace with confirm dialog
- Delete project with confirm dialog
- Copy User ID from sidebar
- AI Task Breakdown — type a goal, Mistral AI creates tasks on the board
- Automated email reminders — 1 day before due + overdue alerts at 8 AM daily

### Todo
- UI loading states (spinner while fetching)
- Empty states with illustrations
- Board header shows project name
- User profile page with avatar
- Task filters (by priority, assignee)
- Notifications bell icon
- Docker compose fully working
- Deploy — Railway (backend) + Vercel (frontend)
- TypeScript migration
- Analytics dashboard

---

## How email reminders work

A cron job runs every day at 8:00 AM and:
1. Finds all tasks due tomorrow that are not done → sends yellow reminder email to assignee
2. Finds all tasks past due date that are not done → sends red overdue alert to assignee

To test without waiting till 8 AM, temporarily change the schedule in `taskReminder.job.js`:
```js
cron.schedule('* * * * *', ...)   // runs every minute for testing
```
Change back to `'0 8 * * *'` after testing.

---

## How AI task breakdown works

1. Click **AI Breakdown** button on any board
2. Type your goal (e.g. "Build user authentication system")
3. Click **Generate Tasks**
4. Mistral AI breaks it into 5-8 tasks with titles, descriptions and priorities
5. Tasks appear instantly in the Todo column
6. Real-time sync sends them to all connected users via Socket.io

---

## Common errors and fixes

| Error | Fix |
|---|---|
| `EADDRINUSE: port 5000` | `kill -9 $(lsof -t -i:5000)` or disable AirPlay in Mac settings |
| `ENOTFOUND server` in Vite | Change `vite.config.js` proxy target to `http://localhost:5000` |
| `npm error ERESOLVE` | Run `npm install --legacy-peer-deps` |
| Docker command not found | Use `docker compose` not `docker-compose` |
| Gmail App Passwords not available | Must use personal Gmail not college/work account |
| Mistral 429 rate limit | Wait a moment and retry — free tier has per-minute limits |
| JWT token expired | Auto handled by axios interceptor — logs out if refresh also fails |
| `git divergent branches` | Run `git config pull.rebase false` then `git pull origin main` |

---

## Useful commands

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Kill process on port 5000
kill -9 $(lsof -t -i:5000)

# Kill process on port 5173
kill -9 $(lsof -t -i:5173)

# Clear Vite cache
rm -rf client/node_modules/.vite

# Clean reinstall server
cd server && rm -rf node_modules package-lock.json && npm install

# Clean reinstall client
cd client && rm -rf node_modules package-lock.json && npm install

# Save and push all changes
git add . && git commit -m "your message" && git push origin main

# Pull latest without conflicts
git config pull.rebase false && git pull origin main
```

---

## Notes

- Never commit `.env` — always check `.gitignore` includes it
- Access token expires in 15 mins — frontend auto refreshes it using the refresh token
- MongoDB Atlas free tier (M0) is enough for development and small production use
- Mistral free tier has per-minute rate limits — hitting them just means wait a moment
- Gmail SMTP daily limit is 500 emails — fine for development and small teams
- Socket.io rooms are per-project — only users viewing the same board get real-time updates
- The AI feature sends tasks directly to the Todo column and emits socket events so all connected users see them instantly