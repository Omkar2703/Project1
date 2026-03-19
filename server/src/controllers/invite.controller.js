import crypto from 'crypto'
import Invite from '../models/Invite.model.js'
import Workspace from '../models/Workspace.model.js'
import User from '../models/User.model.js'
import { sendInviteEmail } from '../utils/sendEmail.js'

// POST /api/invites/send
export const sendInvite = async (req, res) => {
  const { email, workspaceId, role } = req.body

  if (!email || !workspaceId)
    return res.status(400).json({ message: 'Email and workspaceId are required' })

  const workspace = await Workspace.findById(workspaceId)
  if (!workspace)
    return res.status(404).json({ message: 'Workspace not found' })

  // Only admin can invite
  const requester = workspace.members.find(m => m.user.toString() === req.user.id)
  if (!requester || requester.role !== 'admin')
    return res.status(403).json({ message: 'Only admins can invite members' })

  // Check if already a member
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    const alreadyMember = workspace.members.find(
      m => m.user.toString() === existingUser._id.toString()
    )
    if (alreadyMember)
      return res.status(400).json({ message: 'User is already a member' })
  }

  // Check if pending invite already exists
  const existingInvite = await Invite.findOne({
    email,
    workspace: workspaceId,
    status: 'pending'
  })
  if (existingInvite)
    return res.status(400).json({ message: 'Invite already sent to this email' })

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await Invite.create({
    email,
    workspace: workspaceId,
    invitedBy: req.user.id,
    role: role || 'editor',
    token,
    expiresAt
  })

  // Send email
  await sendInviteEmail({
    toEmail: email,
    inviterName: req.user.name,
    workspaceName: workspace.name,
    inviteToken: token,
    role: role || 'editor'
  })

  res.status(201).json({ message: `Invitation sent to ${email}` })
}

// GET /api/invites/accept?token=xxx
export const acceptInvite = async (req, res) => {
  const { token } = req.query

  if (!token)
    return res.status(400).json({ message: 'Token is required' })

  const invite = await Invite.findOne({ token })
  if (!invite)
    return res.status(404).json({ message: 'Invalid invitation link' })

  // Check expired
  if (invite.status === 'expired' || invite.expiresAt < new Date()) {
    invite.status = 'expired'
    await invite.save()
    return res.status(400).json({ message: 'Invitation has expired' })
  }

  if (invite.status === 'accepted')
    return res.status(400).json({ message: 'Invitation already accepted' })

  // Find user by email
  const user = await User.findOne({ email: invite.email })
  if (!user)
    return res.status(404).json({
      message: 'Please register with the invited email first',
      needsRegister: true,
      email: invite.email,
      token  // send token back so after register they can auto accept
    })

  // Add to workspace
  const workspace = await Workspace.findById(invite.workspace)
  if (!workspace)
    return res.status(404).json({ message: 'Workspace no longer exists' })

  const alreadyMember = workspace.members.find(
    m => m.user.toString() === user._id.toString()
  )

  if (!alreadyMember) {
    workspace.members.push({ user: user._id, role: invite.role })
    await workspace.save()
  }

  invite.status = 'accepted'
  await invite.save()

  res.json({
    message: 'Invitation accepted!',
    workspaceId: workspace._id,
    workspaceName: workspace.name
  })
}

// GET /api/invites/workspace/:id
export const getWorkspaceInvites = async (req, res) => {
  const invites = await Invite.find({
    workspace: req.params.id,
    status: 'pending'
  }).populate('invitedBy', 'name email')

  res.json(invites)
}

// DELETE /api/invites/:id
export const cancelInvite = async (req, res) => {
  const invite = await Invite.findById(req.params.id)
  if (!invite)
    return res.status(404).json({ message: 'Invite not found' })

  await invite.deleteOne()
  res.json({ message: 'Invite cancelled' })
}