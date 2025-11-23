import { getDB, verifyToken } from './utils.js'
import { ObjectId } from 'mongodb'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const token = event.headers.authorization?.split(' ')[1]
    const payload = verifyToken(token)

    if (!payload) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) }
    }

    const eventId = event.queryStringParameters?.eventId

    if (!eventId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Event ID required' }) }
    }

    const db = await getDB()

    // Try to find by eventId field first
    let eventDoc = await db.collection('events').findOne({ eventId })
    
    // If not found, try to find by MongoDB _id
    if (!eventDoc && ObjectId.isValid(eventId)) {
      eventDoc = await db.collection('events').findOne({ _id: new ObjectId(eventId) })
    }

    if (!eventDoc) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Event not found' }) }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        event: eventDoc
      })
    }
  } catch (err) {
    console.error('Event details error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' })
    }
  }
}
