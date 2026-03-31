import express from 'express'
import { register, login, getMe, logout, refreshToken } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { authLimiter } from '../middleware/rateLimiter.middleware.js'   // ✅ add
import { registerValidator, loginValidator } from '../validators/auth.validator.js'

const router = express.Router()

router.post('/register', authLimiter, registerValidator, validate, register)   // ✅
router.post('/login', authLimiter, loginValidator, validate, login)            // ✅
router.post('/refresh', authLimiter, refreshToken)                             // ✅
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)

export default router