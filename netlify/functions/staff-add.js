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

    const { email, name, permissions, addedBy } = JSON.parse(event.body)

    if (!email || !name) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email and name required' }) }
    }

    const db = await getDB()

    // Check if staff already exists
    const existingStaff = await db.collection('staff').findOne({ email })
    if (existingStaff) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Staff member already exists' }) }
    }

    // Add new staff
    const staffRecord = {
      email,
      name,
      role: 'staff',
      permissions: permissions || [],
      createdBy: addedBy,
      createdAt: new Date(),
      status: 'active'
    }

    await db.collection('staff').insertOne(staffRecord)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Staff member added successfully',
        staff: staffRecord
      })
    }
  } catch (err) {
    console.error('Staff add error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' })
    }
  }
}
