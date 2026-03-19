import Task from '../models/Task.model.js'
import Project from '../models/Project.model.js'

// POST /api/projects/:id/tasks
export const createTask = async (req, res) => {
  const { title, description, priority, assignee, dueDate, status, tags } = req.body

  const project = await Project.findById(req.params.id)
  if (!project)
    return res.status(404).json({ message: 'Project not found' })

  const lastTask = await Task.findOne({
    project: req.params.id,
    status: status || 'todo'
  }).sort({ order: -1 })

  const order = lastTask ? lastTask.order + 1 : 0

  const task = await Task.create({
    title,
    description,
    priority: priority || 'medium',
    status: status || 'todo',
    assignee,
    dueDate,
    tags: tags || [],
    project: req.params.id,
    createdBy: req.user.id,
    order
  })

  await task.populate('assignee', 'name email avatar')
  res.status(201).json(task)
}

// GET /api/projects/:id/tasks
export const getTasks = async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project)
    return res.status(404).json({ message: 'Project not found' })

  const tasks = await Task.find({ project: req.params.id })
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ status: 1, order: 1 })

  const grouped = {
    'todo': [],
    'in-progress': [],
    'review': [],
    'done': []
  }

  tasks.forEach(task => {
    grouped[task.status].push(task)
  })

  res.json(grouped)
}

// PATCH /api/projects/:id
export const updateTask = async (req, res) => {
  const { title, description, status, priority, assignee, dueDate, order, subtasks, tags } = req.body

  const task = await Task.findById(req.params.id)
  if (!task)
    return res.status(404).json({ message: 'Task not found' })

  if (title !== undefined) task.title = title
  if (description !== undefined) task.description = description
  if (status !== undefined) task.status = status
  if (priority !== undefined) task.priority = priority
  if (assignee !== undefined) task.assignee = assignee
  if (dueDate !== undefined) task.dueDate = dueDate
  if (order !== undefined) task.order = order
  if (subtasks !== undefined) task.subtasks = subtasks
  if (tags !== undefined) task.tags = tags

  await task.save()
  await task.populate('assignee', 'name email avatar')

  res.json(task)
}

// DELETE /api/projects/:id
export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id)
  if (!task)
    return res.status(404).json({ message: 'Task not found' })

  await task.deleteOne()
  res.json({ message: 'Task deleted successfully' })
}

// PATCH /api/tasks/:id/subtasks
export const toggleSubtask = async (req, res) => {
  const { subtaskIndex } = req.body

  const task = await Task.findById(req.params.id)
  if (!task)
    return res.status(404).json({ message: 'Task not found' })

  if (subtaskIndex === undefined || !task.subtasks[subtaskIndex])
    return res.status(400).json({ message: 'Invalid subtask index' })

  task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed
  await task.save()

  res.json(task)
}