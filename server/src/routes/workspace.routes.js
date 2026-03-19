import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  createWorkspace,
  getMyWorkspaces,
  addMember,
  deleteWorkspace
} from '../controllers/workspace.controller.js'

const router = express.Router()

router.post('/', protect, createWorkspace)
router.get('/', protect, getMyWorkspaces)
router.post('/:id/members', protect, addMember)
router.delete('/:id', protect, deleteWorkspace)

export default router