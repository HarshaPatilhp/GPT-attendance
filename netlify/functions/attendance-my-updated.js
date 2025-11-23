import { getDB, getAuthToken, verifyToken } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const token = getAuthToken(event.headers)
    console.log('Token in attendance-my:', !!token)
    const payload = verifyToken(token)
    console.log('Payload in attendance-my:', !!payload, payload?.role)

    if (!payload) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized - no valid token' })
      }
    }

    const role = payload.role?.toLowerCase?.() || payload.role
    const eventId = event.queryStringParameters?.eventId

    const db = await getDB()

    // If eventId is provided, return attendance for that event (for staff viewing)
    if (eventId) {
      const attendance = await db.collection('attendance')
        .find({ eventId })
        .sort({ timestamp: -1 })
        .toArray()

      return {
        statusCode: 200,
        body: JSON.stringify({
          attendance: attendance
        })
      }
    }

    // Otherwise return student's own attendance
    if (role !== 'student') {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized - student role required for personal attendance' })
      }
    }

    const myAttendance = await db.collection('attendance')
      .find({ studentEmail: payload.email })
      .sort({ timestamp: -1 })
      .toArray()

    return {
      statusCode: 200,
      body: JSON.stringify({
        attendance: myAttendance
      })
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' })
    }
  }
}
