import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  toggleSubtask
} from '../controllers/task.controller.js'

const router = express.Router()

router.post('/:id/tasks', protect, createTask)
router.get('/:id/tasks', protect, getTasks)
router.patch('/tasks/:id', protect, updateTask)        //
router.delete('/tasks/:id', protect, deleteTask)       //
router.patch('/:id/subtasks', protect, toggleSubtask)

export default router