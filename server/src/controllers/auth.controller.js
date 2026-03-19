import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  return { accessToken, refreshToken }
}

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required' })

  const exists = await User.findOne({ email })
  if (exists)
    return res.status(400).json({ message: 'Email already in use' })

  const user = await User.create({ name, email, password })
  const { accessToken, refreshToken } = generateTokens(user._id)

  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  })
}

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' })

  const user = await User.findOne({ email })
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' })

  const { accessToken, refreshToken } = generateTokens(user._id)

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  })
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user)
    return res.status(404).json({ message: 'User not found' })

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt
  })
}

// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken)
    return res.status(401).json({ message: 'Refresh token required' })

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user)
      return res.status(401).json({ message: 'User not found' })

    const tokens = generateTokens(user._id)
    res.json(tokens)
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }
}

// POST /api/auth/logout
export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' })
}