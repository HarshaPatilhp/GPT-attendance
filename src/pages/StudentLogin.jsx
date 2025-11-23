import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

export default function StudentLogin({ setToken, setRole }) {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email') // email or profile
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Profile setup state
  const [name, setName] = useState('')
  const [usn, setUsn] = useState('')
  const [branch, setBranch] = useState('')
  const [year, setYear] = useState('')

  // dropdown visibility
  const [showBranch, setShowBranch] = useState(false)
  const [showYear, setShowYear] = useState(false)

  const branchRef = useRef(null)
  const yearRef = useRef(null)

  // --------------------------------
  // EMAIL AUTO-FORMATTING
  // --------------------------------
  const handleEmailChange = (e) => {
    const formatted = e.target.value.trim().toLowerCase().replace(/\s+/g, '')
    setEmail(formatted)
  }

  // --------------------------------
  // USN AUTO-UPPERCASE + AUTO-DETECT BRANCH/YEAR
  // --------------------------------
  const handleUsnChange = (e) => {
    const value = e.target.value.toUpperCase()
    setUsn(value)

    // Auto-detect Branch (characters 5–6 or 5–7 depending on format)
    // Example: 1BY23AI059 -> positions 5-6 = "AI"
    const branchCode = value.substring(5, 7)

    const branchMap = {
      AI: 'AI',
      CS: 'CSE',
      CE: 'CIVIL',
      EC: 'ECE',
      ME: 'ME',
      EE: 'EEE',
      IS: 'ISE',
      CV: 'CIVIL'
    }

    if (branchMap[branchCode]) {
      setBranch(branchMap[branchCode])
    }

    // Auto-detect Year (example: 1BY23AI059 -> "23" -> 2023)
    if (value.length >= 5) {
      const yearDigits = value.substring(3, 5)
      if (/^\d{2}$/.test(yearDigits)) {
        const admissionYear = parseInt('20' + yearDigits, 10) // "23" -> 2023
        const currentYear = new Date().getFullYear()
        const yearNum = currentYear - admissionYear + 1
        if (yearNum >= 1 && yearNum <= 4) {
          setYear(String(yearNum))
        }
      }
    }
  }

  // close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (branchRef.current && !branchRef.current.contains(e.target)) {
        setShowBranch(false)
      }
      if (yearRef.current && !yearRef.current.contains(e.target)) {
        setShowYear(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // --------------------------------
  // EMAIL SUBMISSION
  // --------------------------------
  const handleEmailSubmit = async (e) => {
    e.preventDefault()

    if (!email.endsWith('@bmsit.in')) {
      setError('Please use your BMSIT email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/student-login', { email })

      localStorage.setItem('bmsit_token', response.data.token)
      localStorage.setItem('bmsit_role', 'STUDENT')
      localStorage.setItem('bmsit_email', email)

      // Device ID
      let deviceId = localStorage.getItem('bmsit_device_id')
      if (!deviceId) {
        deviceId = crypto.randomUUID()
        localStorage.setItem('bmsit_device_id', deviceId)
      }

      if (response.data.profileComplete) {
        setToken(response.data.token)
        setRole('STUDENT')
        navigate('/student/dashboard')
      } else {
        setStep('profile')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------
  // PROFILE SUBMISSION
  // --------------------------------
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/student-profile', {
        email,
        name,
        usn: usn.toUpperCase(),
        branch,
        year
      })

      setToken(localStorage.getItem('bmsit_token'))
      setRole('STUDENT')
      navigate('/student/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed')
    } finally {
      setLoading(false)
    }
  }

  // options
  const BRANCH_OPTIONS = [
    { value: 'AI', label: 'AI & ML' },
    { value: 'CSE', label: 'CSE' },
    { value: 'ECE', label: 'ECE' },
    { value: 'ME', label: 'ME' },
    { value: 'EEE', label: 'EEE' },
    { value: 'ISE', label: 'ISE' },
    { value: 'CIVIL', label: 'Civil' },
    { value: 'MBA', label: 'MBA' },
    { value: 'MCA', label: 'MCA' }
  ]
  const YEAR_OPTIONS = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' }
  ]

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 w-full max-w-md"
      >
        <h1 className="neon-text text-3xl font-bold mb-8 text-center">Student Portal</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* EMAIL STEP */}
        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">BMSIT Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="example@bmsit.in"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-neon-blue lowercase"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
              {loading ? 'Logging in...' : 'Continue'}
            </button>
          </form>
        ) : (
          // PROFILE STEP
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-neon-blue"
                required
              />
            </div>

            {/* USN */}
            <div>
              <label className="block text-sm font-semibold mb-2">USN</label>
              <input
                type="text"
                value={usn}
                onChange={handleUsnChange}
                placeholder="1BY23AI059"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-neon-blue uppercase"
                required
              />
            </div>

            {/* BRANCH (custom dropdown) */}
            <div ref={branchRef} className="relative">
              <label className="block text-sm font-semibold mb-2">Branch</label>

              <div
                onClick={() => setShowBranch((s) => !s)}
                className="w-full px-4 py-2 bg-white/6 text-white border border-white/20 rounded-lg
                           backdrop-blur-sm cursor-pointer flex justify-between items-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setShowBranch((s) => !s)
                }}
              >
                <span className={branch ? 'text-white' : 'text-gray-300'}>
                  {branch ? BRANCH_OPTIONS.find((b) => b.value === branch)?.label || branch : 'Select Branch'}
                </span>
                <span className="text-gray-300">▾</span>
              </div>

              {showBranch && (
                <div className="absolute left-0 right-0 bg-black/100 text-white border border-white/20
                                backdrop-blur-xl rounded-lg mt-1 z-40 max-h-44 overflow-y-auto">
                  {BRANCH_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setBranch(opt.value)
                        setShowBranch(false)
                      }}
                      className="px-4 py-2 hover:bg-white/10 cursor-pointer"
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* YEAR (custom dropdown) */}
            <div ref={yearRef} className="relative">
  <label className="block text-sm font-semibold mb-2">Year</label>

  <div
    onClick={() => setShowYear((s) => !s)}
    className="w-full px-4 py-2 bg-white/6 text-white border border-white/20 rounded-lg
               backdrop-blur-sm cursor-pointer flex justify-between items-center"
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter') setShowYear((s) => !s)
    }}
  >
    <span className={year ? 'text-white' : 'text-gray-300'}>
      {year
        ? (YEAR_OPTIONS.find((y) => y.value === year)?.label ||
           `${year} ${year === '1' ? 'st' : year === '2' ? 'nd' : year === '3' ? 'rd' : 'th'} Year`)
        : 'Select Year'}
    </span>
    <span className="text-gray-300">▾</span>
  </div>

  {showYear && (
    <div
      className="absolute left-0 right-0 bottom-full mb-1 bg-black/100 text-white border border-white/20
                 backdrop-blur-xl rounded-lg z-40 max-h-44 overflow-y-auto"
    >
      {YEAR_OPTIONS.map((opt) => (
        <div
          key={opt.value}
          onClick={() => {
            setYear(opt.value)
            setShowYear(false)
          }}
          className="px-4 py-2 hover:bg-white/10 cursor-pointer"
        >
          {opt.label}
        </div>
      ))}
    </div>
  )}
</div>
            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
              {loading ? 'Setting up...' : 'Complete Profile'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
