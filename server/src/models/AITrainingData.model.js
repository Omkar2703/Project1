import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  goal: { type: String, required: true },
  projectName: { type: String, required: true },
  tasks: { type: Array, required: true }
}, { timestamps: true })

export default mongoose.model('AITrainingData', schema)