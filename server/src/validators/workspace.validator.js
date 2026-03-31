import { body, param } from 'express-validator'

export const createWorkspaceValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Workspace name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('Description must be under 200 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color')
]

export const addMemberValidator = [
  param('id')
    .notEmpty().withMessage('Workspace ID is required')
    .isMongoId().withMessage('Invalid workspace ID'),
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'viewer']).withMessage('Role must be admin, editor or viewer')
]