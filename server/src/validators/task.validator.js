import { body, param } from 'express-validator'

export const createTaskValidator = [
  param('id')
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
  body('assignee')
    .optional()
    .isMongoId().withMessage('Invalid assignee ID'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date')
]

export const updateTaskValidator = [
  param('id')
    .notEmpty().withMessage('Task ID is required')
    .isMongoId().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium or high'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date')
]