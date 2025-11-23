import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

let cachedClient = null

async function connectDB() {
  if (cachedClient) return cachedClient
  
  const client = new MongoClient(MONGODB_URI)
  
  await client.connect()
  cachedClient = client
  return client
}

async function getDB() {
  const client = await connectDB()
  return client.db('test')
}

function generateToken(email, role) {
  return jwt.sign(
    { email, role },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

function generateEventId() {
  return 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

function generateSecretCode() {
  const code = Math.random().toString(36).substring(2, 6).toUpperCase()
  return 'AI-' + code
}

function isWithinRadius(eventLat, eventLng, userLat, userLng, radiusMeters) {
  const R = 6371000 // Earth's radius in meters
  const dLat = (userLat - eventLat) * Math.PI / 180
  const dLng = (userLng - eventLng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(eventLat * Math.PI / 180) * Math.cos(userLat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  return distance <= radiusMeters
}

function getAuthToken(headers) {
  // Try different header name variations since Express may normalize them
  const auth = headers.authorization || headers.Authorization || headers.AUTHORIZATION || ''
  const match = auth.match(/Bearer\s+(.+)/)
  return match ? match[1] : null
}

export {
  connectDB,
  getDB,
  generateToken,
  verifyToken,
  generateEventId,
  generateSecretCode,
  isWithinRadius,
  getAuthToken,
  JWT_SECRET
}
