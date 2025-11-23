import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import api from '../api/client'

export default function TeacherAttendance({ logout }) {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get eventId from URL if provided
  const { eventId: urlEventId } = useParams()

  useEffect(() => {
    fetchEvents()
    // If there's an eventId in the URL, select it
    if (urlEventId) {
      setSelectedEvent(urlEventId)
      fetchAttendance(urlEventId)
    }
  }, [urlEventId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/my-events')
      console.log('Teacher Events response:', response.data)
      // Check if the response has a data property with events
      if (response.data && Array.isArray(response.data)) {
        setEvents(response.data)
      } else if (response.data && response.data.events) {
        setEvents(response.data.events)
      } else {
        setEvents([])
        console.warn('Unexpected response format from /my-events:', response.data)
      }
      setError('')
    } catch (err) {
      console.error('Error fetching teacher events:', err)
      setError(err.response?.data?.message || 'Failed to load your events')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendance = async (eventId) => {
    try {
      setLoading(true)
      setError('')
      
      // First, get the event details to verify it exists
      const eventResponse = await api.get(`/event-details?eventId=${eventId}`)
      const event = eventResponse.data.event || eventResponse.data
      
      if (!event) {
        throw new Error('Event not found')
      }
      
      // Then get the attendance for this event
      const response = await api.get(`/attendance-my?eventId=${eventId}`)
      console.log('Attendance response:', response.data)
      
      // Handle different possible response formats
      let attendanceData = []
      if (Array.isArray(response.data)) {
        attendanceData = response.data
      } else if (response.data && Array.isArray(response.data.attendance)) {
        attendanceData = response.data.attendance
      } else if (response.data) {
        // If we have data but not in expected format, log it for debugging
        console.warn('Unexpected attendance data format:', response.data)
      }
      
      const normalized = attendanceData.map((record) => {
        const normalizedEmail = record.email || record.studentEmail || record.student_email || 'N/A'
        const normalizedName = record.name || record.studentName || record.student_name || normalizedEmail || 'Unknown Student'
        const normalizedUsn = record.usn || record.studentUSN || record.student_USN || 'N/A'

        return {
          ...record,
          email: normalizedEmail,
          name: normalizedName,
          usn: normalizedUsn
        }
      })

      setAttendance(normalized)
    } catch (err) {
      console.error('Error fetching attendance:', err)
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to load attendance for this event'
      setError(errorMessage)
      setAttendance([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEvent = (eventId) => {
    setSelectedEvent(eventId)
    fetchAttendance(eventId)
    // Update URL without page reload
    window.history.pushState({}, '', `/teacher/attendance/${eventId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">Teacher Attendance Records</h1>
          <p className="text-sm text-gray-400">View and manage attendance for your events</p>
        </div>
        <div className="flex gap-4">
          <Link to="/teacher/dashboard">
            <button className="btn-secondary">Back to Dashboard</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-8 py-12">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading your events...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Events List */}
            <div className="md:col-span-1">
              <div className="glass p-6 sticky top-4">
                <h3 className="text-xl font-bold mb-4">📅 Your Events</h3>
                <div className="space-y-2">
                  {events.length === 0 ? (
                    <p className="text-gray-400">You haven't created any events yet.</p>
                  ) : (
                    events.map((evt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectEvent(evt.eventId)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          selectedEvent === evt.eventId
                            ? 'bg-neon-blue/30 border border-neon-blue'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <p className="font-semibold text-sm">{evt.title || evt.name || evt.eventTitle || 'Untitled Event'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(evt.startTime).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Details */}
            <div className="md:col-span-2">
              {!selectedEvent ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-8 text-center"
                >
                  <p className="text-gray-400">Select an event to view attendance records.</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">📋 Attendance Records ({attendance.length} students)</h3>
                    {selectedEvent && (
                      <button 
                        onClick={() => {
                          // Create CSV content
                          const csvContent = [
                            'Name,USN,Email,Marked At,Device ID',
                            ...attendance.map(a => 
                              `"${a.name || 'Unknown Student'}","${a.usn || 'N/A'}","${a.email || 'N/A'}","${a.markedAt ? new Date(a.markedAt).toLocaleString() : 'N/A'}","${a.deviceId || 'N/A'}"`
                            )
                          ].join('\n')
                          
                          // Create download link
                          const blob = new Blob([csvContent], { type: 'text/csv' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `attendance-${selectedEvent}-${new Date().toISOString().split('T')[0]}.csv`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }}
                        className="btn-secondary text-sm"
                      >
                        📥 Export as CSV
                      </button>
                    )}
                  </div>

                  {attendance.length === 0 ? (
                    <p className="text-gray-400">No attendance records found for this event.</p>
                  ) : (
                    <div className="space-y-3">
                      {attendance.map((record, i) => (
                        <div
                          key={i}
                          className="bg-white/5 border border-white/10 p-4 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{record.name || 'Unknown Student'}</p>
                              <p className="text-xs text-gray-400">USN: {record.usn || 'N/A'}</p>
                              <p className="text-sm text-gray-400 mt-1">Email: {record.email || 'N/A'}</p>
                              <p className="text-sm text-gray-400">
                                Marked at: {record.markedAt ? new Date(record.markedAt).toLocaleString() : 'N/A'}
                              </p>
                              {record.deviceId && (
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                  Device: {record.deviceId.substring(0, 8)}...
                                </p>
                              )}
                            </div>
                            <span className="text-green-400 font-semibold">✓ Present</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
