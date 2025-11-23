import { useEffect, useState } from 'react'

export default function Debug() {
  const [data, setData] = useState({})

  useEffect(() => {
    setData({
      token: localStorage.getItem('bmsit_token') ? '✓ Token exists' : '✗ No token',
      role: localStorage.getItem('bmsit_role') || 'Not set',
      email: localStorage.getItem('bmsit_email') || 'Not set',
      permissions: localStorage.getItem('bmsit_permissions') || 'Not set'
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-dark text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Info</h1>
      <div className="glass p-6 space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="border-b border-white/10 pb-4">
            <p className="text-gray-400 text-sm">{key}:</p>
            <p className="text-lg font-mono">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
