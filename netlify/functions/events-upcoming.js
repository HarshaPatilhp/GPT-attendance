import { getDB } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const db = await getDB()

    const now = new Date()
    const pastBuffer = new Date(now.getTime() - 2 * 60 * 60 * 1000) // include events that ended in last 2 hours
    let upcomingEvents = await db.collection('events')
      .find({
        $or: [
          { endTime: { $gte: pastBuffer } },
          { startTime: { $gte: pastBuffer } },
          { codeValidTill: { $exists: true, $ne: null, $gte: pastBuffer } }
        ]
      })
      .sort({ startTime: 1 })
      .limit(40)
      .toArray()

    if (upcomingEvents.length === 0) {
      upcomingEvents = await db.collection('events')
        .find({})
        .sort({ startTime: -1 })
        .limit(10)
        .toArray()
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        events: upcomingEvents
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
