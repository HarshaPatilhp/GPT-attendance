import { getDB, verifyToken, isWithinRadius } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { secretCode, studentEmail, deviceId, lat, lng } = JSON.parse(event.body)
    console.log('Marking attendance:', { 
      secretCode: secretCode ? '***' : 'MISSING', 
      studentEmail: studentEmail || 'MISSING',
      deviceId: deviceId || 'MISSING',
      hasLocation: !!(lat && lng)
    })
    
    // Validate required fields
    if (!secretCode || !studentEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields (secretCode and studentEmail are required)' })
      }
    }

    if (!deviceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Device ID is required to mark attendance' })
      }
    }

    const db = await getDB()

    try {
      await db.collection('students').createIndex(
        { deviceId: 1 },
        { unique: true, sparse: true, name: 'uniq_student_device' }
      )
    } catch (indexErr) {
      if (indexErr.codeName !== 'IndexOptionsConflict') {
        console.warn('student device index issue:', indexErr)
      }
    }

    // Find event by secret code
    const attendanceEvent = await db.collection('events').findOne({ secretCode })
    if (!attendanceEvent) {
      console.log('Event not found for code:', secretCode)
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Invalid secret code',
          details: 'No event found with the provided secret code. Please check the code and try again.'
        })
      }
    }
    console.log('Event found:', attendanceEvent.title)

    // Check event time
    const now = new Date()
    const eventStart = new Date(attendanceEvent.startTime)
    const eventEnd = new Date(attendanceEvent.endTime)
    
    // For development: allow some buffer time (2 hours before/after)
    const bufferTime = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    const startWithBuffer = new Date(eventStart.getTime() - bufferTime)
    const endWithBuffer = new Date(eventEnd.getTime() + bufferTime)
    
    if (now < startWithBuffer) {
      console.log('Event time check failed - too early', { 
        now, 
        eventStart, 
        timeUntilStart: (eventStart - now) / (1000 * 60) + ' minutes'
      })
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Event has not started yet',
          details: `Event starts at ${eventStart.toLocaleString()}`
        })
      }
    }
    
    if (now > endWithBuffer) {
      console.log('Event time check failed - too late', { 
        now, 
        eventEnd, 
        timeSinceEnd: (now - eventEnd) / (1000 * 60) + ' minutes'
      })
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Event has already ended',
          details: `Event ended at ${eventEnd.toLocaleString()}`
        })
      }
    }
    console.log('Event time check passed')

    // Check code time window if set
    if (attendanceEvent.codeValidFrom && attendanceEvent.codeValidTill) {
      const validFrom = new Date(attendanceEvent.codeValidFrom)
      const validTill = new Date(attendanceEvent.codeValidTill)
      if (now < validFrom || now > validTill) {
        console.log('Code time check failed')
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Secret code is not valid at this time' })
        }
      }
    }

    // Check GPS radius
    if (!isWithinRadius(attendanceEvent.locationLat, attendanceEvent.locationLng, lat, lng, attendanceEvent.radiusMeters)) {
      console.log('GPS check failed', { eventLat: attendanceEvent.locationLat, eventLng: attendanceEvent.locationLng, lat, lng, radius: attendanceEvent.radiusMeters })
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'You are outside the event location radius' })
      }
    }
    console.log('GPS check passed')

    // Check student exists
    const student = await db.collection('students').findOne({ email: studentEmail })
    if (!student) {
      console.log('Student not found:', studentEmail)
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Student not found' })
      }
    }
    console.log('Student found:', student.name)

    // Check device binding
    if (student.deviceId && student.deviceId !== deviceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Attendance can only be marked from your registered device. Please contact your teacher if you changed your phone.' 
        })
      }
    }

    // Update device if not set
    if (!student.deviceId) {
      const existingOwner = await db.collection('students').findOne({ deviceId })
      if (existingOwner && existingOwner.email !== studentEmail) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'This device is already registered to another student account. Attendance cannot be marked.' })
        }
      }
      await db.collection('students').updateOne(
        { email: studentEmail },
        { $set: { deviceId } }
      )
    }

    const attendanceCollection = db.collection('attendance')

    try {
      await attendanceCollection.createIndex(
        { eventId: 1, studentEmail: 1 },
        { unique: true, name: 'uniq_event_student' }
      )
      await attendanceCollection.createIndex(
        { eventId: 1, deviceId: 1 },
        { unique: true, sparse: true, name: 'uniq_event_device' }
      )
    } catch (indexErr) {
      if (indexErr.codeName !== 'IndexOptionsConflict') {
        console.warn('attendance index creation issue:', indexErr)
      }
    }

    // Prevent duplicate submissions from same device for the event
    const existingDeviceAttendance = await attendanceCollection.findOne({ eventId: attendanceEvent.eventId, deviceId })
    if (existingDeviceAttendance && (existingDeviceAttendance.studentEmail || existingDeviceAttendance.email) !== studentEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'This device has already been used to mark attendance for this event. Only one student per device is allowed.'
        })
      }
    }

    // Record attendance
    const attendanceRecord = {
      eventId: attendanceEvent.eventId,
      email: studentEmail,
      studentEmail,
      studentName: student.name,
      usn: student.usn,
      timestamp: now,
      markedAt: now,
      lat,
      lng,
      deviceId,
      method: 'CODE',
      verified: true
    }

    const upsertResult = await attendanceCollection.updateOne(
      { eventId: attendanceEvent.eventId, studentEmail },
      { $setOnInsert: attendanceRecord },
      { upsert: true }
    )

    if (!upsertResult.upsertedCount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'You have already marked attendance for this event' })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Attendance marked successfully',
        attendance: attendanceRecord
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
