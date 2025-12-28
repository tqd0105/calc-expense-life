import { useState } from 'react'

export default function WeekManager({ weeks, onSaveWeek, onDeleteWeek }) {
  const [showForm, setShowForm] = useState(false)
  const [editingWeek, setEditingWeek] = useState(null)
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
    const updatedWeek = {
      ...week,
      isPaid: !week.isPaid
    }
    onSaveWeek(updatedWeek)
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
              className={`flex justify-between items-center p-4 rounded-xl border-2 hover:shadow-lg hover:scale-[1.02] transition-all ${
                week.isPaid 
                  ? 'bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 border-emerald-400' 
                  : 'bg-gradient-to-br from-rose-100 via-orange-50 to-red-100 border-rose-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className={`font-bold text-lg ${
                    week.isPaid ? 'text-emerald-900' : 'text-rose-900'
                  }`}>
                    {week.name}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    week.isPaid 
                      ? 'bg-emerald-200 text-emerald-800' 
                      : 'bg-rose-200 text-rose-800'
                  }`}>
                    {week.isPaid ? '✓ Đã trả' : '⏳ Chưa trả'}
                  </span>
                </div>
                <div className={`text-sm font-medium mt-1 ${
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
              <div className="flex gap-2">
                <button
                  onClick={() => handleTogglePaid(week)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all ${
                    week.isPaid
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                  title={week.isPaid ? 'Đánh dấu chưa trả' : 'Đánh dấu đã trả'}
                >
                  {week.isPaid ? '↩ Chưa trả' : '✓ Đã trả'}
                </button>
                <button
                  onClick={() => handleEdit(week)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium shadow-sm hover:shadow transition-all"
                >
                  Sửa
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Xóa tuần "${week.name}"?`)) {
                      onDeleteWeek(week.id)
                    }
                  }}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-sm font-medium shadow-sm hover:shadow transition-all"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
