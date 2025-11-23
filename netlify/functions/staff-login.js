import { getDB, generateToken } from './utils.js'

const DEFAULT_STAFF_PERMISSIONS = [
  'attendance:read',
  'attendance:update',
  'attendance:export',
  'events:create',
  'events:read'
]

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { email } = JSON.parse(event.body)
    console.log('Staff login attempt:', email)

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email required' }) }
    }

    const db = await getDB()

    // Find staff by email
    const staff = await db.collection('staff').findOne({
      email,
      $or: [
        { status: 'active' },
        { status: { $exists: false } }
      ]
    })
    console.log('Staff found:', !!staff)

    if (!staff) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Staff not found. Please ask your teacher to add you.' })
      }
    }

    const permissions = Array.isArray(staff.permissions) && staff.permissions.length > 0
      ? staff.permissions
      : DEFAULT_STAFF_PERMISSIONS

    if (!Array.isArray(staff.permissions) || staff.permissions.length === 0) {
      await db.collection('staff').updateOne(
        { email },
        {
          $set: {
            permissions,
            status: staff.status || 'active',
            updatedAt: new Date()
          }
        }
      )
    }

    // Generate token
    const token = generateToken(email, 'staff')
    console.log('Token generated for staff:', email)

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        role: 'staff',
        permissions,
        name: staff.name
      })
    }
  } catch (err) {
    console.error('Staff login error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' })
    }
  }
}
