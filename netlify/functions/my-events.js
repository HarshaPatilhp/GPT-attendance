import { getDB, verifyToken } from './utils.js'

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

    const role = payload.role?.toLowerCase()
    if (role !== 'teacher' && role !== 'admin') {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      }
    }

    const db = await getDB()
    const originalEmail = payload.email || ''
    const normalizedEmail = originalEmail.toLowerCase()

    const myEvents = await db.collection('events')
      .find({
        $or: [
          { createdBy: originalEmail },
          { createdBy: normalizedEmail }
        ]
      })
      .sort({ startTime: -1 })
      .toArray()

    return {
      statusCode: 200,
      body: JSON.stringify({
        events: myEvents
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
