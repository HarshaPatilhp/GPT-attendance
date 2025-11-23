import axios from 'axios'

const testBackend = async () => {
  try {
    const response = await axios.post('http://localhost:9000/teacher-login', {
      email: 'teacher@bmsit.in',
      password: 'password'
    })
    console.log('✅ Backend response:', response.data)
  } catch (error) {
    console.error('❌ Backend error:', error.response?.data || error.message)
  }
}

testBackend()
