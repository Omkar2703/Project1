import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  sendInvite,
  acceptInvite,
  getWorkspaceInvites,
  cancelInvite
} from '../controllers/invite.controller.js'

const router = express.Router()

router.post('/send', protect, sendInvite)
router.get('/accept', acceptInvite)                        // ✅ no auth — public link
router.get('/workspace/:id', protect, getWorkspaceInvites)
router.delete('/:id', protect, cancelInvite)

export default router