import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function StaffLogin({ setToken, setRole }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Staff login attempt with email:', email)
      const response = await api.post('/staff-login', { email })
      console.log('Staff login response:', response.data)

      localStorage.setItem('bmsit_token', response.data.token)
      localStorage.setItem('bmsit_role', response.data.role)
      localStorage.setItem('bmsit_email', email)
      localStorage.setItem('bmsit_permissions', JSON.stringify(response.data.permissions || []))

      setToken(response.data.token)
      setRole(response.data.role)

      console.log('Redirecting to staff dashboard...')
      navigate('/staff/dashboard')
    } catch (err) {
      console.error('Staff login error:', err)
      const message = err.response?.data?.message || err.message || 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 w-full max-w-md"
      >
        <h1 className="neon-text text-3xl font-bold mb-8 text-center">Staff Portal</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@example.com"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
              required
            />
          </div>

          <div className="bg-blue-500/20 border border-blue-500 text-blue-200 p-3 rounded-lg text-sm">
            ℹ️ Staff login is email-only for security. Your teacher will add you and assign permissions.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Not a staff member? <a href="/" className="text-neon-cyan hover:underline">Go home</a>
        </p>
      </motion.div>
    </div>
  )
}
