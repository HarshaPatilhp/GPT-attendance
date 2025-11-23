import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 }
    }
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* background */}
      <div className="fixed inset-0 -z-10 bg-gradient-dark bg-fixed" aria-hidden="true" />

      {/* Navigation (compact) */}
      <nav className="flex items-center justify-between px-6 py-3 mb-20 bg-white/5 backdrop-blur-md border-b border-white/8">
        <motion.h1 className="neon-text text-2xl font-semibold">BMSIT ATTENDANCE</motion.h1>

        <div className="flex gap-3">
          <Link to="/student/login">
            <button
              className="px-3 py-1.5 rounded-md font-medium text-white
                bg-gradient-to-r from-purple-500 to-green-400 shadow-sm
                hover:scale-105 transform transition duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
              aria-label="Student Login"
            >
              Student Login
            </button>
          </Link>

          <Link to="/staff/login">
            <button
              className="px-3 py-1.5 rounded-md font-medium text-white
                bg-gradient-to-r from-green-500 to-pink-500 shadow-sm
                hover:scale-105 transform transition duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300"
              aria-label="Staff Login"
            >
              Staff Login
            </button>
          </Link>

          <Link to="/teacher/login">
            <button
              className="px-3 py-1.5 rounded-md font-medium text-white
                bg-gradient-to-r from-pink-500 to-violet-600 shadow-sm
                hover:scale-105 transform transition duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300"
              aria-label="Teacher Login"
            >
              Teacher Login
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto px-4"
        >
          <motion.h1 {...fadeIn} className="text-5xl md:text-6xl font-bold mb-19 leading-tight">
  <span className="neon-text block">Smart Attendance</span>
  <span className="block">That Knows It's Really You</span>
</motion.h1>


          <motion.p {...fadeIn} transition={{ delay: 0.05 }} className="text-lg text-gray-300 mb-10 mt-10">
            Secure, location-locked and device-bound event attendance system built for students, faculty, and coordinators.
          </motion.p>

          {/* How It Works (cards) */}
          <motion.div
  variants={containerVariants}
  className="grid md:grid-cols-3 gap-8 mb-12 group"
>
  {[
    { num: '1', title: 'Login with BMSIT Email', desc: 'Quick, secure, no password needed' },
    { num: '2', title: 'Join Event', desc: 'Use secret code or scan QR' },
    { num: '3', title: 'Verified Instantly', desc: 'GPS + Device ID validated' }
  ].map((step, i) => (
    <motion.div
      key={i}
      variants={fadeIn}
      className="
        rounded-2xl border border-white/6 bg-white/3 p-6 glass shadow-sm 
        transition duration-300
        group-hover:blur-sm group-hover:brightness-75 
        hover:!blur-0 hover:!brightness-100
      "
    >
      <div className="text-3xl neon-text font-bold mb-3">{step.num}</div>
      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
      <p className="text-gray-300 text-sm">{step.desc}</p>
    </motion.div>
  ))}
</motion.div>


          {/* Benefits */}
          <motion.div {...fadeIn} transition={{ delay: 0.6 }} className="mb-10">
            <h2 className="text-3xl font-bold mb-6">Why Choose BMSIT Attendance?</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {['Accurate Headcount', 'No Proxy', 'Less Paperwork', 'Better Analytics'].map((benefit, i) => (
                <div key={i} className="rounded-2xl border border-white/6 bg-white/3 p-4 glass text-center">
                  <p className="text-neon-cyan font-semibold text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA (compact, responsive) */}
          <motion.div className="mt-12 mb-24">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/student/login">
                <button
                  className="px-5 py-2.5 rounded-xl font-medium text-white
                    bg-gradient-to-r from-purple-500 to-green-400 shadow-md
                    hover:scale-105 transform transition duration-200
                    hover:shadow-[0_12px_40px_rgba(124,58,237,0.18)]
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
                  aria-label="Login as Student"
                >
                  Login as Student
                </button>
              </Link>

              <Link to="/staff/login">
                <button
                  className="px-5 py-2.5 rounded-xl font-medium text-white
                    bg-gradient-to-r from-green-500 to-pink-500 shadow-md
                    hover:scale-105 transform transition duration-200
                    hover:shadow-[0_12px_40px_rgba(249,115,22,0.18)]
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300"
                  aria-label="Login as Staff"
                >
                  Login as Staff
                </button>
              </Link>

              <Link to="/teacher/login">
                <button
                  className="px-5 py-2.5 rounded-xl font-medium text-white
                    bg-gradient-to-r from-pink-500 to-violet-600 shadow-md
                    hover:scale-105 transform transition duration-200
                    hover:shadow-[0_12px_40px_rgba(236,72,153,0.18)]
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300"
                  aria-label="Login as Teacher"
                >
                  Login as Teacher
                </button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
