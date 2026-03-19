import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  createProject,
  getProjects,
  deleteProject
} from '../controllers/project.controller.js'

const router = express.Router()

router.post('/:id/projects', protect, createProject)
router.get('/:id/projects', protect, getProjects)
router.delete('/projects/:id', protect, deleteProject)

export default router