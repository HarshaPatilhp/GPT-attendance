  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')

      const [mine, all] = await Promise.allSettled([
        api.get('/my-events'),
        api.get('/all-events')
      ])

      let myEvents = []
      if (mine.status === 'fulfilled') {
        const data = mine.value.data
        if (Array.isArray(data?.events)) {
          myEvents = data.events
        } else if (Array.isArray(data)) {
          myEvents = data
        }
      }

      const allEvents = all.status === 'fulfilled'
        ? (Array.isArray(all.value.data?.events) ? all.value.data.events : (Array.isArray(all.value.data) ? all.value.data : []))
        : []

      const myEmail = (email || '').toLowerCase()
      const ownedEvents = allEvents.filter(evt => (evt.createdBy || '').toLowerCase() === myEmail)

      const eventMap = new Map()
      const registerEvent = (evt) => {
        if (!evt) return
        const key = evt.eventId || (typeof evt._id?.toString === 'function' ? evt._id.toString() : evt._id?.$oid) || evt._id
        if (!key || eventMap.has(key)) return
        eventMap.set(key, evt)
      }

      myEvents.forEach(registerEvent)
      ownedEvents.forEach(registerEvent)
      allEvents.forEach(registerEvent)

      setEvents(Array.from(eventMap.values()))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventData) => {
    const eventId = eventData?.eventId || ''
    const mongoId = typeof eventData?._id === 'object' && eventData?._id?.$oid
      ? eventData._id.$oid
      : eventData?._id || ''

    const title = eventData?.title || eventId || mongoId || 'this event'

    const confirmed = window.confirm(`Delete event "${title}"? This will remove all attendance records for it.`)
    if (!confirmed) return

    try {
      setLoading(true)
      await api.post('/event-delete', {
        ...(eventId ? { eventId } : {}),
        ...(mongoId ? { mongoId } : {})
      })
      setSuccess('Event deleted successfully')
      await fetchEvents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event')
    } finally {
      setLoading(false)
    }
  }

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

const AVAILABLE_PERMISSIONS = [
  { id: 'attendance:read', label: 'View Attendance Records', icon: '👁️' },
  { id: 'attendance:update', label: 'Mark/Update Attendance', icon: '✏️' },
  { id: 'attendance:export', label: 'Export Attendance Reports', icon: '📊' },
  { id: 'events:create', label: 'Create Events', icon: '➕' },
  { id: 'events:update', label: 'Edit Events', icon: '⚙️' },
  { id: 'events:read', label: 'View Events', icon: '👁️' },
  { id: 'staff:manage', label: 'Manage Staff', icon: '👥' }
]

export default function TeacherSettings({ logout }) {
  const [view, setView] = useState('staff') // 'staff', 'add', 'events'
  const [staffList, setStaffList] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'staff',
    permissions: []
  })

  const email = localStorage.getItem('bmsit_email')
  const role = (localStorage.getItem('bmsit_role') || '').toLowerCase()

  useEffect(() => {
    if (view === 'staff') {
      fetchStaffList()
    } else if (view === 'events') {
      fetchEvents()
    }
  }, [view])

  const fetchStaffList = async () => {
    try {
      setLoading(true)
      const response = await api.get('/staff-list')
      setStaffList(response.data.staff || [])
    } catch (err) {
      setError('Failed to load staff list')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStaff = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!formData.email || !formData.name) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const response = await api.post('/staff-add', {
        ...formData,
        addedBy: email
      })

      setSuccess('Staff member added successfully!')
      setFormData({
        email: '',
        name: '',
        role: 'staff',
        permissions: []
      })

      // Refresh staff list
      await fetchStaffList()
      setView('staff')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStaff = async (staffEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${staffEmail}?`)) return

    try {
      await api.post('/staff-remove', { email: staffEmail })
      setSuccess('Staff member removed successfully!')
      await fetchStaffList()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove staff')
    }
  }

  const handleUpdatePermissions = async (staffEmail, newPermissions) => {
    try {
      await api.post('/staff-update-permissions', {
        email: staffEmail,
        permissions: newPermissions
      })
      setSuccess('Permissions updated successfully!')
      await fetchStaffList()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update permissions')
    }
  }

  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const toggleStaffPermission = (staffEmail, permissionId, currentPermissions) => {
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId]
    handleUpdatePermissions(staffEmail, newPermissions)
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <h1 className="neon-text text-2xl font-bold">Settings</h1>
        <div className="flex gap-4">
          <Link to="/teacher/dashboard">
            <button className="btn-secondary">Back to Dashboard</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="flex gap-4 px-8 py-6 border-b border-white/10">
        <button
          onClick={() => setView('staff')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            view === 'staff'
              ? 'bg-neon-blue text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          👥 Staff Management
        </button>
        <button
          onClick={() => setView('add')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            view === 'add'
              ? 'bg-neon-blue text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          ➕ Add Staff
        </button>
        <button
          onClick={() => setView('events')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            view === 'events'
              ? 'bg-neon-blue text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          🗑️ Delete Events
        </button>
      </div>

      {/* Main Content */}
      <div className="px-8 py-12">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-6"
          >
            {success}
          </motion.div>
        )}

        {/* Staff List View */}
        {view === 'staff' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Staff Members</h2>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : staffList.length === 0 ? (
              <div className="glass p-8 text-center">
                <p className="text-gray-300 mb-4">No staff members added yet</p>
                <button
                  onClick={() => setView('add')}
                  className="btn-primary"
                >
                  Add Your First Staff Member
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {staffList.map((staff, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{staff.name}</h3>
                        <p className="text-neon-cyan text-sm">{staff.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStaff(staff.email)}
                        className="btn-danger text-sm"
                      >
                        Remove Access
                      </button>
                    </div>

                    <div className="border-t border-white/10 pt-4 mt-4">
                      <p className="text-sm font-semibold mb-3">Permissions:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AVAILABLE_PERMISSIONS.map(perm => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition"
                          >
                            <input
                              type="checkbox"
                              checked={staff.permissions?.includes(perm.id) || false}
                              onChange={() => toggleStaffPermission(staff.email, perm.id, staff.permissions || [])}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{perm.icon} {perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Staff View */}
        {view === 'add' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Add Staff Member</h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8"
            >
              <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Staff Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="staff@example.com"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Staff Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-4">
                    Assign Permissions:
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {AVAILABLE_PERMISSIONS.map(perm => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 cursor-pointer bg-white/5 hover:bg-white/10 p-4 rounded-lg transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-5 h-5"
                        />
                        <div>
                          <div className="font-semibold">{perm.icon} {perm.label}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Staff Member'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {view === 'events' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Delete Test Events</h2>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : events.length === 0 ? (
              <div className="glass p-8 text-center">
                <p className="text-gray-300 mb-4">No events found.</p>
                <p className="text-sm text-gray-400">Create events from your dashboard and they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((evt) => (
                  <motion.div
                    key={evt.eventId || evt._id?.$oid || evt._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{evt.title || 'Untitled Event'}</h3>
                        <p className="text-neon-cyan text-sm">Event ID: {evt.eventId}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(evt.startTime).toLocaleString()} → {new Date(evt.endTime).toLocaleString()}
                        </p>
                      </div>
                      <button
                        className="btn-danger text-sm"
                        onClick={() => handleDeleteEvent(evt)}
                      >
                        Delete Event
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
