import { getDB, generateToken } from './utils.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { email, password } = body
    console.log('Login attempt:', email)

    const db = await getDB()
    const teacher = await db.collection('users').findOne({ email })
    console.log('Teacher found:', !!teacher)

    if (!teacher || teacher.password !== password) {
      console.log('Auth failed - teacher:', !!teacher, 'password match:', teacher?.password === password)
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid credentials' })
      }
    }

    console.log('Generating token for:', email)
    const token = generateToken(email, teacher.role)
    console.log('Token generated, role:', teacher.role)

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        role: teacher.role
      })
    }
  } catch (err) {
    console.error('Teacher login error:', err.message)
    console.error(err.stack)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error: ' + err.message })
    }
  }
}
