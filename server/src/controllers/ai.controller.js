import { Mistral } from '@mistralai/mistralai'
import Task from '../models/Task.model.js'
import Project from '../models/Project.model.js'

export const breakdownGoal = async (req, res) => {
  const { goal, projectId } = req.body

  if (!goal || !projectId)
    return res.status(400).json({ message: 'Goal and projectId are required' })

  const project = await Project.findById(projectId)
  if (!project)
    return res.status(404).json({ message: 'Project not found' })

  if (!process.env.MISTRAL_API_KEY)
    return res.status(500).json({ message: 'Mistral API key not configured' })

  const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY
  })

  const prompt = `You are a project management assistant. Break down the following goal into 5-8 specific, actionable tasks for a software development team.

Goal: "${goal}"
Project: "${project.name}"

Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text. No backticks.
Each task must have these exact fields:
- title: short task title (max 60 chars)
- description: clear description of what needs to be done (max 150 chars)
- priority: one of "low", "medium", "high"
- status: always "todo"

Example:
[
  {
    "title": "Design login UI",
    "description": "Create wireframes and implement the login page with email and password fields",
    "priority": "high",
    "status": "todo"
  }
]`

  // ─── Call Mistral API ────────────────────────────────────────
  let rawText = ''
  try {
    const result = await client.chat.complete({
      model: 'mistral-small-latest',   // ✅ free tier model
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,   // lower = more consistent JSON output
      maxTokens: 1024
    })

    rawText = result.choices[0].message.content.trim()
    console.log('🤖 Mistral raw response:', rawText)

  } catch (err) {
    console.error('❌ Mistral API error:', err.message)

    if (err.message?.includes('429')) {
      return res.status(429).json({
        message: 'AI is busy right now — please try again in a moment.'
      })
    }

    return res.status(500).json({
      message: 'AI service error — please try again.'
    })
  }

  // ─── Parse response ──────────────────────────────────────────
  let tasks = []
  try {
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    tasks = JSON.parse(cleaned)

    if (!Array.isArray(tasks))
      throw new Error('Response is not an array')

  } catch (err) {
    console.error('❌ Failed to parse Mistral response:', rawText)
    return res.status(500).json({
      message: 'AI returned invalid response — please try again.'
    })
  }

  // ─── Save tasks to DB ────────────────────────────────────────
  const lastTask = await Task.findOne({ project: projectId }).sort({ order: -1 })
  let order = lastTask ? lastTask.order + 1 : 0

  const createdTasks = []
  for (const task of tasks) {
    const created = await Task.create({
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      status: 'todo',
      project: projectId,
      createdBy: req.user.id,
      order: order++
    })
    await created.populate('assignee', 'name email avatar')
    createdTasks.push(created)
  }

  console.log(`✅ Mistral broke down "${goal}" into ${createdTasks.length} tasks`)

  res.status(201).json({
    message: `Created ${createdTasks.length} tasks from your goal!`,
    tasks: createdTasks
  })
}