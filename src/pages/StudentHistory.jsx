import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function StudentHistory({ logout }) {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const email = localStorage.getItem('bmsit_email')

  useEffect(() => {
    fetchAttendanceHistory()
  }, [])

  const fetchAttendanceHistory = async () => {
    try {
      const response = await api.get('/attendance-my')
      const payload = response.data
      const records = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.attendance)
          ? payload.attendance
          : []
      setAttendance(records)
    } catch (err) {
      setError('Failed to load attendance history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <h1 className="neon-text text-2xl font-bold">My Attendance</h1>
        <div className="flex gap-4">
          <Link to="/student/dashboard">
            <button className="btn-secondary">Back to Dashboard</button>
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
          <h2 className="text-3xl font-bold mb-2">Attendance History</h2>
          <p className="text-gray-400">Your past marked attendance records</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : attendance.length === 0 ? (
          <div className="glass p-12 text-center">
            <p className="text-gray-300">You haven&apos;t attended any events yet. Once you mark your first attendance, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendance.map((record, i) => (
              <motion.div
                key={record._id || `${record.eventId}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-6 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold mb-2">{record.eventName || record.eventTitle || record.eventId || 'Event'}</h3>
                  {(() => {
                    const timeValue = record.timestamp || record.markedAt
                    const dateObj = timeValue ? new Date(timeValue) : null
                    return dateObj && !isNaN(dateObj)
                      ? (
                        <p className="text-gray-400 text-sm">
                          {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString()}
                        </p>
                      )
                      : (
                        <p className="text-gray-500 text-sm">Timestamp unavailable</p>
                      )
                  })()}
                  <p className="text-gray-400 text-sm">
                    📍 {typeof record.lat === 'number' ? record.lat.toFixed(4) : record.lat ?? 'N/A'}, {typeof record.lng === 'number' ? record.lng.toFixed(4) : record.lng ?? 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    record.method === 'CODE' 
                      ? 'bg-neon-blue/30 text-neon-blue'
                      : 'bg-neon-purple/30 text-neon-purple'
                  }`}>
                    {record.method === 'CODE' ? 'Secret Code' : 'QR Scan'}
                  </span>
                  <p className={`text-sm mt-2 ${(record.verified ?? true) ? 'text-green-400' : 'text-yellow-400'}`}>
                    {(record.verified ?? true) ? '✓ Verified' : '⏳ Pending'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
