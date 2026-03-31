import { body, param } from 'express-validator'

export const createProjectValidator = [
  param('id')
    .notEmpty().withMessage('Workspace ID is required')
    .isMongoId().withMessage('Invalid workspace ID'),
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 300 }).withMessage('Description must be under 300 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color')
]