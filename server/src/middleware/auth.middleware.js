import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorized - No token provided' })

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user)
      return res.status(401).json({ message: 'Unauthorized - User not found' })

    req.user = { id: user._id.toString(), name: user.name, email: user.email }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized - Token expired or invalid' })
  }
}