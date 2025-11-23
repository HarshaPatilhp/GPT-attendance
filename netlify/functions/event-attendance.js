import { getDB, verifyToken } from './utils.js'
import { ObjectId } from 'mongodb'

export const handler = async (event) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  }

  try {
    const token = event.headers.authorization?.split(' ')[1]
    const payload = verifyToken(token)

    if (!payload) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) }
    }

    // Get eventId from query parameters
    const { eventId } = event.queryStringParameters || {}
    
    if (!eventId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Event ID is required' })
      }
    }

    const db = await getDB()

    // Try to find by eventId field first
    let eventDoc = await db.collection('events').findOne({ eventId })
    
    // If not found, try to find by MongoDB _id
    if (!eventDoc && ObjectId.isValid(eventId)) {
      eventDoc = await db.collection('events').findOne({ _id: new ObjectId(eventId) })
    }

    if (!eventDoc) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Event not found' })
      }
    }

    // Find all attendance records for this event
    const attendance = await db.collection('attendance')
      .find({ eventId })
      .sort({ markedAt: -1 }) // Most recent first
      .toArray()

    const studentEmails = attendance
      .map((record) => record.email || record.studentEmail)
      .filter(Boolean)

    const studentProfiles = studentEmails.length
      ? await db.collection('students')
          .find({ email: { $in: studentEmails } })
          .project({ email: 1, name: 1, usn: 1, _id: 0 })
          .toArray()
      : []

    const studentMap = studentProfiles.reduce((acc, profile) => {
      acc[profile.email] = profile
      return acc
    }, {})

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        success: true,
        attendance: attendance.map(record => {
          const email = record.email || record.studentEmail || 'unknown@bmsit.in'
          const profile = studentMap[email] || {}
          return {
            _id: record._id.toString(),
            eventId: record.eventId,
            email,
            name: profile.name || record.studentName || 'Unknown Student',
            usn: profile.usn || record.usn || 'N/A',
            markedAt: record.markedAt || record.timestamp,
            deviceId: record.deviceId,
            location: record.location
          }
        })
      })
    }
  } catch (error) {
    console.error('Error fetching event attendance:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Failed to fetch attendance',
        error: error.message 
      })
    }
  }
}
