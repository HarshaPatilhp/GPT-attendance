import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function EventDetails({ logout }) {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEventDetails()
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      console.log('Fetching event details for:', eventId)
      const response = await api.get('/event-details', { params: { eventId } })
      console.log('Event details response:', response.data)
      setEvent(response.data.event)
    } catch (err) {
      console.error('Error fetching event:', err)
      setError('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <h1 className="neon-text text-2xl font-bold">Event Details</h1>
        <div className="flex gap-4">
          <Link to="/student/dashboard">
            <button className="btn-secondary">Back</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-8 py-12 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : event ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass p-8">
              <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-neon-cyan mb-4">{event.eventId}</p>
              <p className="text-gray-300 mb-8">{event.description}</p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-gray-400 text-sm">📅 Start Time</p>
                  <p className="text-lg font-semibold">{new Date(event.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">⏱ End Time</p>
                  <p className="text-lg font-semibold">{new Date(event.endTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">📍 Location</p>
                  <p className="text-lg font-semibold">{event.location || 'TBA'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">🎯 Radius</p>
                  <p className="text-lg font-semibold">{event.radiusMeters}m</p>
                </div>
              </div>

              <div className="space-y-4">
                {event.secretCodeEnabled && (
                  <Link to="/student/mark-attendance" className="block">
                    <button className="w-full btn-primary">Mark Attendance with Secret Code</button>
                  </Link>
                )}
                {event.qrModeEnabled ? (
                  <Link to={`/student/attendance/qr?eventId=${event.eventId}`} className="block">
                    <button className="w-full btn-secondary">Scan QR Code</button>
                  </Link>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-200 p-4 rounded-lg text-sm">
                    QR mode is disabled for this event.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="glass p-12 text-center">
            <p className="text-gray-300">Event not found</p>
          </div>
        )}
      </div>
    </div>
  )
}
