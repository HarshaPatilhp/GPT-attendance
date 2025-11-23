import { getDB, verifyToken } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
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

    const { email, permissions } = JSON.parse(event.body)

    if (!email || !Array.isArray(permissions)) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email and permissions required' }) }
    }

    const db = await getDB()

    // Update staff permissions
    await db.collection('staff').updateOne(
      { email, createdBy: payload.email },
      { $set: { permissions, updatedAt: new Date() } }
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Permissions updated successfully' })
    }
  } catch (err) {
    console.error('Staff update permissions error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' })
    }
  }
}
