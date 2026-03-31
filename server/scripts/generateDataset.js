// server/scripts/generateDatasetDirect.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { breakdownGoal } from '../src/controllers/ai.controller.js'

dotenv.config()

// 🔥 PUT YOUR VALUES HERE
const PROJECT_ID = "69cb6f8dcb0b7ad8de1529f8"
const USER_ID = "69cbf99e2623974d55502a0c"

// ⏱️ Delay function (VERY IMPORTANT to avoid API rate limits)
const delay = (ms) => new Promise(res => setTimeout(res, ms))

// 🔥 Dataset generators
const actions = ["Build", "Create", "Develop", "Design", "Implement"]

const systems = [
  "authentication system",
  "chat application",
  "REST API",
  "e-commerce website",
  "payment gateway",
  "notification system",
  "admin dashboard",
  "file upload system",
  "user profile module"
]

const modifiers = [
  "with JWT",
  "using Node.js",
  "with MongoDB",
  "for mobile app",
  "with real-time updates",
  "using microservices"
]

const domains = [
  "for fintech startup",
  "for social media app",
  "for SaaS platform",
  "for healthcare system"
]

// 🔥 Generate large dataset goals
function generateGoals() {
  const goals = []

  for (let action of actions) {
    for (let system of systems) {
      for (let mod of modifiers) {
        for (let domain of domains) {
          goals.push(`${action} ${system} ${mod} ${domain}`)
        }
      }
    }
  }

  return goals
}

// ✅ Mock request
function createReq(goal) {
  return {
    body: {
      goal,
      projectId: PROJECT_ID
    },
    user: {
      id: USER_ID
    }
  }
}

// ✅ Mock response
function createRes() {
  return {
    status: function () {
      return this
    },
    json: function () {}
  }
}

// 🚀 MAIN FUNCTION
async function run() {
  try {
    // ✅ Connect DB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ MongoDB connected")

    const goals = generateGoals()
    console.log(`🚀 Total goals to process: ${goals.length}`)

    let success = 0
    let failed = 0

    for (let i = 0; i < goals.length; i++) {
      const goal = goals[i]

      try {
        const req = createReq(goal)
        const res = createRes()

        await breakdownGoal(req, res)

        success++
        console.log(`✅ [${i + 1}/${goals.length}] ${goal}`)

        // ⏱️ Delay (IMPORTANT)
        await delay(2000)

      } catch (err) {
        failed++
        console.error(`❌ Failed: ${goal}`)
        console.error("   →", err.message)

        // If API error → wait more
        await delay(5000)
      }
    }

    console.log("\n📊 FINAL SUMMARY:")
    console.log(`✅ Success: ${success}`)
    console.log(`❌ Failed: ${failed}`)

    process.exit()

  } catch (err) {
    console.error("❌ DB Connection Error:", err.message)
    process.exit(1)
  }
}

// ▶️ Run
run()