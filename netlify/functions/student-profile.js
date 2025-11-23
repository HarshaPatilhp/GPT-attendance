import { getDB } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { email, name, usn, branch, year } = JSON.parse(event.body)
    const db = await getDB()

    await db.collection('students').updateOne(
      { email },
      {
        $set: {
          name,
          usn,
          branch,
          year,
          profileComplete: true,
          updatedAt: new Date()
        }
      }
    )

    await db.collection('attendance').updateMany(
      { studentEmail: email },
      {
        $set: {
          studentName: name,
          usn,
          email
        }
      }
    )

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Profile updated successfully' })
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' })
    }
  }
}
