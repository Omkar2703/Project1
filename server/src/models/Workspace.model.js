import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'editor'
  }
}, { _id: false })

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [memberSchema],
  color: {
    type: String,
    default: '#6366f1'
  }
}, { timestamps: true })

export default mongoose.model('Workspace', workspaceSchema)