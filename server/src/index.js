import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import helmet from 'helmet'
import morgan from 'morgan'
import 'express-async-errors'

// Routes
import authRoutes from './routes/auth.routes.js'
import workspaceRoutes from './routes/workspace.routes.js'
import projectRoutes from './routes/project.routes.js'
import taskRoutes from './routes/task.routes.js'
import projectActionRoutes from './routes/projectAction.routes.js'  // ✅ add this


// Socket handler
import { initSocket } from './socket/index.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// ─── Socket.io Setup ─────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
})
initSocket(io)

// ─── Middlewares ──────────────────────────────────────────────
app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CollabFlow API is running 🚀',
    timestamp: new Date().toISOString()
  })
})

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/workspaces', projectRoutes)
app.use('/api/projects', projectActionRoutes)   // ✅ DELETE /api/projects/:id
app.use('/api/projects', taskRoutes)            // ✅ /api/projects/:id/tasks

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// ─── MongoDB Atlas + Start Server ─────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected')
    httpServer.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
      console.log(`🌍 Accepting requests from ${process.env.CLIENT_URL}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })