import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function StaffReports({ logout }) {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true)
        setError('')
        const response = await api.get('/all-events')
        const eventList = Array.isArray(response.data?.events) ? response.data.events : []
        setEvents(eventList)
        if (eventList.length > 0) {
          const firstEvent = eventList[0]
          setSelectedEventId(firstEvent.eventId || firstEvent._id || '')
          setSelectedEvent(firstEvent)
        }
      } catch (err) {
        console.error('Error fetching events for reports:', err)
        setError(err.response?.data?.message || 'Failed to load events')
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    if (!selectedEventId) {
      setAttendance([])
      return
    }

    const fetchAttendance = async () => {
      try {
        setLoadingAttendance(true)
        setError('')
        const response = await api.get(`/attendance-my?eventId=${selectedEventId}`)
        const records = Array.isArray(response.data?.attendance) ? response.data.attendance : []
        setAttendance(records)
      } catch (err) {
        console.error('Error loading attendance for reports:', err)
        setError(err.response?.data?.message || 'Failed to load attendance records')
        setAttendance([])
      } finally {
        setLoadingAttendance(false)
      }
    }

    fetchAttendance()
  }, [selectedEventId])

  const stats = useMemo(() => {
    if (!attendance.length) {
      return {
        total: 0,
        uniqueStudents: 0,
        uniqueDevices: 0,
        lastMarkedAt: null
      }
    }

    const uniqueStudents = new Set(attendance.map((a) => a.email || a.studentEmail)).size
    const uniqueDevices = new Set(attendance.map((a) => a.deviceId).filter(Boolean)).size
    const lastMarkedAt = attendance
      .map((a) => new Date(a.markedAt || a.timestamp || 0))
      .filter((d) => !Number.isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0] || null

    return {
      total: attendance.length,
      uniqueStudents,
      uniqueDevices,
      lastMarkedAt
    }
  }, [attendance])

  const handleSelectEvent = (event) => {
    const eventId = event.eventId || event._id || ''
    setSelectedEventId(eventId)
    setSelectedEvent(event)
  }

  const handleExportCSV = () => {
    if (!attendance.length || !selectedEventId) return
    try {
      setExporting(true)
      const csvHeader = ['Student Name', 'Email', 'USN', 'Marked At', 'Method', 'Device ID']
      const rows = attendance.map((record) => [
        record.name || record.studentName || 'Unknown Student',
        record.email || record.studentEmail || 'N/A',
        record.usn || 'N/A',
        record.markedAt ? new Date(record.markedAt).toLocaleString() : 'N/A',
        record.method || 'CODE',
        record.deviceId || 'N/A'
      ])

      const csvContent = [csvHeader, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      const timestamp = new Date().toISOString().split('T')[0]
      anchor.download = `attendance-report-${selectedEventId}-${timestamp}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">Export Reports</h1>
          {selectedEvent && (
            <p className="text-sm text-gray-400">{selectedEvent.title || selectedEvent.name}</p>
          )}
        </div>
        <div className="flex gap-4">
          <Link to="/staff/dashboard">
            <button className="btn-secondary">Back to Dashboard</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-8 py-12 space-y-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 h-full"
          >
            <h2 className="text-xl font-bold mb-4">Select Event</h2>

            {loadingEvents ? (
              <div className="text-sm text-gray-300">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-sm text-gray-400">No events available yet.</div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scroll">
                {events.map((event) => {
                  const eventId = event.eventId || event._id
                  const isActive = eventId === selectedEventId
                  return (
                    <button
                      key={eventId}
                      onClick={() => handleSelectEvent(event)}
                      className={`w-full text-left p-4 rounded-lg border transition ${
                        isActive ? 'border-neon-blue bg-neon-blue/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <p className="text-sm font-semibold">{event.title || event.name || 'Untitled Event'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {event.startTime ? new Date(event.startTime).toLocaleString() : 'Start time TBA'}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 lg:col-span-2"
          >
            {!selectedEventId ? (
              <div className="text-center text-gray-400 py-16">
                Select an event to view attendance data and export reports.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400">Total Marks</p>
                    <p className="text-2xl font-bold text-neon-cyan">{stats.total}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400">Unique Students</p>
                    <p className="text-2xl font-bold text-neon-cyan">{stats.uniqueStudents}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400">Unique Devices</p>
                    <p className="text-2xl font-bold text-neon-cyan">{stats.uniqueDevices}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400">Last Marked</p>
                    <p className="text-sm font-semibold text-neon-cyan">
                      {stats.lastMarkedAt ? stats.lastMarkedAt.toLocaleString() : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Attendance Records</h3>
                    <p className="text-xs text-gray-400">Preview of the most recent 25 entries</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={exporting || attendance.length === 0}
                    className="btn-primary disabled:opacity-50"
                  >
                    {exporting ? 'Preparing CSV...' : 'Download CSV'}
                  </button>
                </div>

                {loadingAttendance ? (
                  <div className="text-center text-gray-300 py-12">Loading attendance data...</div>
                ) : attendance.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    No attendance records found for this event.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scroll">
                    {attendance.slice(0, 25).map((record, index) => (
                      <div
                        key={`${record._id || record.email || index}`}
                        className="bg-white/5 border border-white/10 p-4 rounded-lg text-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{record.name || record.studentName || 'Unknown Student'}</p>
                            <p className="text-xs text-gray-400">{record.email || record.studentEmail}</p>
                          </div>
                          <span className="text-neon-cyan font-semibold">{record.method || 'CODE'}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 mt-3 text-xs text-gray-400">
                          <p>Marked: {record.markedAt ? new Date(record.markedAt).toLocaleString() : '—'}</p>
                          <p>Device: {record.deviceId || 'N/A'}</p>
                          <p>USN: {record.usn || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
