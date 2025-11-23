import { getDB, generateEventId, generateSecretCode, verifyToken, getAuthToken } from './utils.js'

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

    const db = await getDB()
    const role = (payload.role || '').toLowerCase()
    const requesterEmail = (payload.email || '').toLowerCase()

    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {}

    const requiredFields = ['title', 'startTime', 'endTime', 'location']
    const missingField = requiredFields.find((field) => !body[field])
    if (missingField) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: `Missing required field: ${missingField}` })
      }
    }

    const {
      title,
      description = '',
      startTime,
      endTime,
      location,
      locationLat,
      locationLng,
      radiusMeters = 200,
      secretCodeEnabled = true,
      qrModeEnabled = false,
      codeValidFrom,
      codeValidTill
    } = body

    let canCreate = role === 'teacher' || role === 'admin'

    if (!canCreate) {
      if (role === 'staff') {
        const staffRecord = await db.collection('staff').findOne({ email: requesterEmail, status: 'active' })
        const permissionList = Array.isArray(staffRecord?.permissions)
          ? staffRecord.permissions.map((perm) => perm.toLowerCase())
          : []

        canCreate = permissionList.includes('events:create')

        if (!canCreate) {
          return {
            statusCode: 403,
            body: JSON.stringify({ message: 'You do not have permission to create events' })
          }
        }
      } else {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Unauthorized' })
        }
      }
    }

    const parsedStart = new Date(startTime)
    const parsedEnd = new Date(endTime)

    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid event start or end time' })
      }
    }

    if (parsedEnd <= parsedStart) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'End time must be after start time' })
      }
    }

    const numericRadius = Number(radiusMeters)
    if (!Number.isFinite(numericRadius) || numericRadius <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Radius must be greater than zero' })
      }
    }

    const normalizeCoordinate = (value) => {
      if (value === undefined || value === null) return null
      if (typeof value === 'string' && value.trim() === '') return null
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : NaN
    }

    const numericLat = normalizeCoordinate(locationLat)
    const numericLng = normalizeCoordinate(locationLng)

    if ((numericLat === null) !== (numericLng === null)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Both latitude and longitude are required when providing coordinates' })
      }
    }

    if ((numericLat !== null && Number.isNaN(numericLat)) || (numericLng !== null && Number.isNaN(numericLng))) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid latitude or longitude value' })
      }
    }

    const eventId = generateEventId()
    const secretCode = secretCodeEnabled ? generateSecretCode() : null

    const newEvent = {
      eventId,
      title,
      description,
      startTime: parsedStart,
      endTime: parsedEnd,
      location,
      locationLat: numericLat,
      locationLng: numericLng,
      radiusMeters: numericRadius,
      secretCode,
      secretCodeEnabled,
      qrModeEnabled,
      codeValidFrom: codeValidFrom ? new Date(codeValidFrom) : null,
      codeValidTill: codeValidTill ? new Date(codeValidTill) : null,
      createdBy: requesterEmail,
      createdAt: new Date(),
      type: 'Event'
    }

    await db.collection('events').insertOne(newEvent)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Event created successfully',
        eventId,
        secretCode
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
