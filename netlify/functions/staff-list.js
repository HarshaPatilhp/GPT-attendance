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
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) }
    }

    const db = await getDB()
    const staffList = await db.collection('staff').find({ createdBy: payload.email }).toArray()

    return {
      statusCode: 200,
      body: JSON.stringify({
        staff: staffList
      })
    }
  } catch (err) {
    console.error('Staff list error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' })
    }
  }
}
