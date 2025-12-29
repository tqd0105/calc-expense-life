export default function InvoiceResult({ invoice, weeks, onWeekSelect }) {
  if (!invoice) return null

  const splitAmount = invoice.total / 2
  // Compare as strings to handle both number and string IDs
  const selectedWeek = weeks?.find(w => String(w.id) === String(invoice.weekId))

  // Màu sắc theo cửa hàng
  const isKFM = invoice.store?.toLowerCase().includes('king') || invoice.store?.toLowerCase().includes('kfm')
  const colors = isKFM ? {
    borderMain: 'border-l-orange-500',
    gradientTitle: 'from-orange-600 to-red-600',
    bgInfo: 'from-orange-50 to-red-50',
    borderInfo: 'border-orange-200',
    textMain: 'text-orange-700',
    textSecondary: 'text-orange-600',
    textTitle: 'text-orange-700',
    borderTotal: 'border-orange-200',
    gradientSplit: 'from-orange-500 via-red-500 to-red-600'
  } : {
    borderMain: 'border-l-teal-500',
    gradientTitle: 'from-teal-600 to-cyan-600',
    bgInfo: 'from-teal-50 to-cyan-50',
    borderInfo: 'border-teal-200',
    textMain: 'text-teal-700',
    textSecondary: 'text-teal-600',
    textTitle: 'text-teal-700',
    borderTotal: 'border-teal-200',
    gradientSplit: 'from-emerald-500 via-teal-500 to-cyan-600'
  }

  return (
    <div className={`card border-l-4 ${colors.borderMain}`}>
      <h2 className={`text-2xl font-bold bg-gradient-to-r ${colors.gradientTitle} bg-clip-text text-transparent mb-4`}>Kết quả</h2>

      {/* Week Selector */}
      {weeks && weeks.length > 0 && (
        <div className="mb-4 p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl">
          <label className="block text-sm font-bold text-amber-900 mb-2">
            Chọn tuần cho đơn hàng này:
          </label>
          <select
            value={invoice.weekId || ''}
            onChange={(e) => onWeekSelect && onWeekSelect(invoice.id, e.target.value)}
            className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
          >
            <option value="">Chưa gán tuần</option>
            {weeks.map(week => {
              const start = new Date(week.startDate)
              const end = new Date(week.endDate)
              const dateRange = (isNaN(start.getTime()) || isNaN(end.getTime())) 
                ? '⚠️ Ngày không hợp lệ' 
                : `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`
              
              return (
                <option key={week.id} value={week.id}>
                  {week.name} ({dateRange})
                </option>
              )
            })}
          </select>
          {selectedWeek && (
            <p className="mt-3 text-sm text-emerald-600 font-semibold">
              ✓ Đã gán vào: <strong>{selectedWeek.name}</strong>
            </p>
          )}
        </div>
      )}

      {/* Thông tin chung */}
      <div className={`mb-6 p-5 bg-gradient-to-br ${colors.bgInfo} rounded-2xl border-2 ${colors.borderInfo}`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`${colors.textMain} font-bold`}>Cửa hàng:</span>
          <span className={`text-xl font-bold ${colors.textSecondary}`}>{invoice.store}</span>
        </div>
        {invoice.orderCode && (
          <div className="flex justify-between items-center mb-3">
            <span className={`${colors.textMain} font-bold`}>Mã đơn hàng:</span>
            <span className="text-slate-800 font-mono font-semibold">{invoice.orderCode}</span>
          </div>
        )}
        {invoice.date && (
          <div className="flex justify-between items-center">
            <span className={`${colors.textMain} font-bold`}>Ngày mua:</span>
            <span className="text-slate-800 font-medium">
              {(() => {
                try {
                  const date = new Date(invoice.date);
                  // Kiểm tra nếu ngày hợp lệ
                  if (isNaN(date.getTime())) {
                    return invoice.date; // Trả về nguyên bản nếu không parse được
                  }
                  return date.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                } catch (e) {
                  return invoice.date; // Fallback về original
                }
              })()}
            </span>
          </div>
        )}
      </div>

      {/* Danh sách sản phẩm */}
      <div className="mb-6">
        <h3 className={`text-xl font-bold ${colors.textTitle} mb-4`}>Danh sách sản phẩm:</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {invoice.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl hover:shadow-md transition-all border-2 border-slate-200">
              <div className="flex-1">
                <p className="font-bold text-slate-800">{item.name}</p>
                {item.unit && <p className="text-sm text-slate-600 font-medium mt-1">SL: {item.unit}</p>}
                {item.unitPrice && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-1">
                    <span>{item.unitPrice.toLocaleString('vi-VN')}₫ × {item.quantity}</span>
                    {item.isDiscount && item.originalPrice && (
                      <span className="line-through text-rose-500">{item.originalPrice.toLocaleString('vi-VN')}₫</span>
                    )}
                  </div>
                )}
              </div>
              <p className="font-bold text-slate-900 ml-4 text-lg">{item.price.toLocaleString('vi-VN')}₫</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tổng kết */}
      <div className={`border-t-4 ${colors.borderTotal} pt-5`}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-slate-800">Tổng cộng:</span>
          <span className={`text-3xl font-bold ${colors.textSecondary}`}>{invoice.total.toLocaleString('vi-VN')}₫</span>
        </div>
        
        <div className={`p-6 bg-gradient-to-br ${colors.gradientSplit} rounded-2xl text-white shadow-xl hover:shadow-2xl transition-shadow`}>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Mỗi người trả:</span>
            <span className="text-4xl font-bold">{splitAmount.toLocaleString('vi-VN')}₫</span>
          </div>
          <p className="text-sm text-white/90 mt-3 text-center font-medium">
            (Đã chia đôi tự động 50/50)
          </p>
        </div>
      </div>

      {/* Ghi chú */}
      <div className="mt-5 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-900 border-2 border-indigo-200">
        <p className="font-bold mb-2">Ghi chú:</p>
        <p className="font-medium">• Số tiền đã bao gồm tất cả phí và thuế</p>
        <p className="font-medium">• Lịch sử hóa đơn được lưu tự động</p>
      </div>
    </div>
  )
}
