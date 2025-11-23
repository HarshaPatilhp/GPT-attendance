import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
console.log('Connecting to MongoDB:', MONGODB_URI.replace(/:[^:]*@/, ':***@'))

const client = new MongoClient(MONGODB_URI)

async function test() {
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db('test')
    const users = db.collection('users')
    
    // Find teacher
    const teacher = await users.findOne({ email: 'teacher@gmail.com' })
    console.log('\n📋 Teacher document:')
    console.log(JSON.stringify(teacher, null, 2))
    
    // Check password
    if (teacher) {
      console.log('\n🔐 Password check:')
      console.log('Stored password:', teacher.password)
      console.log('Expected password:', 'asdfghjkl')
      console.log('Match:', teacher.password === 'asdfghjkl')
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await client.close()
  }
}

test()
