import { getDB, verifyToken, getAuthToken } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const token = getAuthToken(event.headers)
    console.log('Token received:', !!token)
    const payload = verifyToken(token)
    console.log('Token verified:', !!payload)

    if (!payload) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) }
    }

    const role = payload.role?.toLowerCase()
    if (role !== 'staff' && role !== 'teacher' && role !== 'admin') {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      }
    }

    const db = await getDB()

    // Get all events
    const allEvents = await db.collection('events')
      .find({})
      .sort({ startTime: -1 })
      .toArray()

    return {
      statusCode: 200,
      body: JSON.stringify({
        events: allEvents
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
