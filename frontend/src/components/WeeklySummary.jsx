import { useState, useEffect } from 'react'
import { updateInvoice } from '../utils/database'
import VietQR from './VietQR'

// Storage key for number of people
const PEOPLE_COUNT_KEY = 'expense_people_count'

export default function WeeklySummary({ history, weeks, onEditInvoice, onDeleteInvoice }) {
  const [weeklySummary, setWeeklySummary] = useState([])
  const [useCustomWeeks, setUseCustomWeeks] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'unpaid', 'paid'
  const [showAll, setShowAll] = useState(false)
  const [expandedWeeks, setExpandedWeeks] = useState(new Set())
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingEditInvoice, setPendingEditInvoice] = useState(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [peopleCount, setPeopleCount] = useState(() => {
    const saved = localStorage.getItem(PEOPLE_COUNT_KEY)
    return saved ? parseInt(saved) : 2
  })

  // Save people count to localStorage
  const handlePeopleCountChange = (count) => {
    setPeopleCount(count)
    localStorage.setItem(PEOPLE_COUNT_KEY, count.toString())
  }

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
        id: week.id,
        isPaid: week.isPaid || false
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

  // Calculate total amount each person should pay for a week
  // Takes into account invoices marked as "not split"
  function calculatePersonAmount(invoices, peopleCount) {
    if (!invoices || invoices.length === 0) return 0
    
    let totalSplitAmount = 0
    let totalNotSplitAmount = 0
    
    invoices.forEach(invoice => {
      if (invoice.isNotSplit) {
        totalNotSplitAmount += invoice.total
      } else {
        totalSplitAmount += invoice.total
      }
    })
    
    // Split invoices are divided by people count
    // Not split invoices are paid fully by one person (so divided by people count for average)
    return (totalSplitAmount / peopleCount) + (totalNotSplitAmount / peopleCount)
  }

  // Calculate how much the group should split (excluding not-split invoices)
  function calculateSplitAmount(invoices, peopleCount) {
    if (!invoices || invoices.length === 0) return 0
    
    const splitInvoices = invoices.filter(invoice => !invoice.isNotSplit)
    const totalSplitAmount = splitInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    
    return totalSplitAmount / peopleCount
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
    <>
      <div className="card border-l-4 border-l-orange-500 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Tổng hợp theo tuần
        </h2>
        
        {/* People Count Selector */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-2 rounded-xl border-2 border-violet-300">
          <span className="text-xs sm:text-sm font-semibold text-violet-700">👥 Chia cho:</span>
          <div className="flex gap-1">
            {[2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => handlePeopleCountChange(num)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  peopleCount === num
                    ? 'bg-violet-600 text-white shadow-md scale-110'
                    : 'bg-white text-violet-600 hover:bg-violet-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <span className="text-xs text-violet-600">người</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-4 p-1 bg-gray-100 rounded-xl overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            filter === 'all' 
              ? 'bg-white text-indigo-700 shadow-md' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          📋 Tất cả ({weeklySummary.length})
        </button>
        <button
          onClick={() => setFilter('unpaid')}
          className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            filter === 'unpaid' 
              ? 'bg-rose-500 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          ⏳ Chưa trả ({weeklySummary.filter(w => !w.isPaid).length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            filter === 'paid' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          ✓ Đã trả ({weeklySummary.filter(w => w.isPaid).length})
        </button>
      </div>

      {/* Filtered weeks */}
      {(() => {
        const filteredWeeks = weeklySummary.filter(week => {
          if (filter === 'unpaid') return !week.isPaid
          if (filter === 'paid') return week.isPaid
          return true
        })
        
        const displayLimit = 2
        const displayWeeks = showAll ? filteredWeeks : filteredWeeks.slice(0, displayLimit)
        const hasMore = filteredWeeks.length > displayLimit

        return (
          <>
            <div className="space-y-4">
              {displayWeeks.map((week, index) => {
                const isExpanded = expandedWeeks.has(week.id) || (!week.isPaid && filter !== 'paid')
                
                return (
                  <div 
                    key={index} 
                    className={`border-2 rounded-2xl overflow-hidden transition-all ${
                      week.isPaid
                        ? 'bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 border-emerald-400'
                        : 'bg-gradient-to-br from-rose-100 via-orange-50 to-red-100 border-rose-300'
                    }`}
                  >
                    {/* Header - luôn hiện */}
                    <div 
                      className={`p-5 cursor-pointer hover:opacity-90 transition-opacity ${
                        week.isPaid ? 'hover:bg-emerald-200/30' : 'hover:bg-rose-200/30'
                      }`}
                      onClick={() => {
                        const newExpanded = new Set(expandedWeeks)
                        if (newExpanded.has(week.id)) {
                          newExpanded.delete(week.id)
                        } else {
                          newExpanded.add(week.id)
                        }
                        setExpandedWeeks(newExpanded)
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className={`text-xl transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                          <div>
                            <div className="flex flex-col items-start gap-2">
                              <h3 className={`text-lg font-bold ${
                                week.isPaid ? 'text-emerald-900' : 'text-red-600'
                              }`}>
                                {week.weekRange}
                              </h3>
                              <span className={`text-sm px-2 py-1 rounded-full font-bold ${
                                week.isPaid 
                                  ? 'bg-emerald-200 text-emerald-800' 
                                  : 'bg-rose-200 text-rose-800'
                              }`}>
                                {week.isPaid ? '✓ Đã trả' : '⏳ Chưa trả'}
                              </span>
                            </div>
                            <p className={`text-sm font-medium mt-1 ${
                              week.isPaid ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {week.invoices.length} đơn • Mỗi người: {formatCurrency(calculateSplitAmount(week.invoices, peopleCount))}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            week.isPaid ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {formatCurrency(week.total)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content - ẩn/hiện */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t-2 border-dashed border-opacity-50 ${
                        week.isPaid ? 'border-emerald-300' : 'border-rose-300'
                      }">
                        <div className={`pt-4`}>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className={`rounded-xl p-4 border-2 ${
                              week.isPaid 
                                ? 'bg-gradient-to-br from-teal-100 to-cyan-100 border-teal-300' 
                                : 'bg-gradient-to-br from-orange-100 to-amber-100 border-orange-300'
                            }`}>
                              <div className={`text-sm mb-1 font-medium ${
                                week.isPaid ? 'text-teal-700' : 'text-orange-700'
                              }`}>Mỗi người trả</div>
                              <div className={`text-2xl font-bold ${
                                week.isPaid ? 'text-teal-600' : 'text-orange-600'
                              }`}>
                                {formatCurrency(calculateSplitAmount(week.invoices, peopleCount))}
                              </div>
                            </div>
                            
                            <div className={`rounded-xl p-4 border-2 ${
                              week.isPaid
                                ? 'bg-gradient-to-br from-sky-100 to-blue-100 border-sky-300'
                                : 'bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-300'
                            }`}>
                              <div className={`text-sm mb-1 font-medium ${
                                week.isPaid ? 'text-sky-700' : 'text-yellow-700'
                              }`}>Trung bình/đơn</div>
                              <div className={`text-2xl font-bold ${
                                week.isPaid ? 'text-sky-600' : 'text-yellow-600'
                              }`}>
                                {formatCurrency(week.total / week.invoices.length)}
                              </div>
                            </div>
                          </div>

                          {/* Invoice list */}
                          <details className="mt-2" open>
                            <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 font-bold mb-2">
                              Chi tiết {week.invoices.length} đơn hàng
                            </summary>
                            <div className="space-y-2">
                              {week.invoices.map((invoice, idx) => (
                  <div 
                    key={idx}
                    className="flex  justify-between items-center p-3 bg-white rounded-xl text-sm hover:shadow-md transition-all border-2 border-slate-200"
                  >
                    <div>
                    <div className="flex-1 ">
                      <div className=" text-xl text-black font-bold mt-1">
                        <div className="flex items-center gap-2">
                          {invoice.store}
                          {invoice.isNotSplit && (
                            <span className="px-2 py-1 bg-orange-200 text-red-600 text-sm font-bold rounded-lg shadow-lg">
                              💰 Không chia
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-md text-gray-400">
                        {new Date(invoice.date || invoice.orderDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className=" font-medium text-gray-500">
                        {invoice.orderCode}
                      </div>
                    </div>
                    {/* Kẻ đường ngang */}
                    <div className="border-t border-gray-300 flex-1 my-1"></div>
                    <div className="text-right flex items-center gap-3">
                      <div flex className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-slate-900">
                          {formatCurrency(invoice.total)}
                        </div>
                        <div className={`text-md  ${
                          invoice.isNotSplit ? 'text-red-600 font-bold ' : 'text-emerald-600 font-semibold'
                        }`}>
                          ÷{peopleCount} = {invoice.isNotSplit ? 'Không chia' : formatCurrency(invoice.total / peopleCount)}
                        </div>
                      </div>
                      
                    </div>
                    </div>
                    <div className='flex flex-col gap-1'>
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 bg-gray-200 rounded-full transition-colors font-medium"
                        title="Xem chi tiết"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          // Mở modal xác thực mật khẩu
                          setPendingEditInvoice(invoice)
                          setShowPasswordModal(true)
                          setPasswordInput('')
                          setPasswordError('')
                        }}
                        className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-2 bg-gray-200 rounded-full transition-colors font-medium"
                        title="Chỉnh sửa đơn hàng (Cần mật khẩu)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Xóa đơn hàng ${invoice.orderCode}?`)) {
                            onDeleteInvoice && onDeleteInvoice(invoice.id)
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 bg-gray-200 rounded-full transition-colors font-medium"
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
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Nút Xem thêm */}
            {hasMore && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full mt-4 py-3 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-colors"
              >
                📜 Xem thêm {filteredWeeks.length - displayLimit} tuần khác...
              </button>
            )}
            
            {showAll && filteredWeeks.length > displayLimit && (
              <button
                onClick={() => setShowAll(false)}
                className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                ↑ Thu gọn
              </button>
            )}
          </>
        )
      })()}
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-6 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl sm:rounded-2xl border-2 border-slate-300 shadow-lg">
        <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 text-lg sm:text-xl flex items-center gap-2">
          <span>📊</span> Tổng kết tài chính
        </h3>
        
        {/* Tổng quan chính */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-2 sm:p-4 border-2 border-emerald-300">
            <div className="text-xs text-emerald-700 font-medium mb-1">✓ Đã trả</div>
            <div className="text-sm sm:text-xl font-bold text-emerald-600">
              {formatCurrency(weeklySummary.filter(w => w.isPaid).reduce((sum, week) => sum + week.total, 0))}
            </div>
            <div className="text-xs text-emerald-600 mt-1">
              {weeklySummary.filter(w => w.isPaid).length} tuần
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-2 sm:p-4 border-2 border-rose-300">
            <div className="text-xs text-rose-700 font-medium mb-1">⏳ Nợ</div>
            <div className="text-sm sm:text-xl font-bold text-rose-600">
              {formatCurrency(weeklySummary.filter(w => !w.isPaid).reduce((sum, week) => sum + week.total, 0))}
            </div>
            <div className="text-xs text-rose-600 mt-1">
              {weeklySummary.filter(w => !w.isPaid).length} tuần
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-2 sm:p-4 border-2 border-indigo-300">
            <div className="text-xs text-indigo-700 font-medium mb-1">💰 Tổng</div>
            <div className="text-sm sm:text-xl font-bold text-indigo-600">
              {formatCurrency(weeklySummary.reduce((sum, week) => sum + week.total, 0))}
            </div>
            <div className="text-xs text-indigo-600 mt-1">
              {weeklySummary.length} tuần
            </div>
          </div>
        </div>

        {/* Highlight: Mỗi người phải trả */}
        <div className="flex items-center justify-between mb-4 p-3 sm:p-5 bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-amber-400 shadow-xl relative overflow-hidden">
          <div className=" z-10">
            <div className="text-xs sm:text-sm text-amber-800 font-bold mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
             <img src="/assets/icons/people.png" className="w-5 sm:w-6" alt="Icon" /> MỖI NGƯỜI PHẢI TRẢ
            </div>
            <div className="text-2xl sm:text-4xl font-black text-amber-700 mb-1">
              {formatCurrency(weeklySummary.filter(w => !w.isPaid).reduce((sum, week) => sum + calculateSplitAmount(week.invoices, peopleCount), 0))}
            </div>
            <div className="text-xs text-amber-600 font-medium">
              {weeklySummary.filter(w => !w.isPaid).length > 0 
                ? `Cho ${weeklySummary.filter(w => !w.isPaid).length} tuần chưa thanh toán`
                : 'Đã thanh toán hết! 🎉'}
            </div>
            {/* VietQR Button */}
            {weeklySummary.filter(w => !w.isPaid).length > 0 && (
              <div className="mt-2 sm:mt-3">
                <VietQR 
                  amount={weeklySummary.filter(w => !w.isPaid).reduce((sum, week) => sum + calculateSplitAmount(week.invoices, peopleCount), 0)}
                  description="Tien chi tieu chung"
                />
              </div>
            )}
          </div>
          <div className="text-4xl sm:text-6xl">💰</div>
        </div>

        {/* Thống kê chi tiết */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-lg p-2 sm:p-3 border border-slate-200">
            <div className="text-xs text-gray-600 mb-1">TB/tuần</div>
            <div className="text-xs sm:text-sm font-bold text-slate-700">
              {formatCurrency(weeklySummary.reduce((sum, week) => sum + week.total, 0) / weeklySummary.length)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-2 sm:p-3 border border-slate-200">
            <div className="text-xs text-gray-600 mb-1">Đã trả</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-600">
              {weeklySummary.length > 0 
                ? Math.round((weeklySummary.filter(w => w.isPaid).length / weeklySummary.length) * 100) 
                : 0}%
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-xs text-gray-600 mb-1">Tổng đơn hàng</div>
            <div className="text-sm font-bold text-slate-700">
              {weeklySummary.reduce((sum, week) => sum + week.invoices.length, 0)} đơn
            </div>
          </div>
        </div>

        {/* Cảnh báo nợ nếu có */}
        {weeklySummary.filter(w => !w.isPaid).length > 0 && (
          <div className="mt-4 p-3 bg-rose-100 border-2 border-rose-300 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-rose-600 text-lg">⚠️</span>
              <div>
                <p className="text-sm font-bold text-rose-800">
                  Còn {weeklySummary.filter(w => !w.isPaid).length} tuần chưa thanh toán
                </p>
                <p className="text-xs text-rose-600 mt-1">
                  Mỗi người cần trả: {formatCurrency(weeklySummary.filter(w => !w.isPaid).reduce((sum, week) => sum + calculateSplitAmount(week.invoices, peopleCount), 0))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Thông báo hoàn thành nếu đã trả hết */}
        {weeklySummary.length > 0 && weeklySummary.filter(w => !w.isPaid).length === 0 && (
          <div className="mt-4 p-3 bg-emerald-100 border-2 border-emerald-300 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 text-lg">✓</span>
              <p className="text-sm font-bold text-emerald-800">
                Tất cả các tuần đã được thanh toán! 🎉
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal chỉnh sửa đơn hàng */}
      {editingInvoice && editForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setEditingInvoice(null)
            setEditForm(null)
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#9ca3af #f3f4f6'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    ✏️ Chỉnh sửa đơn hàng
                  </h3>
                  <p className="text-amber-100 text-sm">
                    {editForm.orderCode}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingInvoice(null)
                    setEditForm(null)
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Thông tin cơ bản */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📝</span> Thông tin cơ bản
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã đơn hàng</label>
                    <input
                      type="text"
                      value={editForm.orderCode || ''}
                      onChange={(e) => setEditForm({ ...editForm, orderCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                    <input
                      type="text"
                      value={editForm.store || ''}
                      onChange={(e) => setEditForm({ ...editForm, store: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🛒</span> Danh sách sản phẩm
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {editForm.items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const newItems = [...editForm.items]
                              newItems[index].name = e.target.value
                              setEditForm({ ...editForm, items: newItems })
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Tên sản phẩm"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const newItems = [...editForm.items]
                                newItems[index].quantity = parseInt(e.target.value) || 1
                                newItems[index].price = (newItems[index].unitPrice || newItems[index].price) * (parseInt(e.target.value) || 1)
                                setEditForm({ ...editForm, items: newItems })
                              }}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                              placeholder="SL"
                              min="1"
                            />
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => {
                                const newItems = [...editForm.items]
                                newItems[index].price = parseInt(e.target.value) || 0
                                setEditForm({ ...editForm, items: newItems })
                              }}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                              placeholder="Giá"
                              min="0"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newItems = editForm.items.filter((_, i) => i !== index)
                            setEditForm({ ...editForm, items: newItems })
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Xóa sản phẩm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Nút thêm sản phẩm */}
                <button
                  onClick={() => {
                    const newItems = [...editForm.items, { name: '', quantity: 1, price: 0 }]
                    setEditForm({ ...editForm, items: newItems })
                  }}
                  className="mt-3 w-full py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium text-sm"
                >
                  + Thêm sản phẩm
                </button>
              </div>

              {/* Tổng tiền */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-amber-700">
                    {formatCurrency(editForm.items.reduce((sum, item) => sum + (item.price || 0), 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl border-t flex gap-3">
              <button
                onClick={() => {
                  setEditingInvoice(null)
                  setEditForm(null)
                }}
                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  try {
                    const updatedInvoice = {
                      ...editingInvoice,
                      orderCode: editForm.orderCode,
                      store: editForm.store,
                      items: editForm.items,
                      total: editForm.items.reduce((sum, item) => sum + (item.price || 0), 0)
                    }
                    
                    // Lưu vào database
                    await updateInvoice(updatedInvoice.id, updatedInvoice)
                    
                    // Đóng modal
                    setEditingInvoice(null)
                    setEditForm(null)
                    
                    // Reload trang để cập nhật
                    window.location.reload()
                  } catch (error) {
                    console.error('Lỗi khi lưu:', error)
                    alert('Lỗi khi lưu đơn hàng: ' + error.message)
                  }
                }}
                className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
              >
                💾 Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết hoá đơn */}
      {selectedInvoice && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#9ca3af #f3f4f6'
            }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-bold">
                    {selectedInvoice.store}
                  </p>
                  <h3 className="font-medium text-md text-gray-300">
                    {selectedInvoice.orderCode}
                  </h3>
                  <p className="text-sm text-blue-200 ">
                    {new Date(selectedInvoice.date || selectedInvoice.orderDate).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Tổng tiền */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 mb-6 border-2 border-emerald-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Tổng cộng</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {formatCurrency(selectedInvoice.total)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-teal-700 font-medium">Mỗi người trả</p>
                    <p className="text-2xl font-bold text-teal-600">
                      {selectedInvoice.isNotSplit ? 'Không chia tiền' : formatCurrency(selectedInvoice.total / peopleCount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Danh sách sản phẩm ({selectedInvoice.items.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {item.name}
                          </p>
                          {item.quantity && (
                            <p className="text-sm text-gray-600 mt-1">
                              Số lượng: {item.quantity}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(item.price)}
                          </p>
                          {item.quantity && item.quantity > 1 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatCurrency(item.price / item.quantity)}/sản phẩm
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nếu không có items */}
              {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-medium">Không có thông tin chi tiết sản phẩm</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl border-t">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác thực mật khẩu */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowPasswordModal(false)
            setPendingEditInvoice(null)
            setPasswordInput('')
            setPasswordError('')
          }}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-pulse-shadow"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-2xl">
              <div className="text-center">
                <div className="text-4xl mb-3">🔐</div>
                <h3 className="text-2xl font-bold mb-2">
                  Xác thực bảo mật
                </h3>
                <p className="text-amber-100 text-sm">
                  Nhập mật khẩu để chỉnh sửa đơn hàng
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔑 Mật khẩu:
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
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg font-mono text-center tracking-wider ${
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

              {/* Hint */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-lg">💡</span>
                  <div>
                    <p className="text-sm font-bold text-blue-800">Gợi ý:</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Mật khẩu có 8 ký tự: chữ + số
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-2xl border-t flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPendingEditInvoice(null)
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
                    // Mật khẩu đúng - cho phép chỉnh sửa
                    setEditingInvoice(pendingEditInvoice)
                    setEditForm({
                      ...pendingEditInvoice,
                      items: pendingEditInvoice.items.map(item => ({ ...item }))
                    })
                    
                    // Đóng modal
                    setShowPasswordModal(false)
                    setPendingEditInvoice(null)
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
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                🔓 Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
