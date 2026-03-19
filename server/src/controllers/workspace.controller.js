import Workspace from '../models/Workspace.model.js'

// POST /api/workspaces
export const createWorkspace = async (req, res) => {
  const { name, description, color } = req.body

  if (!name)
    return res.status(400).json({ message: 'Workspace name is required' })

  const workspace = await Workspace.create({
    name,
    description,
    color: color || '#6366f1',
    owner: req.user.id,
    members: [{ user: req.user.id, role: 'admin' }]
  })

  res.status(201).json(workspace)
}

// GET /api/workspaces
export const getMyWorkspaces = async (req, res) => {
  const workspaces = await Workspace.find({
    'members.user': req.user.id
  }).populate('owner', 'name email avatar')

  res.json(workspaces)
}

// POST /api/workspaces/:id/members
export const addMember = async (req, res) => {
  const { userId, role } = req.body

  const workspace = await Workspace.findById(req.params.id)
  if (!workspace)
    return res.status(404).json({ message: 'Workspace not found' })

  const requester = workspace.members.find(m => m.user.toString() === req.user.id)
  if (!requester || requester.role !== 'admin')
    return res.status(403).json({ message: 'Only admins can add members' })

  const alreadyMember = workspace.members.find(m => m.user.toString() === userId)
  if (alreadyMember)
    return res.status(400).json({ message: 'User already a member' })

  workspace.members.push({ user: userId, role: role || 'editor' })
  await workspace.save()

  res.json(workspace)
}

// DELETE /api/workspaces/:id
export const deleteWorkspace = async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
  if (!workspace)
    return res.status(404).json({ message: 'Workspace not found' })

  if (workspace.owner.toString() !== req.user.id)
    return res.status(403).json({ message: 'Only the owner can delete this workspace' })

  await workspace.deleteOne()
  res.json({ message: 'Workspace deleted successfully' })
}