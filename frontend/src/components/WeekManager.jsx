import { useState } from 'react'

export default function WeekManager({ weeks, onSaveWeek, onDeleteWeek }) {
  const [showForm, setShowForm] = useState(false)
  const [editingWeek, setEditingWeek] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingWeek, setPendingWeek] = useState(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isPaid: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const week = {
      id: editingWeek ? editingWeek.id : Date.now(),
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isPaid: formData.isPaid || false
    }
    
    onSaveWeek(week)
    setFormData({ name: '', startDate: '', endDate: '', isPaid: false })
    setEditingWeek(null)
    setShowForm(false)
  }

  const handleEdit = (week) => {
    setEditingWeek(week)
    
    // Ensure dates are in YYYY-MM-DD format for input[type="date"]
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ''
      return date.toISOString().split('T')[0]
    }
    
    setFormData({
      name: week.name,
      startDate: formatDateForInput(week.startDate),
      endDate: formatDateForInput(week.endDate),
      isPaid: week.isPaid || false
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData({ name: '', startDate: '', endDate: '', isPaid: false })
    setEditingWeek(null)
    setShowForm(false)
  }

  const handleTogglePaid = (week) => {
    // Mở modal xác thực mật khẩu
    setPendingWeek(week)
    setShowPasswordModal(true)
    setPasswordInput('')
    setPasswordError('')
  }

  return (
    <div className="card mb-6 border-l-4 border-l-purple-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Quản lý theo tuần</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "btn-secondary" : "btn-primary"}
        >
          {showForm ? 'Đóng' : '+ Thêm tuần'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-5 bg-purple-50 rounded-2xl border-2 border-purple-200">
          <h3 className="font-bold text-purple-900 mb-4 text-lg">
            {editingWeek ? 'Sửa tuần' : 'Thêm tuần mới'}
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên tuần <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Tuần 1 tháng 12, Tuần đầu tháng..."
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Từ ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Đến ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn-primary flex-1">
              {editingWeek ? '👆Cập nhật' : '+ Thêm tuần'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-500 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Week List */}
      {weeks.length === 0 ? (
        <p className="text-slate-500 text-center py-6 font-medium">
          Chưa có tuần nào. Click "Thêm tuần" để tạo tuần mới.
        </p>
      ) : (
        <div className="space-y-3">
          {weeks.map(week => (
            <div 
              key={week.id}
              className={`p-3 sm:p-4 rounded-xl border-2 hover:shadow-lg transition-all ${
                week.isPaid 
                  ? 'bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 border-emerald-400' 
                  : 'bg-gradient-to-br from-rose-100 via-orange-50 to-red-100 border-rose-300'
              }`}
            >
              {/* Mobile: Stack layout */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`font-bold text-base sm:text-lg ${
                      week.isPaid ? 'text-emerald-900' : 'text-rose-900'
                    }`}>
                      {week.name}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                      week.isPaid 
                        ? 'bg-emerald-200 text-emerald-800' 
                        : 'bg-rose-200 text-rose-800'
                    }`}>
                      {week.isPaid ? '✓ Đã trả' : '⏳ Chưa trả'}
                    </span>
                  </div>
                  <div className={`text-xs sm:text-sm font-medium mt-1 ${
                    week.isPaid ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {(() => {
                      const start = new Date(week.startDate)
                      const end = new Date(week.endDate)
                      
                      // Kiểm tra date hợp lệ
                      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                        return '⚠️ Ngày không hợp lệ'
                      }
                      
                      return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`
                    })()}
                  </div>
                </div>
                
                {/* Buttons - horizontal scroll on very small screens */}
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => handleTogglePaid(week)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all whitespace-nowrap flex-shrink-0 ${
                      week.isPaid
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                    title={week.isPaid ? 'Đánh dấu chưa trả (Cần mật khẩu)' : 'Đánh dấu đã trả (Cần mật khẩu)'}
                  >
                    {week.isPaid ? '↩ Chưa trả' : '✓ Đã trả'}
                  </button>
                  <button
                    onClick={() => handleEdit(week)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all whitespace-nowrap flex-shrink-0"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa tuần "${week.name}"?`)) {
                        onDeleteWeek(week.id)
                      }
                    }}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all whitespace-nowrap flex-shrink-0"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal xác thực mật khẩu */}
      {showPasswordModal && pendingWeek && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowPasswordModal(false)
            setPendingWeek(null)
            setPasswordInput('')
            setPasswordError('')
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="text-center">
                <div className="text-4xl mb-3">💳</div>
                <h3 className="text-2xl font-bold mb-2">
                  Xác nhận thanh toán
                </h3>
                <p className="text-purple-100 text-sm">
                  {pendingWeek.isPaid 
                    ? `Đánh dấu "${pendingWeek.name}" chưa thanh toán?`
                    : `Đánh dấu "${pendingWeek.name}" đã thanh toán?`
                  }
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔑 Nhập mật khẩu xác thực:
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value)
                    setPasswordError('') // Clear error when typing
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit()
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-mono text-center tracking-wider ${
                    passwordError 
                      ? 'border-rose-400 bg-rose-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Nhập mật khẩu..."
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-rose-600 text-sm font-medium flex items-center gap-2">
                    <span>❌</span> {passwordError}
                  </p>
                )}
              </div>

              {/* Status Preview */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Trạng thái hiện tại:</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold ${
                      pendingWeek.isPaid 
                        ? 'bg-emerald-200 text-emerald-800' 
                        : 'bg-rose-200 text-rose-800'
                    }`}>
                      {pendingWeek.isPaid ? '✓ Đã trả' : '⏳ Chưa trả'}
                    </span>
                  </div>
                  <div className="text-3xl">→</div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Sẽ thành:</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold ${
                      !pendingWeek.isPaid 
                        ? 'bg-emerald-200 text-emerald-800' 
                        : 'bg-rose-200 text-rose-800'
                    }`}>
                      {!pendingWeek.isPaid ? '✓ Đã trả' : '⏳ Chưa trả'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security note */}
              {/* <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-lg">🛡️</span>
                  <div>
                    <p className="text-sm font-bold text-blue-800">Bảo mật cao</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Chỉ admin mới có thể thay đổi trạng thái thanh toán
                    </p>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-2xl border-t flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPendingWeek(null)
                  setPasswordInput('')
                  setPasswordError('')
                }}
                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Kiểm tra mật khẩu
                  if (passwordInput.trim() === 'tqd0105') {
                    // Mật khẩu đúng - thực hiện thay đổi
                    const updatedWeek = {
                      ...pendingWeek,
                      isPaid: !pendingWeek.isPaid
                    }
                    onSaveWeek(updatedWeek)
                    
                    // Đóng modal
                    setShowPasswordModal(false)
                    setPendingWeek(null)
                    setPasswordInput('')
                    setPasswordError('')
                  } else {
                    // Mật khẩu sai
                    setPasswordError('Mật khẩu không chính xác!')
                    setPasswordInput('')
                  }
                }}
                disabled={!passwordInput.trim()}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                  passwordInput.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {pendingWeek.isPaid ? '↩ Đánh dấu chưa trả' : '✓ Đánh dấu đã trả'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
