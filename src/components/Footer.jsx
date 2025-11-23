import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white/2 backdrop-blur-sm border-t border-white/5 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <p className="text-s text-gray-400 text-center">
            {currentYear} BMSIT Event Attendance System 
          </p>
        </div>
      </div>
    </footer>
  )
}
