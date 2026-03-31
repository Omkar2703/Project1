import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { aiLimiter } from '../middleware/rateLimiter.middleware.js'   // ✅ add
import { breakdownGoal } from '../controllers/ai.controller.js'

const router = express.Router()

router.post('/breakdown', protect, aiLimiter, breakdownGoal)   // ✅

export default router