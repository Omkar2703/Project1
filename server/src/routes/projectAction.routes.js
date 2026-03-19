import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { deleteProject } from '../controllers/project.controller.js'

const router = express.Router()

router.delete('/:id', protect, deleteProject)   // DELETE /api/projects/:id

export default router