import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import jsQR from 'jsqr'
import api from '../api/client'

export default function StudentQRScanner({ logout }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const eventIdFromQuery = searchParams.get('eventId') || ''
  const [scanned, setScanned] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const email = localStorage.getItem('bmsit_email')

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS/Geolocation is not supported on your device'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (err) => {
          if (err.code === 1) {
            reject(new Error('GPS permission denied. Please enable location access.'))
          } else if (err.code === 2) {
            reject(new Error('GPS position unavailable. Try again later.'))
          } else if (err.code === 3) {
            reject(new Error('GPS request timed out. Try again with better signal.'))
          } else {
            reject(new Error('GPS error. Location access is required.'))
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    })
  }

  const markAttendance = useCallback(async (secretCode, eventId) => {
    if (!email) {
      setError('Student email not found. Please log in again.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const locationCoords = await getLocation()
      const deviceId = localStorage.getItem('bmsit_device_id') || `device-${Date.now()}`
      localStorage.setItem('bmsit_device_id', deviceId)

      const response = await api.post('/attendance-mark-code', {
        secretCode,
        studentEmail: email,
        deviceId,
        lat: locationCoords.lat,
        lng: locationCoords.lng
      })

      setSuccess('✅ Attendance marked via QR scan!')
      setScanned({ secretCode, eventId, timestamp: new Date(), response: response.data })
      stopStream()
    } catch (err) {
      console.error('QR attendance error:', err)
      const msg = err.response?.data?.message || err.message || 'Failed to mark attendance'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [email])

  const processFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code?.data) {
      try {
        const payload = JSON.parse(code.data)
        if (payload.type === 'attendance' && payload.secretCode) {
          const eventId = payload.eventId || eventIdFromQuery
          setScanned({ code: payload.secretCode, eventId })
          markAttendance(payload.secretCode, eventId)
          return
        }
      } catch (err) {
        console.warn('Invalid QR payload', err)
      }
    }

    animationRef.current = requestAnimationFrame(processFrame)
  }, [eventIdFromQuery, markAttendance])

  useEffect(() => {
    const startStream = async () => {
      try {
        setError('')
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          processFrame()
        }
      } catch (err) {
        console.error('Camera access error:', err)
        setError('Could not access camera. Please allow camera permissions and try again.')
      }
    }

    startStream()
    return () => {
      stopStream()
    }
  }, [processFrame])

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <h1 className="neon-text text-2xl font-bold">Scan Attendance QR</h1>
        <div className="flex gap-4">
          <Link to="/student/dashboard">
            <button className="btn-secondary">Back to Dashboard</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="px-6 py-10 flex flex-col xl:flex-row gap-10 items-start justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 flex flex-col gap-4 max-w-xl w-full"
        >
          <div className="relative aspect-video bg-black/60 rounded-2xl overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-4 border-neon-purple/40 rounded-2xl pointer-events-none" />
            <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-300">Align the QR code within the frame</div>
          </div>

          {loading && (
            <div className="bg-blue-500/10 border border-blue-400 text-blue-200 px-4 py-3 rounded-lg text-sm">
              Processing attendance...
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="text-sm text-gray-300 space-y-2">
            <p>• Hold the QR steady and ensure good lighting for a quick scan.</p>
            <p>• Your location and registered device will be verified automatically.</p>
            <p>• If scanning fails, ask your teacher for the secret code and use the manual option.</p>
          </div>

          <button className="btn-secondary" onClick={() => navigate('/student/mark-attendance')}>
            Enter Code Manually
          </button>
        </motion.div>

        {scanned && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">Last Detected QR</h2>
            <div className="space-y-2 text-sm text-gray-300">
              {scanned.eventId && <p>Event ID: <span className="text-neon-cyan font-mono">{scanned.eventId}</span></p>}
              <p>Secret Code: <span className="text-neon-purple font-mono">{scanned.code || scanned.secretCode}</span></p>
              <p>Scanned At: {new Date(scanned.timestamp || Date.now()).toLocaleString()}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
