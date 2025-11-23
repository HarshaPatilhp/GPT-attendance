import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function StudentAttendance({ logout }) {
  const [secretCode, setSecretCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [attendance, setAttendance] = useState(null)
  const navigate = useNavigate()
  const email = localStorage.getItem('bmsit_email')

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS/Geolocation is not supported on your device'))
        return
      }

      // Request permission with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('GPS location obtained:', position.coords)
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (err) => {
          console.error('GPS error:', err)
          if (err.code === 1) {
            reject(new Error('❌ GPS Permission Denied! Please enable location access in your browser settings to mark attendance.'))
          } else if (err.code === 2) {
            reject(new Error('❌ GPS Position Unavailable! Please try again or check your location settings.'))
          } else if (err.code === 3) {
            reject(new Error('❌ GPS Request Timeout! Please try again with a stronger signal.'))
          } else {
            reject(new Error('❌ GPS Error! Location access is required to mark attendance.'))
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  const handleMarkAttendance = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!secretCode) {
      setError('Please enter a secret code')
      setLoading(false)
      return
    }

    if (!email) {
      setError('Student email not found. Please log in again.')
      setLoading(false)
      return
    }

    try {
      console.log('Requesting GPS location...')
      const location = await getLocation()
      console.log('Location received, marking attendance...')
      
      const deviceId = localStorage.getItem('bmsit_device_id') || 'device-' + Date.now()
      localStorage.setItem('bmsit_device_id', deviceId)

      // Prepare the request data
      const requestData = {
        secretCode: secretCode.trim(),
        studentEmail: email,
        deviceId,
        lat: location.lat,
        lng: location.lng
      }

      console.log('Sending attendance data:', { ...requestData, secretCode: '***' })
      
      const response = await api.post('/attendance-mark-code', requestData)
      console.log('Attendance response:', response.data)

      setAttendance(response.data.attendance)
      setSuccess('✅ Attendance marked successfully!')
      setSecretCode('')
    } catch (err) {
      console.error('Attendance error details:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error message:', err.message)

      const status = err.response?.status
      const serverMessage = err.response?.data?.message
      const fallbackMessage = status === 400 ? 'No proxy' : 'Failed to mark attendance'
      setError(serverMessage || fallbackMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <h1 className="neon-text text-2xl font-bold">Mark Attendance</h1>
        <div className="flex gap-4">
          <Link to="/student/dashboard">
            <button className="btn-secondary">Back to Dashboard</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6">Enter Secret Code</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          {attendance && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 mb-6 border-l-4 border-neon-cyan"
            >
              <h3 className="text-lg font-bold mb-3">Attendance Marked</h3>
              <div className="space-y-2 text-sm">
                <p>Event: <span className="text-neon-cyan">{attendance.eventId}</span></p>
                <p>Time: <span className="text-neon-cyan">{new Date(attendance.timestamp).toLocaleTimeString()}</span></p>
                <p>Method: <span className="text-neon-purple">Secret Code</span></p>
                <p>Location: <span className="text-neon-cyan">{attendance.lat.toFixed(4)}, {attendance.lng.toFixed(4)}</span></p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleMarkAttendance} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Secret Code</label>
              <input
                type="text"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
                placeholder="e.g., AI-4321"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue text-center text-lg tracking-widest"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Start Attendance'}
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-6">
            Your location and device ID will be verified
          </p>
        </motion.div>
      </div>
    </div>
  )
}
