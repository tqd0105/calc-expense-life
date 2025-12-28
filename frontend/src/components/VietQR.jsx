import { useState } from 'react'

// Danh sách ngân hàng phổ biến với mã BIN
const BANKS = [
  { code: 'VCB', bin: '970436', name: 'Vietcombank' },
  { code: 'TCB', bin: '970407', name: 'Techcombank' },
  { code: 'MB', bin: '970422', name: 'MB Bank' },
  { code: 'ACB', bin: '970416', name: 'ACB' },
  { code: 'VPB', bin: '970432', name: 'VPBank' },
  { code: 'TPB', bin: '970423', name: 'TPBank' },
  { code: 'STB', bin: '970403', name: 'Sacombank' },
  { code: 'BIDV', bin: '970418', name: 'BIDV' },
  { code: 'VIB', bin: '970441', name: 'VIB' },
  { code: 'SHB', bin: '970443', name: 'SHB' },
  { code: 'MSB', bin: '970426', name: 'MSB' },
  { code: 'OCB', bin: '970448', name: 'OCB' },
]

// Lưu cấu hình vào localStorage
const STORAGE_KEY = 'vietqr_config'

export default function VietQR({ amount, description = '' }) {
  const [showModal, setShowModal] = useState(false)
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {
      bankCode: 'MB',
      accountNo: '',
      accountName: ''
    }
  })
  const [showSetup, setShowSetup] = useState(false)

  const saveConfig = (newConfig) => {
    setConfig(newConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
  }

  const selectedBank = BANKS.find(b => b.code === config.bankCode)

  // Tạo URL QR VietQR
  const getQRUrl = () => {
    if (!config.accountNo || !selectedBank) return null
    
    const params = new URLSearchParams()
    params.set('amount', Math.round(amount))
    if (description) params.set('addInfo', description)
    if (config.accountName) params.set('accountName', config.accountName)
    
    return `https://img.vietqr.io/image/${selectedBank.bin}-${config.accountNo}-compact2.png?${params.toString()}`
  }

  const qrUrl = getQRUrl()

  return (
    <>
      {/* Button trigger */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
          <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM16 13a1 1 0 00-1 1v1h-1a1 1 0 100 2h2a1 1 0 001-1v-2a1 1 0 00-1-1z" />
        </svg>
        Mã QR chuyển khoản
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

              {/* Setup toggle */}
              {/* <button
                onClick={() => setShowSetup(!showSetup)}
                className="w-full text-sm text-blue-500 hover:text-blue-700 mb-4"
              >
                {showSetup ? '▲ Ẩn cấu hình' : '⚙️ Cấu hình tài khoản nhận'}
              </button> */}

              {/* Setup form */}
              {showSetup && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
                    <select
                      value={config.bankCode}
                      onChange={e => saveConfig({ ...config, bankCode: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {BANKS.map(bank => (
                        <option key={bank.code} value={bank.code}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản *</label>
                    <input
                      type="text"
                      value={config.accountNo}
                      onChange={e => saveConfig({ ...config, accountNo: e.target.value.replace(/\D/g, '') })}
                      placeholder="VD: 0779461536"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản</label>
                    <input
                      type="text"
                      value={config.accountName}
                      onChange={e => saveConfig({ ...config, accountName: e.target.value.toUpperCase() })}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* QR Code */}
              {qrUrl ? (
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
                    <p className="font-semibold text-blue-800">{selectedBank?.name}</p>
                    <p className="text-blue-700">STK: {config.accountNo}</p>
                    {config.accountName && (
                      <p className="text-blue-600">{config.accountName}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Quét mã bằng app ngân hàng để chuyển khoản tự động
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📱</p>
                  <p>Vui lòng cấu hình số tài khoản để tạo mã QR</p>
                  <button
                    onClick={() => setShowSetup(true)}
                    className="mt-3 text-blue-500 hover:text-blue-700 font-medium"
                  >
                    Cấu hình ngay →
                  </button>
                </div>
              )}
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
