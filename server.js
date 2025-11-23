import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 9000

// Pre-load all handlers
const handlers = {}

// Load handlers
const handlerFiles = [
  'student-login',
  'student-profile',
  'teacher-login',
  'event-create',
  'my-events',
  'events-upcoming',
  'attendance-mark-code',
  'attendance-my'
]

for (const file of handlerFiles) {
  try {
    const mod = await import(`./netlify/functions/${file}.js?t=${Date.now()}`)
    handlers[file] = mod.handler
    console.log(`✅ Loaded: ${file}`)
  } catch (err) {
    console.error(`❌ Failed to load ${file}:`, err.message)
  }
}

// Wrapper for each handler
const executeHandler = (handlerFunc) => {
  return async (req, res) => {
    try {
      if (!handlerFunc) {
        return res.status(404).json({ message: 'Handler not found' })
      }
      
      const event = {
        httpMethod: req.method,
        body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
        headers: req.headers,
        queryStringParameters: req.query
      }
      
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
      
      const response = await handlerFunc(event)
      res.status(response.statusCode || 200)
      
      try {
        res.json(JSON.parse(response.body))
      } catch (e) {
        res.send(response.body)
      }
    } catch (error) {
      console.error(`Handler error at ${req.path}:`, error.message)
      res.status(500).json({ message: error.message || 'Internal server error' })
    }
  }
}

// Register routes
app.post('/student-login', executeHandler(handlers['student-login']))
app.post('/student-profile', executeHandler(handlers['student-profile']))
app.post('/teacher-login', executeHandler(handlers['teacher-login']))
app.post('/event-create', executeHandler(handlers['event-create']))
app.get('/my-events', executeHandler(handlers['my-events']))
app.get('/events-upcoming', executeHandler(handlers['events-upcoming']))
app.post('/attendance-mark-code', executeHandler(handlers['attendance-mark-code']))
app.get('/attendance-my', executeHandler(handlers['attendance-my']))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Netlify Functions server is running' })
})

app.listen(PORT, () => {
  console.log(`◈ Netlify Functions server ready on http://localhost:${PORT}`)
  console.log(`✅ All endpoints ready for development`)
})
