import { useState, useEffect } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

export default function IPGuard({ children }) {
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [error, setError] = useState(null)
  const [clientIP, setClientIP] = useState(null)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    setChecking(true)
    setError(null)

    try {
      const response = await fetch(`${BACKEND_URL}/api/check-access`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAllowed(true)
        setClientIP(data.clientIP)
      } else {
        const errorData = await response.json()
        setAllowed(false)
        setError(errorData.message || 'Access denied')
        setClientIP(errorData.clientIP)
      }
    } catch (err) {
      console.error('IP check error:', err)
      setAllowed(false)
      setError('Cannot connect to server. Please make sure you are connected to the room WiFi.')
    } finally {
      setChecking(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-neutral-900">Kiểm tra quyền truy cập...</h2>
        </div>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-3">Truy cập bị từ chối</h1>
            <p className="text-neutral-600 mb-6">
              {error || 'Ứng dụng này chỉ có thể truy cập từ WiFi phòng.'}
            </p>
            
            {clientIP && (
              <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="text-xs text-neutral-500 mb-1">IP của bạn:</p>
                <p className="text-sm font-mono font-medium text-neutral-900">{clientIP}</p>
              </div>
            )}

            <div className="text-left space-y-2.5 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-neutral-700 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Đảm bảo bạn đã kết nối WiFi phòng</span>
              </p>
              <p className="text-sm text-neutral-700 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Tắt dữ liệu di động / 4G / 5G</span>
              </p>
              <p className="text-sm text-neutral-700 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Liên hệ admin nếu vẫn bị chặn</span>
              </p>
            </div>

            <button
              onClick={checkAccess}
              className="w-full btn-primary"
            >
              Thử lại
            </button>

            <div className="mt-6 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <p className="text-xs text-neutral-600">
                <strong className="text-neutral-900">Admin:</strong> Thêm <code className="bg-neutral-200 px-1.5 py-0.5 rounded text-xs">{clientIP}</code> vào <code className="bg-neutral-200 px-1.5 py-0.5 rounded text-xs">.env</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access granted - render the app
  return children
}
