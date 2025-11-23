import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import api from '../api/client'

export default function StaffEvents({ logout }) {
  const [events, setEvents] = useState([])
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

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">View Events</h1>
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
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 text-center"
          >
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-3xl font-bold mb-4">No Events Yet</h2>
            <p className="text-gray-400">There are no events created yet.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt, i) => {
              const eventId = evt.eventId || evt._id || i
              const coordinatesAvailable = evt.locationLat !== undefined && evt.locationLat !== null && evt.locationLng !== undefined && evt.locationLng !== null
              return (
                <motion.div
                  key={eventId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-6 rounded-lg"
                >
                  <h3 className="text-xl font-bold mb-2">{evt.title || evt.name || 'Untitled Event'}</h3>
                  <p className="text-gray-300 text-sm mb-4">{evt.description || 'No description provided.'}</p>

                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <p>📍 Location: {evt.location || 'TBA'}</p>
                    <p>📏 Radius: {evt.radiusMeters ?? evt.radius ?? 0}m</p>
                    {coordinatesAvailable && (
                      <p>🎯 Coordinates: {(Number(evt.locationLat ?? evt.latitude ?? 0)).toFixed(4)}, {(Number(evt.locationLng ?? evt.longitude ?? 0)).toFixed(4)}</p>
                    )}
                    {evt.secretCode && (
                      <p>🔐 Secret Code: <span className="text-neon-cyan font-mono">{evt.secretCode}</span></p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <p>⏰ Start: {evt.startTime ? new Date(evt.startTime).toLocaleString() : 'TBA'}</p>
                    <p>⏰ End: {evt.endTime ? new Date(evt.endTime).toLocaleString() : 'TBA'}</p>
                  </div>

                  <div className="bg-blue-500/20 border border-blue-500 text-blue-200 p-3 rounded-lg text-sm mb-4">
                    <p>Created by: {evt.createdBy}</p>
                  </div>

                  <Link to={`/staff/attendance-update?eventId=${evt.eventId || evt._id}`}>
                    <button className="w-full btn-primary text-sm">
                      Mark Attendance →
                    </button>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
