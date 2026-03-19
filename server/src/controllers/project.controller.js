import Project from '../models/Project.model.js'
import Workspace from '../models/Workspace.model.js'

// POST /api/workspaces/:id/projects
export const createProject = async (req, res) => {
  const { name, description, color } = req.body

  const workspace = await Workspace.findById(req.params.id)
  if (!workspace)
    return res.status(404).json({ message: 'Workspace not found' })

  const isMember = workspace.members.find(m => m.user.toString() === req.user.id)
  if (!isMember)
    return res.status(403).json({ message: 'Access denied' })

  const project = await Project.create({
    name,
    description,
    color: color || '#6366f1',
    workspace: req.params.id,
    createdBy: req.user.id
  })

  res.status(201).json(project)
}

// GET /api/workspaces/:id/projects
export const getProjects = async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
  if (!workspace)
    return res.status(404).json({ message: 'Workspace not found' })

  const isMember = workspace.members.find(m => m.user.toString() === req.user.id)
  if (!isMember)
    return res.status(403).json({ message: 'Access denied' })

  const projects = await Project.find({
    workspace: req.params.id,
    status: 'active'
  }).sort({ createdAt: -1 })

  res.json(projects)
}

// DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project)
    return res.status(404).json({ message: 'Project not found' })

  const workspace = await Workspace.findById(project.workspace)
  const member = workspace.members.find(m => m.user.toString() === req.user.id)
  if (!member || member.role !== 'admin')
    return res.status(403).json({ message: 'Only admins can delete projects' })

  await project.deleteOne()
  res.json({ message: 'Project deleted successfully' })
}