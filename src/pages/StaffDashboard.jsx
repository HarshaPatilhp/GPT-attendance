import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function StaffDashboard({ logout }) {
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const email = localStorage.getItem('bmsit_email')
  const token = localStorage.getItem('bmsit_token')

  useEffect(() => {
    // Get permissions from localStorage
    const stored = localStorage.getItem('bmsit_permissions')
    if (stored) {
      try {
        const perms = JSON.parse(stored)
        console.log('Staff permissions from localStorage:', perms)
        setPermissions(perms || [])
      } catch (err) {
        console.error('Error parsing permissions:', err)
      }
    }
    setLoading(false)
  }, [])

  const hasPermission = (permissionId) => {
    return permissions.includes(permissionId)
  }

  const PERMISSION_MODULES = [
    {
      id: 'attendance:read',
      name: 'View Attendance Records',
      icon: '👁️',
      description: 'View attendance data and records',
      link: '/staff/attendance'
    },
    {
      id: 'attendance:update',
      name: 'Mark/Update Attendance',
      icon: '✏️',
      description: 'Mark and update attendance records',
      link: '/staff/attendance-update'
    },
    {
      id: 'attendance:export',
      name: 'Export Reports',
      icon: '📊',
      description: 'Export attendance reports',
      link: '/staff/reports'
    },
    {
      id: 'events:create',
      name: 'Create Events',
      icon: '➕',
      description: 'Create new events',
      link: '/staff/events-create'
    },
    {
      id: 'events:read',
      name: 'View Events',
      icon: '👁️',
      description: 'View all events',
      link: '/staff/events'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">Staff Portal</h1>
          <p className="text-gray-400 text-sm">{email}</p>
        </div>
        <button onClick={logout} className="btn-secondary">Logout</button>
      </nav>

      {/* Main Content */}
      <div className="px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Available Functions</h2>

        {loading ? (
          <div className="text-center py-12">Loading permissions...</div>
        ) : permissions.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-gray-300 mb-4">🔒 You don't have any permissions assigned yet.</p>
            <p className="text-gray-400 text-sm">Please ask your teacher to assign permissions to your account.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERMISSION_MODULES.map((module) => {
              const permitted = hasPermission(module.id)
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass p-6 rounded-lg transition ${
                    permitted
                      ? 'cursor-pointer hover:border-neon-cyan'
                      : 'opacity-50 cursor-not-allowed relative'
                  }`}
                >
                  {!permitted && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                      <span className="text-gray-300 font-semibold">🔒 Locked</span>
                    </div>
                  )}

                  <div className="text-4xl mb-3">{module.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{module.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{module.description}</p>

                  {permitted ? (
                    <Link to={module.link}>
                      <button className="w-full btn-primary text-sm">
                        Access →
                      </button>
                    </Link>
                  ) : (
                    <button disabled className="w-full bg-gray-600/30 text-gray-400 py-2 rounded-lg text-sm cursor-not-allowed">
                      Locked
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
