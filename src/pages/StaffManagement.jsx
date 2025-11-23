import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function StaffManagement({ logout }) {
  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">Staff Management</h1>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 text-center"
        >
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-3xl font-bold mb-4">Manage Staff</h2>
          <p className="text-gray-400 mb-8">Manage staff members and their permissions.</p>
          
          <div className="bg-blue-500/20 border border-blue-500 text-blue-200 p-4 rounded-lg">
            <p>This feature will allow you to manage other staff members and assign permissions.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
