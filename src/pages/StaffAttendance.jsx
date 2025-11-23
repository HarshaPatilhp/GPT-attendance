import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import api from '../api/client'

export default function StaffAttendance({ logout }) {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedEventMeta, setSelectedEventMeta] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/all-events')
      console.log('Events response:', response.data)
      setEvents(response.data.events || [])
      setError('')
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err.response?.data?.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEvent = async (event) => {
    const eventId = event.eventId || event._id || ''
    if (!eventId) return
    setSelectedEventId(eventId)
    setSelectedEventMeta(event)
    try {
      const response = await api.get(`/attendance-my?eventId=${eventId}`)
      console.log('Attendance response:', response.data)
      const payload = response.data
      const records = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.attendance)
          ? payload.attendance
          : []

      const normalized = records.map((record) => {
        const normalizedEmail = record.email || record.studentEmail || record.student_email || 'N/A'
        const normalizedName = record.name || record.studentName || record.student_name || normalizedEmail || 'Unknown Student'
        const normalizedUsn = record.usn || record.studentUsn || record.student_usn || 'N/A'

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
      setError('Failed to load attendance for this event')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">View Attendance Records</h1>
        </div>
        <div className="flex gap-4">
          <Link to="/staff/dashboard">
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
          <div className="text-center py-12">Loading events...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Events List */}
            <div className="md:col-span-1">
              <div className="glass p-6 sticky top-4">
                <h3 className="text-xl font-bold mb-4">📅 Events</h3>
                <div className="space-y-2">
                  {events.length === 0 ? (
                    <p className="text-gray-400">No events yet.</p>
                  ) : (
                    events.map((evt) => {
                      const eventId = evt.eventId || evt._id
                      return (
                      <button
                        key={eventId}
                        onClick={() => handleSelectEvent(evt)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          selectedEventId === eventId
                            ? 'bg-neon-blue/30 border border-neon-blue'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <p className="font-semibold text-sm">{evt.title || evt.name || 'Untitled Event'}</p>
                        <p className="text-xs text-gray-400">
                          {evt.startTime ? new Date(evt.startTime).toLocaleString() : 'TBA'}
                        </p>
                      </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Details */}
            <div className="md:col-span-2">
              {!selectedEventId ? (
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
                  <h3 className="text-xl font-bold mb-4">
                    📋 Attendance Records ({attendance.length})
                  </h3>

                  {selectedEventMeta && (
                    <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-400 mb-4">
                      <p>📌 Event ID: <span className="text-neon-cyan">{selectedEventMeta.eventId}</span></p>
                      <p>🎯 Radius: {selectedEventMeta.radiusMeters ?? selectedEventMeta.radius ?? 0}m</p>
                      <p>📍 Location: {selectedEventMeta.location || 'TBA'}</p>
                      {(selectedEventMeta.locationLat || selectedEventMeta.locationLng) && (
                        <p>
                          🌐 Coords: {Number(selectedEventMeta.locationLat || selectedEventMeta.latitude || 0).toFixed(4)}, {Number(selectedEventMeta.locationLng || selectedEventMeta.longitude || 0).toFixed(4)}
                        </p>
                      )}
                    </div>
                  )}

                  {attendance.length === 0 ? (
                    <p className="text-gray-400">No attendance records for this event.</p>
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

                  <button
                    className="w-full btn-primary mt-6"
                    onClick={() => {
                      const csvContent = [
                        'Name,USN,Email,Marked At,Device ID',
                        ...attendance.map((a) =>
                          `"${a.name || 'Unknown Student'}","${a.usn || 'N/A'}","${a.email || 'N/A'}","${a.markedAt ? new Date(a.markedAt).toLocaleString() : 'N/A'}","${a.deviceId || 'N/A'}"`
                        )
                      ].join('\n')

                      const blob = new Blob([csvContent], { type: 'text/csv' })
                      const url = URL.createObjectURL(blob)
                      const anchor = document.createElement('a')
                      anchor.href = url
                      anchor.download = `attendance-${selectedEventId}-${new Date().toISOString().split('T')[0]}.csv`
                      document.body.appendChild(anchor)
                      anchor.click()
                      document.body.removeChild(anchor)
                      URL.revokeObjectURL(url)
                    }}
                  >
                    📊 Export as CSV
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
