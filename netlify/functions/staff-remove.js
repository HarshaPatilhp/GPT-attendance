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

    const { email } = JSON.parse(event.body)

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email required' }) }
    }

    const db = await getDB()

    // Remove staff
    await db.collection('staff').deleteOne({ email, createdBy: payload.email })

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Staff member removed successfully' })
    }
  } catch (err) {
    console.error('Staff remove error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' })
    }
  }
}
