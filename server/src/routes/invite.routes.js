import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { inviteLimiter } from '../middleware/rateLimiter.middleware.js'   // ✅ add
import { sendInviteValidator } from '../validators/invite.validator.js'
import {
  sendInvite,
  acceptInvite,
  getWorkspaceInvites,
  cancelInvite
} from '../controllers/invite.controller.js'

const router = express.Router()

router.post('/send', protect, inviteLimiter, sendInviteValidator, validate, sendInvite)  // ✅
router.get('/accept', acceptInvite)
router.get('/workspace/:id', protect, getWorkspaceInvites)
router.delete('/:id', protect, cancelInvite)

export default router