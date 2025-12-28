import { useState } from 'react'

// Thông tin tài khoản cố định
const FIXED_CONFIG = {
  bankName: 'MSB',
  bankBin: '970426',
  accountNo: '6801112005',
  accountName: 'TRAN QUANG DUNG'
}

export default function VietQR({ amount, description = '' }) {
  const [showModal, setShowModal] = useState(false)

  // Tạo URL QR VietQR
  const getQRUrl = () => {
    const params = new URLSearchParams()
    params.set('amount', Math.round(amount))
    if (description) params.set('addInfo', description)
    params.set('accountName', FIXED_CONFIG.accountName)
    
    return `https://img.vietqr.io/image/${FIXED_CONFIG.bankBin}-${FIXED_CONFIG.accountNo}-compact2.png?${params.toString()}`
  }

  const qrUrl = getQRUrl()

  return (
    <>
      {/* Button trigger */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
          <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM16 13a1 1 0 00-1 1v1h-1a1 1 0 100 2h2a1 1 0 001-1v-2a1 1 0 00-1-1z" />
        </svg>
        <span className="hidden sm:inline">Mã QR chuyển khoản</span>
        <span className="sm:hidden">QR</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">💳 Chuyển khoản</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Amount display */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Số tiền cần chuyển</p>
                <p className="text-3xl font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                </p>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block">
                  <img 
                    src={qrUrl} 
                    alt="VietQR" 
                    className="w-64 h-64 mx-auto"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><text x="50%" y="50%" text-anchor="middle" fill="red">Lỗi tạo QR</text></svg>'
                    }}
                  />
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-semibold text-blue-800">{FIXED_CONFIG.bankName}</p>
                  <p className="text-blue-700">STK: {FIXED_CONFIG.accountNo}</p>
                  <p className="text-blue-600">{FIXED_CONFIG.accountName}</p>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Quét mã bằng app ngân hàng để chuyển khoản tự động
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
