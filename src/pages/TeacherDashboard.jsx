import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function TeacherDashboard({ logout }) {
  const [view, setView] = useState('events') // events or create
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const email = localStorage.getItem('bmsit_email')
  const role = localStorage.getItem('bmsit_role')

  // Create event form state
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    locationLat: '',
    locationLng: '',
    radiusMeters: 200,
    secretCodeEnabled: true,
    qrModeEnabled: false,
    codeValidFrom: '',
    codeValidTill: ''
  })

  useEffect(() => {
    if (view === 'events') {
      fetchMyEvents()
    }
  }, [view])

  const fetchMyEvents = async () => {
    try {
      const response = await api.get('/my-events')
      setEvents(response.data.events || [])
    } catch (err) {
      setError('Failed to load events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Get current location if not provided
      let lat = formData.locationLat
      let lng = formData.locationLng

      if (!lat || !lng) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        lat = position.coords.latitude
        lng = position.coords.longitude
      }

      const payload = {
        ...formData,
        locationLat: lat,
        locationLng: lng,
        createdBy: email
      }
      
      console.log('Creating event with payload:', payload)
      const response = await api.post('/event-create', payload)
      console.log('Event creation response:', response.data)

      setSuccess('Event created successfully! Event ID: ' + response.data.eventId)
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        locationLat: '',
        locationLng: '',
        radiusMeters: 200,
        secretCodeEnabled: true,
        qrModeEnabled: false,
        codeValidFrom: '',
        codeValidTill: ''
      })

      // Refresh events list
      await fetchMyEvents()
      setView('events')
    } catch (err) {
      console.error('Event creation error:', err)
      setError(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const useCurrentLocation = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      setFormData({
        ...formData,
        locationLat: position.coords.latitude,
        locationLng: position.coords.longitude
      })
      setSuccess('Location set successfully')
    } catch (err) {
      setError('Failed to get location')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-400 text-sm">{email} ({role})</p>
        </div>
        <div className="flex gap-4">
          <Link to="/teacher/settings">
            <button className="btn-secondary">⚙️ Settings</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="px-8 py-6 flex gap-4 border-b border-white/10">
        <button
          onClick={() => setView('events')}
          className={`px-6 py-2 font-semibold transition ${
            view === 'events'
              ? 'bg-gradient-neon text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          My Events
        </button>
        <button
          onClick={() => setView('create')}
          className={`px-6 py-2 font-semibold transition ${
            view === 'create'
              ? 'bg-gradient-neon text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Create Event
        </button>
      </div>

      {/* Main Content */}
      <div className="px-8 py-12">
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

        {view === 'events' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-8">My Events</h2>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : events.length === 0 ? (
              <div className="glass p-12 text-center">
                <p className="text-gray-300 mb-4">No events created yet</p>
                <button onClick={() => setView('create')} className="btn-primary">
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{event.title}</h3>
                        <p className="text-neon-cyan">Event ID: {event.eventId}</p>
                        {event.secretCodeEnabled && (
                          <p className="text-neon-purple">Secret Code: {event.secretCode}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        {event.secretCodeEnabled && (
                          <button
                            onClick={() => navigate(`/teacher/events/${event.eventId}/qr`)}
                            className="btn-secondary text-sm"
                          >
                            Show QR
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/teacher/attendance/${event.eventId}`)}
                          className="btn-secondary text-sm"
                        >
                          View Attendance
                        </button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-300">
                      <p>📅 {new Date(event.startTime).toLocaleDateString()}</p>
                      <p>🕐 {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p>📍 {event.locationLat.toFixed(4)}, {event.locationLng.toFixed(4)}</p>
                      <p>🎯 {event.radiusMeters}m radius</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 max-w-2xl"
          >
            <h2 className="text-3xl font-bold mb-8">Create New Event</h2>

            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  rows="3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Location Name</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Seminar Hall A"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">GPS Location</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.locationLat}
                      onChange={(e) => setFormData({ ...formData, locationLat: parseFloat(e.target.value) })}
                      placeholder="Latitude"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.locationLng}
                      onChange={(e) => setFormData({ ...formData, locationLng: parseFloat(e.target.value) })}
                      placeholder="Longitude"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Use My Location
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Attendance Radius (meters)</label>
                <input
                  type="number"
                  value={formData.radiusMeters}
                  onChange={(e) => setFormData({ ...formData, radiusMeters: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  min="50"
                  max="1000"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.secretCodeEnabled}
                    onChange={(e) => setFormData({ ...formData, secretCodeEnabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Enable Secret Code</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.qrModeEnabled}
                    onChange={(e) => setFormData({ ...formData, qrModeEnabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Enable QR Code</span>
                </label>
              </div>

              {formData.secretCodeEnabled && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Code Valid From</label>
                    <input
                      type="datetime-local"
                      value={formData.codeValidFrom}
                      onChange={(e) => setFormData({ ...formData, codeValidFrom: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Code Valid Till</label>
                    <input
                      type="datetime-local"
                      value={formData.codeValidTill}
                      onChange={(e) => setFormData({ ...formData, codeValidTill: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
