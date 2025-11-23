import { getDB, getAuthToken, verifyToken } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const token = getAuthToken(event.headers)
    const payload = verifyToken(token)

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

    const { eventId, studentEmail } = JSON.parse(event.body)
    console.log('Staff marking attendance:', { eventId, studentEmail, staffEmail: payload.email })

    if (!eventId || !studentEmail) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Event ID and student email required' }) }
    }

    const db = await getDB()

    // Find event
    const attendanceEvent = await db.collection('events').findOne({ eventId })
    if (!attendanceEvent) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Event not found' })
      }
    }

    // Check student exists
    const student = await db.collection('students').findOne({ email: studentEmail })
    if (!student) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Student not found' })
      }
    }

    // Check if already marked
    const existingAttendance = await db.collection('attendance').findOne({
      eventId: eventId,
      studentEmail: studentEmail
    })

    if (existingAttendance) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Attendance already marked for this student and event' })
      }
    }

    // Record attendance (marked by staff, no GPS or device checks needed)
    const now = new Date()
    const attendanceRecord = {
      eventId: eventId,
      email: studentEmail,
      studentEmail: studentEmail,
      studentName: student.name,
      usn: student.usn,
      timestamp: now,
      markedAt: now,
      deviceId: null,
      method: 'STAFF_MANUAL',
      markedBy: payload.email,
      verified: true
    }

    const result = await db.collection('attendance').insertOne(attendanceRecord)
    console.log('Inserted attendance id:', result.insertedId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Attendance marked successfully',
        attendance: attendanceRecord,
        insertedId: result.insertedId
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
