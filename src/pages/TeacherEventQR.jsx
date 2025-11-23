import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api/client'

export default function TeacherEventQR({ logout }) {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const qrRef = useRef(null)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/event-details?eventId=${eventId}`)
        const data = response.data.event || response.data
        if (!data) {
          setError('Event not found')
        } else {
          setEvent(data)
        }
      } catch (err) {
        console.error('Failed to fetch event details:', err)
        setError(err.response?.data?.message || 'Failed to load event details')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [eventId])

  const qrPayload = useMemo(() => {
    if (!event || !event.secretCodeEnabled || !event.secretCode) return ''
    return JSON.stringify({
      type: 'attendance',
      version: 1,
      eventId: event.eventId,
      secretCode: event.secretCode,
    })
  }, [event])

  const handleDownload = () => {
    if (!qrRef.current) return
    const svgElement = qrRef.current.querySelector('svg')
    if (!svgElement) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `event-${event.eventId}-attendance-qr.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center">
        <p className="text-lg">Loading event QR...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark text-white flex items-center justify-center">
        <div className="glass p-8 max-w-lg text-center">
          <p className="text-red-300 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <nav className="flex justify-between items-center px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div>
          <h1 className="neon-text text-2xl font-bold">Event QR Code</h1>
          <p className="text-sm text-gray-400">Share this QR to let students mark attendance quickly.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/teacher/dashboard">
            <button className="btn-secondary">Back to Dashboard</button>
          </Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </nav>

      <div className="px-8 py-12 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 max-w-xl w-full flex flex-col items-center gap-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
            <p className="text-neon-cyan font-mono">Event ID: {event.eventId}</p>
            {event.secretCodeEnabled ? (
              <p className="text-gray-400 mt-2">Secret Code: <span className="text-neon-purple font-semibold">{event.secretCode}</span></p>
            ) : (
              <p className="text-yellow-300 mt-2">Secret code is disabled for this event.</p>
            )}
          </div>

          {event.secretCodeEnabled && event.secretCode ? (
            <div ref={qrRef} className="bg-white p-4 rounded-2xl shadow-lg">
              <QRCodeSVG
                value={qrPayload}
                size={256}
                level="Q"
                includeMargin
                fgColor="#0f0c29"
              />
            </div>
          ) : (
            <div className="glass p-6 text-center text-gray-300">
              <p>Enable the secret code option for this event to generate a QR code.</p>
            </div>
          )}

          <div className="space-y-3 text-sm text-gray-300 text-left">
            <p>• Ask students to open the student portal &gt; "Scan QR" to mark attendance instantly.</p>
            <p>• The QR embeds the event’s secret code, so keep it visible only during the attendance window.</p>
            <p>• Ensure students still satisfy GPS/device requirements when scanning.</p>
          </div>

          {event.secretCodeEnabled && event.secretCode && (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button className="btn-primary flex-1" onClick={handleDownload}>
                Download QR (SVG)
              </button>
              <button className="btn-secondary flex-1" onClick={() => navigate(`/teacher/attendance/${event.eventId}`)}>
                View Attendance
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
