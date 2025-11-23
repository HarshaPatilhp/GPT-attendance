import { ObjectId } from 'mongodb'
import { getDB, getAuthToken, verifyToken } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  }

  try {
    const token = getAuthToken(event.headers)
    const payload = verifyToken(token)

    if (!payload) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) }
    }

    const role = (payload.role || '').toLowerCase()
    if (role !== 'teacher' && role !== 'admin') {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      }
    }

    const { eventId, mongoId } = JSON.parse(event.body || '{}')

    if (!eventId && !mongoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Event identifier is required' })
      }
    }

    const db = await getDB()

    let eventDoc = null

    if (eventId) {
      eventDoc = await db.collection('events').findOne({ eventId })
    }

    if (!eventDoc && mongoId) {
      try {
        eventDoc = await db.collection('events').findOne({ _id: new ObjectId(mongoId) })
      } catch (idErr) {
        console.warn('Invalid mongoId for event deletion:', mongoId, idErr)
      }
    }

    if (!eventDoc) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Event not found' })
      }
    }

    const eventOwner = (eventDoc.createdBy || '').toLowerCase()
    const requester = (payload.email || '').toLowerCase()

    if (role !== 'admin' && eventOwner && eventOwner !== requester) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'You can only delete events you created' })
      }
    }

    await db.collection('events').deleteOne({ _id: eventDoc._id })

    const attendanceKeys = new Set()
    if (eventDoc.eventId) attendanceKeys.add(eventDoc.eventId)
    if (eventId) attendanceKeys.add(eventId)
    if (mongoId) attendanceKeys.add(mongoId)

    if (attendanceKeys.size > 0) {
      await db.collection('attendance').deleteMany({ eventId: { $in: Array.from(attendanceKeys) } })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Event deleted successfully' })
    }
  } catch (err) {
    console.error('Event deletion error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error while deleting event' })
    }
  }
}
