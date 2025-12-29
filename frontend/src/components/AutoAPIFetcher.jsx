import { useState, useEffect } from 'react'
import { fetchBachHoaXanhAPI, fetchKingFoodMartAPI } from '../utils/apiCaller'
import { saveCredentialsToSupabase, loadCredentialsFromSupabase, clearCredentialsFromSupabase, migrateLocalCredentials } from '../utils/credentialsService'

// Mật khẩu để mở cấu hình (có thể thay đổi)
const CONFIG_PASSWORD = import.meta.env.VITE_CONFIG_PASSWORD || '123456'

export default function AutoAPIFetcher({ onInvoiceParsed }) {
  const [store, setStore] = useState('bachhoaxanh') // 'bachhoaxanh' | 'kingfoodmart'
  const [orderCode, setOrderCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCredentials, setLoadingCredentials] = useState(true)
  const [error, setError] = useState('')
  const [showSetup, setShowSetup] = useState(false)

  // Password protection states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)

  // Credentials for Bách Hóa Xanh
  const [bhxCredentials, setBhxCredentials] = useState({
    accessToken: '',
    authorization: '',
    customerId: '',
    deviceId: '',
    deviceToken: '',
    username: ''
  })

  // Credentials for KingFoodMart
  const [kfmCredentials, setKfmCredentials] = useState({
    cookie: ''
  })

  // Migrate localStorage credentials khi component mount
  useEffect(() => {
    migrateLocalCredentials()
  }, [])

  // Load credentials từ Supabase khi mount hoặc khi đổi store
  useEffect(() => {
    const loadCreds = async () => {
      setLoadingCredentials(true)
      try {
        const saved = await loadCredentialsFromSupabase(store)
        if (saved) {
          if (store === 'bachhoaxanh') {
            setBhxCredentials(saved)
          } else {
            setKfmCredentials(saved)
          }
          setShowSetup(false)
        } else {
          setShowSetup(true)
        }
      } catch (err) {
        console.error('Error loading credentials:', err)
        setShowSetup(true)
      } finally {
        setLoadingCredentials(false)
      }
    }
    loadCreds()
  }, [store])

  const getCurrentCredentials = () => {
    return store === 'bachhoaxanh' ? bhxCredentials : kfmCredentials
  }

  const handleSaveCredentials = async () => {
    const currentCreds = getCurrentCredentials()

    if (store === 'bachhoaxanh') {
      if (!currentCreds.accessToken || !currentCreds.authorization || !currentCreds.username) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc!')
        return
      }
    } else if (store === 'kingfoodmart') {
      if (!currentCreds.cookie) {
        setError('Vui lòng điền Cookie!')
        return
      }
    }

    try {
      await saveCredentialsToSupabase(store, currentCreds)
      setShowSetup(false)
      setError('')
      alert('✅ Đã lưu credentials!')
    } catch (err) {
      setError('Lỗi lưu credentials: ' + err.message)
    }
  }

  const handleFetch = async () => {
    if (!orderCode.trim()) {
      setError('Vui lòng nhập mã đơn hàng!')
      return
    }

    setLoading(true)
    setError('')

    try {
      let data

      if (store === 'bachhoaxanh') {
        data = await fetchBachHoaXanhAPI(orderCode, bhxCredentials)
      } else {
        // KFM: chỉ truyền credentials nếu có cookie
        const creds = kfmCredentials.cookie ? kfmCredentials : {}
        data = await fetchKingFoodMartAPI(orderCode, creds)
      }

      console.log('API Response:', data)

      // Check for GraphQL errors
      if (data.errors && data.errors.length > 0) {
        console.error('GraphQL Errors:', data.errors)
        throw new Error(`GraphQL Error: ${data.errors[0].message}`)
      }

      if (data && (data.data || data.ecomOrderDetail2)) {
        // Thông báo thành công
        const successMsg = store === 'kingfoodmart' 
          ? '✅ Lấy hóa đơn KingFoodMart thành công!' 
          : '✅ Lấy hóa đơn Bách Hóa Xanh thành công!';
        
        // Tạo notification nhẹ nhàng
        if (window.confirm) {
          // Sử dụng timeout để không block UI
          setTimeout(() => {
            const notification = document.createElement('div');
            notification.innerHTML = successMsg;
            notification.className = 'fixed top-10 left-1/2 transform -translate-x-1/2 w-full  bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-medium z-50 transition-all duration-300';
            document.body.appendChild(notification);
            
            // Tự động ẩn sau 3 giây
            setTimeout(() => {
              notification.style.opacity = '0';
              notification.style.transform = 'translateY(-20px)';
              setTimeout(() => notification.remove(), 300);
            }, 3000);
          }, 100);
        }
        
        onInvoiceParsed(JSON.stringify(data))
        setOrderCode('')
      } else {
        throw new Error('Không tìm thấy dữ liệu hóa đơn')
      }
    } catch (err) {
      setError('Lỗi: ' + err.message)
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Xử lý bấm nút cấu hình
  const handleConfigClick = () => {
    if (showSetup) {
      // Đang mở -> đóng lại
      setShowSetup(false)
    } else {
      // Đang đóng -> kiểm tra đã unlock chưa
      if (isUnlocked) {
        setShowSetup(true)
      } else {
        setShowPasswordModal(true)
        setPasswordInput('')
        setPasswordError('')
      }
    }
  }

  // Xác thực mật khẩu
  const handlePasswordSubmit = () => {
    if (passwordInput === CONFIG_PASSWORD) {
      setIsUnlocked(true)
      setShowPasswordModal(false)
      setShowSetup(true)
      setPasswordError('')
    } else {
      setPasswordError('Sai mật khẩu!')
    }
  }

  if (loadingCredentials) {
    return (
      <div className="card mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải cấu hình...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-6">
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🔐 Nhập mật khẩu cấu hình</h3>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Mã chứa: chữ + số"
              className="input-field w-full mb-3"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-3">⚠️ {passwordError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handlePasswordSubmit}
                className="btn-primary flex-1"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex-1"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img src="assets/icons/automation.png" className="inline-block w-8 h-8 mr-2" alt="Auto API" />
        <h2 className="text-2xl font-bold text-gray-800">Lấy đơn hàng tự động</h2>
        </div>
        <button
          onClick={handleConfigClick}
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          {showSetup ? '🔼 Ẩn' : (isUnlocked ? '⚙️ ' : '🔒 ')}
        </button>
      </div>

      {/* Store Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn cửa hàng</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setStore('bachhoaxanh')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${store === 'bachhoaxanh'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            <img src="assets/icons/bhx.png" alt="Bách Hóa Xanh" className="inline-block rounded-full shadow-lg w-8 h-8 mr-2" />

            BachHoaXanh
          </button>
          <button
            onClick={() => setStore('kingfoodmart')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${store === 'kingfoodmart'
                ? 'bg-orange-400 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            <img src="assets/icons/kfm.png" alt="KingFoodMart" className="inline-block rounded-full shadow-lg w-8 h-8 mr-2" />

            KingFoodMart
          </button>
        </div>
      </div>

      {showSetup && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-bold text-gray-800 mb-3">
            ⚙️ {store === 'bachhoaxanh' ? 'Bách Hóa Xanh' : 'KingFoodMart'}
          </h3>

          {store === 'bachhoaxanh' ? (
            // BHX Credentials Form
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Access Token <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bhxCredentials.accessToken}
                  onChange={(e) => setBhxCredentials({ ...bhxCredentials, accessToken: e.target.value })}
                  placeholder="ea93868d-b01e-450d-8b95..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Authorization Token <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bhxCredentials.authorization}
                  onChange={(e) => setBhxCredentials({ ...bhxCredentials, authorization: e.target.value })}
                  placeholder="8B3450D8E1B44CF482EE..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Username (SĐT) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bhxCredentials.username}
                  onChange={(e) => setBhxCredentials({ ...bhxCredentials, username: e.target.value })}
                  placeholder="0779461536"
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Customer ID</label>
                  <input
                    type="text"
                    value={bhxCredentials.customerId}
                    onChange={(e) => setBhxCredentials({ ...bhxCredentials, customerId: e.target.value })}
                    placeholder="1106126913"
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Device ID</label>
                  <input
                    type="text"
                    value={bhxCredentials.deviceId}
                    onChange={(e) => setBhxCredentials({ ...bhxCredentials, deviceId: e.target.value })}
                    placeholder="69e59888-66f2..."
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Device Token</label>
                  <input
                    type="text"
                    value={bhxCredentials.deviceToken}
                    onChange={(e) => setBhxCredentials({ ...bhxCredentials, deviceToken: e.target.value })}
                    placeholder="NWU0NGY0MzM..."
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm">
                <p className="font-semibold text-yellow-800 mb-1">💡 Cách lấy credentials:</p>
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>Vào bachhoaxanh.com, đăng nhập</li>
                  <li>Mở lịch sử đơn hàng</li>
                  <li>F12 → Network → tìm "GetDetailHistory"</li>
                  <li>Copy các headers trên vào đây</li>
                </ol>
              </div>
            </div>
          ) : (
            // KFM Credentials Form
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
                <p className="font-semibold text-blue-800 mb-1">🔐 Cần Cookie để authentication</p>
                <p className="text-sm text-gray-700 mb-2">
                  API KingFoodMart yêu cầu session. Lấy cookie từ browser:
                </p>
                <p className="text-xs text-orange-600">
                  ⚠️ <strong>Bảo mật:</strong> Cookie chứa thông tin nhạy cảm. Chỉ dùng trên máy cá nhân!
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cookie <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={kfmCredentials.cookie}
                  onChange={(e) => setKfmCredentials({ ...kfmCredentials, cookie: e.target.value })}
                  placeholder="_ga=GA1.1.xxx; sessionid=xxx; _gcl_au=xxx..."
                  className="input-field text-sm"
                  rows={4}
                />
                <p className="text-xs text-gray-600 mt-1">
                  💡 <strong>Cách lấy:</strong> F12 → Console → gõ <code className="bg-gray-200 px-1 rounded">document.cookie</code> → Enter → Copy
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveCredentials}
              className="btn-primary flex-1"
            >
              💾 Lưu Credentials
            </button>
            <button
              onClick={async () => {
                try {
                  await clearCredentialsFromSupabase(store)
                  if (store === 'bachhoaxanh') {
                    setBhxCredentials({
                      accessToken: '',
                      authorization: '',
                      customerId: '',
                      deviceId: '',
                      deviceToken: '',
                      username: ''
                    })
                  } else {
                    setKfmCredentials({ cookie: '' })
                  }
                  alert('✅ Đã xóa credentials!')
                } catch (err) {
                  setError('Lỗi xóa credentials: ' + err.message)
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              🗑️ Xóa
            </button>
          </div>
        </div>
      )}

      {/* Order Code Input */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mã đơn hàng {store === 'bachhoaxanh' ? '(OV2...)' : '(KP...)'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleFetch()}
            placeholder={store === 'bachhoaxanh' ? 'OV2025011123456789' : 'KP039840384'}
            className="input-field flex-1"
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="btn-primary px-6"
          >
            {loading ? '⏳ Đang lấy...' : '🚀 Lấy hóa đơn'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
