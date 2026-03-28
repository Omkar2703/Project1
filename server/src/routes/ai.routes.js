import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { breakdownGoal } from '../controllers/ai.controller.js'

const router = express.Router()

router.post('/breakdown', protect, breakdownGoal)   // POST /api/ai/breakdown

export default router