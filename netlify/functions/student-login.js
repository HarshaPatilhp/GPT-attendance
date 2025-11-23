  import { getDB, generateToken } from './utils.js'

  export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
    }

    try {
      const { email } = JSON.parse(event.body)

      // Validate BMSIT email
      if (!email.endsWith('@bmsit.in')) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Please use your BMSIT email address' })
        }
      }

      const db = await getDB()

      // Check if student exists
      let student = await db.collection('students').findOne({ email })

      if (!student) {
        // Create new student
        student = {
          email,
          name: '',
          usn: '',
          branch: '',
          year: '',
          deviceId: null,
          createdAt: new Date(),
          profileComplete: false
        }
        await db.collection('students').insertOne(student)
      }

      const token = generateToken(email, 'student')

      return {
        statusCode: 200,
        body: JSON.stringify({
          token,
          role: 'student',
          profileComplete: student.profileComplete || false
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
