import mongoose from 'mongoose'

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'editor'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true })

export default mongoose.model('Invite', inviteSchema)