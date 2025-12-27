import { useState, useEffect } from 'react'

export default function WeeklySummary({ history, weeks, onDeleteInvoice }) {
  const [weeklySummary, setWeeklySummary] = useState([])
  const [useCustomWeeks, setUseCustomWeeks] = useState(false)

  useEffect(() => {
    // Only show weeks if custom weeks are defined
    if (!weeks || weeks.length === 0) {
      setWeeklySummary([])
      setUseCustomWeeks(false)
      return
    }

    if (!history || history.length === 0) {
      setWeeklySummary([])
      setUseCustomWeeks(true)
      return
    }

    // Use custom weeks with assigned invoices
    const customSummary = weeks.map(week => {
      // Get invoices assigned to this week (compare as numbers)
      const weekInvoices = history.filter(invoice => 
        invoice.weekId && String(invoice.weekId) === String(week.id)
      )
      
      return {
        weekRange: week.name,
        invoices: weekInvoices,
        total: weekInvoices.reduce((sum, inv) => sum + inv.total, 0),
        startDate: new Date(week.startDate),
        id: week.id
      }
    }).filter(week => week.invoices.length > 0) // Only show weeks with invoices
      .sort((a, b) => b.startDate - a.startDate) // Newest first
    
    setWeeklySummary(customSummary)
    setUseCustomWeeks(true)
  }, [history, weeks])

  // Get week range string (VD: 22/12-28/12)
  function getWeekRange(date) {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday = start of week
    
    const monday = new Date(date)
    monday.setDate(diff)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    return formatWeekRange(monday, sunday)
  }

  // Format week range
  function formatWeekRange(startDate, endDate) {
    const formatDate = (d) => {
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      return `${day}/${month}`
    }
    
    return `${formatDate(startDate)}-${formatDate(endDate)}`
  }

  // Parse week start date for sorting
  function parseWeekStart(weekRange) {
    const [start] = weekRange.split('-')
    const [day, month] = start.split('/')
    const year = new Date().getFullYear()
    return new Date(year, parseInt(month) - 1, parseInt(day))
  }

  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (weeklySummary.length === 0) {
    return (
      <div className="card border-l-4 border-l-orange-500 mt-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
          Tổng hợp theo tuần
        </h2>
        <p className="text-slate-500 text-center py-8 font-medium">
          {!weeks || weeks.length === 0
            ? 'Vui lòng tạo tuần trong "Quản lý tuần" ở trên'
            : 'Chưa có đơn hàng nào trong các tuần đã thiết lập.'}
        </p>
      </div>
    )
  }

  return (
    <div className="card border-l-4 border-l-orange-500 mt-4">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
        Tổng hợp theo tuần
        <span className="text-sm font-semibold text-emerald-600 ml-3">(Tuần tùy chỉnh)</span>
      </h2>
      
      <div className="space-y-4">
        {weeklySummary.map((week, index) => (
          <div 
            key={index} 
            className="border-2 border-orange-300 rounded-2xl p-5 hover:shadow-xl transition-all bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100"
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-xl font-bold text-orange-900">
                  Tuần {week.weekRange}
                </h3>
                <p className="text-sm text-orange-600 font-medium mt-1">
                  {week.invoices.length} đơn hàng
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-600">
                  {formatCurrency(week.total)}
                </div>
                <div className="text-sm text-orange-500 font-medium">Tổng cộng</div>
              </div>
            </div>
            
            <div className="border-t-2 border-orange-200 pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl p-4 border-2 border-emerald-300">
                  <div className="text-sm text-emerald-700 mb-1 font-medium">Mỗi người trả</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(week.total / 2)}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl p-4 border-2 border-cyan-300">
                  <div className="text-sm text-cyan-700 mb-1 font-medium">Trung bình/đơn</div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {formatCurrency(week.total / week.invoices.length)}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice list */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 font-bold">
                Xem chi tiết {week.invoices.length} đơn hàng
              </summary>
              <div className="mt-3 space-y-2">
                {week.invoices.map((invoice, idx) => (
                  <div 
                    key={idx}
                    className="flex justify-between items-center p-3 bg-white rounded-xl text-sm hover:shadow-md transition-all border-2 border-slate-200"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">
                        {invoice.orderCode}
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-1">
                        {invoice.store} • {new Date(invoice.date || invoice.orderDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-bold text-slate-900">
                          {formatCurrency(invoice.total)}
                        </div>
                        <div className="text-xs text-emerald-600 font-semibold">
                          ÷2 = {formatCurrency(invoice.total / 2)}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Xóa đơn hàng ${invoice.orderCode}?`)) {
                            onDeleteInvoice && onDeleteInvoice(invoice.id)
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors font-medium"
                        title="Xóa đơn hàng"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h3 className="font-bold text-purple-800 mb-2">📊 Tổng tất cả</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Tổng chi tiêu</div>
            <div className="text-lg font-bold text-purple-600">
              {formatCurrency(weeklySummary.reduce((sum, week) => sum + week.total, 0))}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Số tuần</div>
            <div className="text-lg font-bold text-purple-600">
              {weeklySummary.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">TB/tuần</div>
            <div className="text-lg font-bold text-purple-600">
              {formatCurrency(weeklySummary.reduce((sum, week) => sum + week.total, 0) / weeklySummary.length)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
