import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth({ onAuthSuccess }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      onAuthSuccess && onAuthSuccess()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-t from-black via-gray-400 to-black relative">
      {/* Decorative circles */}
      {/* <div className="absolute top-0 left-0 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div> */}
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-sm">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-40 h-40 bg-white rounded-full p-3 shadow-2xl mb-4 animate-bounce">
              <span className="text-3xl"><img src="/assets/icons/ehomes.png" alt="Logo" /></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
              Quản lý chi tiêu
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Đăng nhập để tiếp tục
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl">
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-white transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 border-2 border-red-300 rounded-xl text-red-600 text-sm font-medium">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  '🚀 Đăng nhập'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer - Compact */}
      <footer className="py-4 text-center relative z-10">
        <p className="text-white/80 text-xs">
          Powered by{' '}
          <a 
            href="https://kms-technology.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white font-bold hover:underline"
          >
            LCV Technology
          </a>
          {' '}© 2025
        </p>
      </footer>
    </div>
  )
}
