import { getDB, getAuthToken, verifyToken } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const token = getAuthToken(event.headers)
    const payload = verifyToken(token)

    if (!payload) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      }
    }

    const role = (payload.role || '').toLowerCase()
    const db = await getDB()

    // If eventId provided and requester is staff/teacher/admin, return attendance for that event
    const eventId = event.queryStringParameters?.eventId
    if (eventId && (role === 'staff' || role === 'teacher' || role === 'admin')) {
      const attendance = await db.collection('attendance')
        .find({ eventId })
        .sort({ markedAt: -1, timestamp: -1 })
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
        body: JSON.stringify({
          attendance: attendance.map((record) => {
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
    }

    // Otherwise only students can fetch their own attendance
    if (role !== 'student') {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      }
    }

    const myAttendance = await db.collection('attendance')
      .find({ studentEmail: payload.email })
      .sort({ timestamp: -1 })
      .toArray()

    return {
      statusCode: 200,
      body: JSON.stringify({ attendance: myAttendance })
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' })
    }
  }
}
