import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function StudentDashboard({ logout }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const email = localStorage.getItem('bmsit_email')

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  const fetchUpcomingEvents = async () => {
    try {
      const response = await api.get('/events-upcoming')
      const payload = response.data
      const rawEvents = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.events)
          ? payload.events
          : []
      setEvents(rawEvents)
    } catch (err) {
      setError('Failed to load events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resolveEventId = (evt) => {
    if (!evt) return null
    if (typeof evt.eventId === 'string' && evt.eventId.trim()) return evt.eventId
    const rawId = evt._id || evt.id || evt.uuid
    if (!rawId) return null
    if (typeof rawId === 'string') return rawId
    if (typeof rawId === 'object') {
      return rawId.$oid || rawId.toString?.() || rawId.hexString || null
    }
    return String(rawId)
  }

  const parseDate = (value) => {
    if (!value) return null
    const dateObj = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(dateObj.getTime())) return null
    return dateObj
  }

  const getFirstValidDate = (...values) => {
    for (const value of values) {
      const parsed = parseDate(value)
      if (parsed) return parsed
    }
    return null
  }

  const isEventActive = (evt) => {
    const now = new Date()
    const start = getFirstValidDate(evt.codeValidFrom, evt.startTime, evt.startDateTime, evt.startDate, evt.start)
    const end = getFirstValidDate(evt.codeValidTill, evt.endTime, evt.endDateTime, evt.endDate, evt.end)

    if (start && end) {
      return start <= now && now <= end
    }
    if (start) {
      return now >= start
    }
    if (end) {
      return now <= end
    }
    return false
  }

  const formatDateTime = (value, localeOptions = {}) => {
    if (!value) return 'TBA'
    const dateObj = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(dateObj.getTime())) return 'TBA'
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', ...localeOptions })
  }

  const formatDate = (value) => {
    if (!value) return 'TBA'
    const dateObj = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(dateObj.getTime())) return 'TBA'
    return dateObj.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <h1 className="neon-text text-2xl font-bold">Welcome, {email}</h1>
        <div className="flex gap-4">
          <Link to="/student/history">
            <button className="btn-secondary">My Attendance</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold mb-2">Upcoming Events</h2>
          <p className="text-gray-400">Join events and mark your attendance</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">Loading events...</div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : events.filter(isEventActive).length === 0 ? (
          <div className="glass p-12 text-center">
            <p className="text-gray-300">No active events at the moment</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.filter(isEventActive).map((event, i) => (
              <motion.div
                key={resolveEventId(event) || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 hover:bg-white/20 cursor-pointer transition"
                onClick={() => {
                  const eventKey = resolveEventId(event)
                  if (eventKey) {
                    navigate(`/student/event/${eventKey}`)
                  } else {
                    console.warn('Unable to resolve event ID for navigation', event)
                  }
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{event.title || event.name || event.eventTitle || 'Untitled Event'}</h3>
                    <p className="text-neon-cyan text-sm">{event.eventId || resolveEventId(event)}</p>
                  </div>
                  <span className="bg-neon-purple/30 text-neon-purple px-3 py-1 rounded-full text-xs font-semibold">
                    {event.type || event.category || 'Event'}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-4">{event.description || event.details || 'No description provided.'}</p>

                <div className="space-y-2 text-sm text-gray-400 mb-6">
                  <p>📅 {formatDate(event.startTime || event.startDate || event.date)}</p>
                  <p>🕐 {formatDateTime(event.startTime || event.startDateTime || event.start)}</p>
                  <p>📍 {event.location || event.locationName || `${event.latitude?.toFixed?.(4) || ''} ${event.longitude?.toFixed?.(4) || ''}`.trim() || 'Location TBA'}</p>
                </div>

                <button className="w-full btn-primary text-sm">
                  View Event
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
