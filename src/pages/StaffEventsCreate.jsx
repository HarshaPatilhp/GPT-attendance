import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function StaffEventsCreate({ logout }) {
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.')
      return
    }

    try {
      setError('')
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      handleChange('locationLat', position.coords.latitude)
      handleChange('locationLng', position.coords.longitude)
      setSuccess('Current location captured successfully')
    } catch (err) {
      console.error('Geolocation error:', err)
      setError('Failed to fetch location. Please allow GPS access and try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...formData,
        radiusMeters: Number(formData.radiusMeters) || 0,
        locationLat: formData.locationLat === '' ? null : formData.locationLat,
        locationLng: formData.locationLng === '' ? null : formData.locationLng,
        codeValidFrom: formData.codeValidFrom || null,
        codeValidTill: formData.codeValidTill || null
      }

      const response = await api.post('/event-create', payload)
      const { eventId, secretCode } = response.data
      setSuccess(`Event created successfully! Event ID: ${eventId}${secretCode ? ` · Secret Code: ${secretCode}` : ''}`)
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
    } catch (err) {
      console.error('Event create error:', err)
      setError(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">Create Events</h1>
        </div>
        <div className="flex gap-4">
          <Link to="/staff/dashboard">
            <button className="btn-secondary">Back to Dashboard</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-8 py-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8"
        >
          <h2 className="text-3xl font-bold mb-6">Create a new attendance event</h2>

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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                placeholder="Share brief event details for reference"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Start Time *</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">End Time *</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Latitude</label>
                <input
                  type="number"
                  value={formData.locationLat}
                  onChange={(e) => handleChange('locationLat', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  placeholder="12.9716"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Longitude</label>
                <input
                  type="number"
                  value={formData.locationLng}
                  onChange={(e) => handleChange('locationLng', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  placeholder="77.5946"
                  step="any"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={useCurrentLocation}
              className="btn-secondary"
            >
              Use Current Location
            </button>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Attendance Radius (meters) *</label>
                <input
                  type="number"
                  min="10"
                  value={formData.radiusMeters}
                  onChange={(e) => handleChange('radiusMeters', e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.secretCodeEnabled}
                    onChange={(e) => handleChange('secretCodeEnabled', e.target.checked)}
                  />
                  <span className="text-sm">Enable secret code</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.qrModeEnabled}
                    onChange={(e) => handleChange('qrModeEnabled', e.target.checked)}
                  />
                  <span className="text-sm">Enable QR mode</span>
                </label>
              </div>
            </div>

            {formData.secretCodeEnabled && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Code valid from</label>
                  <input
                    type="datetime-local"
                    value={formData.codeValidFrom}
                    onChange={(e) => handleChange('codeValidFrom', e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Code valid till</label>
                  <input
                    type="datetime-local"
                    value={formData.codeValidTill}
                    onChange={(e) => handleChange('codeValidTill', e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
