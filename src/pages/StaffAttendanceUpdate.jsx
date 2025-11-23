import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import api from '../api/client'

export default function StaffAttendanceUpdate({ logout }) {
  const [searchParams] = useSearchParams()
  const eventId = searchParams.get('eventId')
  
  const [event, setEvent] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
      fetchAttendance()
    }
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/event-details?eventId=${eventId}`)
      console.log('Event details:', response.data)
      setEvent(response.data.event)
    } catch (err) {
      console.error('Error fetching event:', err)
      setError('Failed to load event details')
    }
  }

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/attendance-my?eventId=${eventId}`)
      console.log('Attendance response:', response.data)
      setStudents(response.data.attendance || [])
      setError('')
    } catch (err) {
      console.error('Error fetching attendance:', err)
      setError(err.response?.data?.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async (e) => {
    e.preventDefault()
    if (!studentEmail || !eventId) {
      setError('Student email and event are required')
      return
    }

    try {
      setMarking(true)
      setError('')
      setSuccess('')
      
      // Call staff attendance marking endpoint
      const response = await api.post('/attendance-mark-staff', {
        eventId,
        studentEmail: studentEmail
      })

      console.log('Attendance marked:', response.data)
      setSuccess(`Attendance marked successfully for ${studentEmail}`)
      setStudentEmail('')
      
      // Refresh attendance list
      fetchAttendance()
    } catch (err) {
      console.error('Error marking attendance:', err)
      setError(err.response?.data?.message || 'Failed to mark attendance')
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">Mark/Update Attendance</h1>
        </div>
        <div className="flex gap-4">
          <Link to="/staff/events">
            <button className="btn-secondary">Back to Events</button>
          </Link>
          <Link to="/staff/dashboard">
            <button className="btn-secondary">Dashboard</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-8 py-12">
        {event && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="glass p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">{event.name}</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                <p>📍 Location: {event.location}</p>
                <p>📍 Radius: {event.radius}m</p>
                <p>⏰ Start: {new Date(event.startTime).toLocaleString()}</p>
                <p>⏰ End: {new Date(event.endTime).toLocaleString()}</p>
                <p>🔐 Code: <span className="text-neon-cyan font-mono">{event.secretCode}</span></p>
              </div>
            </div>

            {/* Mark Attendance Form */}
            <div className="glass p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">✏️ Manually Mark Attendance</h3>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500 text-green-200 p-3 rounded-lg mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleMarkAttendance} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Student Email</label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={marking}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {marking ? 'Marking...' : 'Mark Attendance'}
                </button>
              </form>
            </div>

            {/* Current Attendance List */}
            <div className="glass p-6">
              <h3 className="text-xl font-bold mb-4">📋 Current Attendance ({students.length})</h3>
              
              {loading ? (
                <div className="text-center py-8">Loading attendance...</div>
              ) : students.length === 0 ? (
                <p className="text-gray-400">No students have marked attendance yet.</p>
              ) : (
                <div className="space-y-2">
                  {students.map((record, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{record.email}</p>
                        <p className="text-sm text-gray-400">Marked: {new Date(record.markedAt).toLocaleString()}</p>
                      </div>
                      <span className="text-green-400 font-semibold">✓ Present</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {!event && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 text-center"
          >
            <p className="text-gray-400">No event selected. Please select an event to mark attendance.</p>
            <Link to="/staff/events">
              <button className="btn-primary mt-4">Go to Events</button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
