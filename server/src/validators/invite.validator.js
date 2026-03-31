import { body } from 'express-validator'

export const sendInviteValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('workspaceId')
    .notEmpty().withMessage('Workspace ID is required')
    .isMongoId().withMessage('Invalid workspace ID'),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'viewer']).withMessage('Role must be admin, editor or viewer')
]