import { useState, useEffect } from 'react'

export default function Maintenance({ onDisable }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -right-16 w-32 h-32 bg-purple-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-16 left-1/3 w-24 h-24 bg-indigo-500 rounded-full opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-40 animate-ping"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full opacity-60 animate-ping delay-500"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-50 animate-ping delay-1500"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-2 sm:p-12 shadow-2xl border border-white/20">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg animate-bounce">
              <div className="text-4xl">🔧</div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-white mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Đang bảo trì hệ thống
          </h1>

          {/* Description */}
          <div className="text-center mb-8 space-y-4">
            <p className="text-xl text-blue-100 font-medium">
              Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn! 🚀
            </p>
            <p className="text-lg text-blue-200">
              Quá trình bảo trì sẽ hoàn tất trong thời gian sớm nhất.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl mb-3">⏰</div>
                <p className="text-sm text-blue-200 mb-2">Thời gian hiện tại</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {formatTime(currentTime)}
                </p>
                <p className="text-sm text-blue-300 mt-2">
                  {formatDate(currentTime)}
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl mb-3">📊</div>
                <p className="text-sm text-blue-200 mb-2">Trạng thái</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <p className="text-lg font-semibold text-yellow-300">
                    Đang bảo trì
                  </p>
                </div>
                <p className="text-sm text-blue-300 mt-2">
                  Hệ thống tạm ngưng hoạt động
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-200 font-medium">Tiến độ bảo trì</span>
              <span className="text-sm text-blue-200 font-medium">75%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center space-y-4 mb-8">
            <p className="text-blue-200">
              Cần hỗ trợ khẩn cấp? Liên hệ với chúng tôi:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="mailto:support@example.com" 
                className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-white hover:bg-white/30 transition-all border border-white/20"
              >
                <span>📧</span>
                <span className="font-medium">Email hỗ trợ</span>
              </a>
              <a 
                href="tel:+84123456789" 
                className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-white hover:bg-white/30 transition-all border border-white/20"
              >
                <span>📞</span>
                <span className="font-medium">Hotline</span>
              </a>
            </div>
          </div>

          {/* Fun fact */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-300/30 ">
            <div className="text-center">
              <div className="text-2xl mb-2">💡</div>
              <p className="text-purple-100 font-medium mb-2">Bạn có biết?</p>
              <p className="text-sm text-purple-200">
                Trong thời gian chờ đợi, bạn có thể uống một tách cà phê ☕ 
                hoặc thư giãn một chút. Chúng tôi sẽ quay lại sớm thôi!
              </p>
            </div>
          </div>

          {/* Developer note - invisible to users */}
          <div className="text-center">
            <div className="opacity-0 select-none pointer-events-none text-xs">
              Developer: Use console to disable maintenance mode
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-300 text-sm">
            © 2025 KMS Technology - Expense Tracker 
          </p>
          <p className="text-blue-400 text-xs mt-2">
            Cảm ơn bạn đã kiên nhẫn chờ đợi! 💙
          </p>
        </div>
      </div>
    </div>
  )
}