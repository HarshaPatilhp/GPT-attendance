import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import StudentLogin from './pages/StudentLogin'
import StudentDashboard from './pages/StudentDashboard'
import StudentAttendance from './pages/StudentAttendance'
import StudentHistory from './pages/StudentHistory'
import TeacherLogin from './pages/TeacherLogin'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherSettings from './pages/TeacherSettings'
import TeacherAttendance from './pages/TeacherAttendance'
import TeacherEventQR from './pages/TeacherEventQR'
import StaffLogin from './pages/StaffLogin'
import StaffDashboard from './pages/StaffDashboard'
import StaffAttendance from './pages/StaffAttendance'
import StaffAttendanceUpdate from './pages/StaffAttendanceUpdate'
import StaffReports from './pages/StaffReports'
import StaffEventsCreate from './pages/StaffEventsCreate'
import StaffEvents from './pages/StaffEvents'
import EventDetails from './pages/EventDetails'
import StudentQRScanner from './pages/StudentQRScanner'
import AppLayout from './components/AppLayout'

function App() {
  const [token, setToken] = useState(localStorage.getItem('bmsit_token') || '')
  const [role, setRole] = useState(localStorage.getItem('bmsit_role') || '')

  useEffect(() => {
    const savedToken = localStorage.getItem('bmsit_token')
    const savedRole = localStorage.getItem('bmsit_role')
    if (savedToken) setToken(savedToken)
    if (savedRole) setRole(savedRole)
  }, [])

  // Update function that updates both state AND localStorage
  const updateToken = (newToken) => {
    setToken(newToken)
    if (newToken) localStorage.setItem('bmsit_token', newToken)
  }

  const updateRole = (newRole) => {
    setRole(newRole)
    if (newRole) localStorage.setItem('bmsit_role', newRole)
  }

  const logout = () => {
    localStorage.removeItem('bmsit_token')
    localStorage.removeItem('bmsit_role')
    localStorage.removeItem('bmsit_email')
    localStorage.removeItem('bmsit_permissions')
    setToken(null)
    setRole(null)
  }

  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/student/login" element={<StudentLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/student/dashboard" element={token && role?.toLowerCase() === 'student' ? <StudentDashboard logout={logout} /> : <StudentLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/student/event/:eventId" element={token && role?.toLowerCase() === 'student' ? <EventDetails logout={logout} /> : <StudentLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/student/mark-attendance" element={token && role?.toLowerCase() === 'student' ? <StudentAttendance logout={logout} /> : <StudentLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/student/attendance/qr" element={token && role?.toLowerCase() === 'student' ? <StudentQRScanner logout={logout} /> : <StudentLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/student/history" element={token && role?.toLowerCase() === 'student' ? <StudentHistory logout={logout} /> : <StudentLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/teacher/login" element={<TeacherLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/teacher/dashboard" element={token && (role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <TeacherDashboard logout={logout} /> : <TeacherLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/teacher/settings" element={token && (role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <TeacherSettings logout={logout} /> : <TeacherLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/teacher/attendance/:eventId?" element={token && (role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <TeacherAttendance logout={logout} /> : <TeacherLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/teacher/events/:eventId/qr" element={token && (role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <TeacherEventQR logout={logout} /> : <TeacherLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/staff/login" element={<StaffLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/staff/dashboard" element={token && (role?.toLowerCase() === 'staff' || role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <StaffDashboard logout={logout} /> : <StaffLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/staff/attendance" element={token && (role?.toLowerCase() === 'staff' || role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <StaffAttendance logout={logout} /> : <StaffLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/staff/attendance-update" element={token && (role?.toLowerCase() === 'staff' || role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <StaffAttendanceUpdate logout={logout} /> : <StaffLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/staff/reports" element={token && (role?.toLowerCase() === 'staff' || role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <StaffReports logout={logout} /> : <StaffLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/staff/events-create" element={token && (role?.toLowerCase() === 'staff' || role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <StaffEventsCreate logout={logout} /> : <StaffLogin setToken={updateToken} setRole={updateRole} />} />
          <Route path="/staff/events" element={token && (role?.toLowerCase() === 'staff' || role?.toLowerCase() === 'teacher' || role?.toLowerCase() === 'admin') ? <StaffEvents logout={logout} /> : <StaffLogin setToken={updateToken} setRole={updateRole} />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
