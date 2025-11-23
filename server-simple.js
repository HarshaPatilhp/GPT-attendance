import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Import handlers directly
import { handler as studentLoginHandler } from './netlify/functions/student-login.js'
import { handler as studentProfileHandler } from './netlify/functions/student-profile.js'
import { handler as teacherLoginHandler } from './netlify/functions/teacher-login.js'
import { handler as eventCreateHandler } from './netlify/functions/event-create.js'
import { handler as myEventsHandler } from './netlify/functions/my-events.js'
import { handler as eventsUpcomingHandler } from './netlify/functions/events-upcoming.js'
import { handler as eventDetailsHandler } from './netlify/functions/event-details.js'
import { handler as allEventsHandler } from './netlify/functions/all-events.js'
import { handler as attendanceMarkCodeHandler } from './netlify/functions/attendance-mark-code.js'
import { handler as attendanceMarkStaffHandler } from './netlify/functions/attendance-mark-staff.js'
import { handler as attendanceMyHandler } from './netlify/functions/attendance-my.js'
import { handler as staffListHandler } from './netlify/functions/staff-list.js'
import { handler as staffAddHandler } from './netlify/functions/staff-add.js'
import { handler as staffLoginHandler } from './netlify/functions/staff-login.js'
import { handler as staffRemoveHandler } from './netlify/functions/staff-remove.js'
import { handler as staffUpdatePermissionsHandler } from './netlify/functions/staff-update-permissions.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 9000

// Map handlers
const handlers = {
  'student-login': studentLoginHandler,
  'student-profile': studentProfileHandler,
  'teacher-login': teacherLoginHandler,
  'event-create': eventCreateHandler,
  'my-events': myEventsHandler,
  'events-upcoming': eventsUpcomingHandler,
  'event-details': eventDetailsHandler,
  'all-events': allEventsHandler,
  'attendance-mark-code': attendanceMarkCodeHandler,
  'attendance-mark-staff': attendanceMarkStaffHandler,
  'attendance-my': attendanceMyHandler,
  'staff-list': staffListHandler,
  'staff-add': staffAddHandler,
  'staff-login': staffLoginHandler,
  'staff-remove': staffRemoveHandler,
  'staff-update-permissions': staffUpdatePermissionsHandler
}

console.log('✅ All handlers imported successfully')

const executeHandler = (name) => {
  return async (req, res) => {
    try {
      const handler = handlers[name]
      if (!handler) {
        console.error(`✗ Handler ${name} not found`)
        return res.status(404).json({ message: `Handler ${name} not found` })
      }
      
      const event = {
        httpMethod: req.method,
        body: req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : null,
        headers: req.headers,
        queryStringParameters: req.query || {}
      }
      
      // Log authorization for debugging
      const authHeader = req.headers.authorization || req.headers.Authorization
      console.log(`→ ${req.method} /${name} ${authHeader ? '✓ Auth' : '✗ No Auth'}`)
      
      const response = await handler(event)
      const statusCode = response.statusCode || 200
      
      res.status(statusCode)
      
      if (response.body) {
        try {
          const parsed = JSON.parse(response.body)
          res.json(parsed)
        } catch {
          res.send(response.body)
        }
      } else {
        res.send('')
      }
    } catch (error) {
      console.error(`✗ Error in ${name}:`, error.message)
      console.error(error.stack)
      res.status(500).json({ message: 'Internal server error', error: error.message })
    }
  }
}

// Register all routes
app.post('/student-login', executeHandler('student-login'))
app.post('/student-profile', executeHandler('student-profile'))
app.post('/teacher-login', executeHandler('teacher-login'))
app.post('/event-create', executeHandler('event-create'))
app.get('/my-events', executeHandler('my-events'))
app.get('/events-upcoming', executeHandler('events-upcoming'))
app.get('/event-details', executeHandler('event-details'))
app.get('/all-events', executeHandler('all-events'))
app.post('/attendance-mark-code', executeHandler('attendance-mark-code'))
app.post('/attendance-mark-staff', executeHandler('attendance-mark-staff'))
app.get('/attendance-my', executeHandler('attendance-my'))
app.post('/staff-login', executeHandler('staff-login'))
app.get('/staff-list', executeHandler('staff-list'))
app.post('/staff-add', executeHandler('staff-add'))
app.post('/staff-remove', executeHandler('staff-remove'))
app.post('/staff-update-permissions', executeHandler('staff-update-permissions'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', loaded: Object.keys(handlers).length })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n◈ Netlify Functions server ready on http://localhost:${PORT}`)
  console.log(`✅ All ${Object.keys(handlers).length} endpoints ready\n`)
})
