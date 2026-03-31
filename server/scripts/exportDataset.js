import mongoose from 'mongoose'
import fs from 'fs'
import dotenv from 'dotenv'
import AITrainingData from '../src/models/AITrainingData.model.js'

dotenv.config()

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ MongoDB connected")

    const data = await AITrainingData.find()

    console.log(`📊 Found ${data.length} records`)

    const dataset = data.map(d => ({
      instruction: "Break down goal into tasks",
      input: `Goal: ${d.goal}\nProject: ${d.projectName}`,
      output: JSON.stringify(d.tasks)
    }))

    fs.writeFileSync('dataset.json', JSON.stringify(dataset, null, 2))

    console.log("✅ dataset.json created")
    process.exit()

  } catch (err) {
    console.error("❌ Error:", err.message)
    process.exit(1)
  }
}

run()