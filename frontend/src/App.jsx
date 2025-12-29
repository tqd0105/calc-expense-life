import { useState, useEffect } from 'react'
import InvoiceInput from './components/InvoiceInput'
import CustomInvoiceInput from './components/CustomInvoiceInput'
import InvoiceResult from './components/InvoiceResult'
import InvoiceHistory from './components/InvoiceHistory'
import AutoAPIFetcher from './components/AutoAPIFetcher'
import WeeklySummary from './components/WeeklySummary'
import WeekManager from './components/WeekManager'
import Auth from './components/Auth'
import { parseInvoiceHTML } from './utils/htmlParser'
import { supabase, isSupabaseEnabled } from './lib/supabase'
import { 
  getWeeks, saveWeek, deleteWeek as dbDeleteWeek,
  getInvoices, saveInvoice, updateInvoice, deleteInvoice as dbDeleteInvoice,
  subscribeToWeeks, subscribeToInvoices
} from './utils/database'

function App() {
  const [currentInvoice, setCurrentInvoice] = useState(null)
  const [history, setHistory] = useState([])
  const [weeks, setWeeks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check authentication
  useEffect(() => {
    if (!isSupabaseEnabled()) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load data từ Supabase hoặc localStorage
  useEffect(() => {
    if (isSupabaseEnabled() && !user) return

    async function loadData() {
      try {
        const [weeksData, invoicesData] = await Promise.all([
          getWeeks(),
          getInvoices()
        ])
        setWeeks(weeksData)
        setHistory(invoicesData)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()

    // Subscribe to realtime changes
    const unsubWeeks = subscribeToWeeks(async () => {
      const weeksData = await getWeeks()
      setWeeks(weeksData)
    })

    const unsubInvoices = subscribeToInvoices(async () => {
      const invoicesData = await getInvoices()
      setHistory(invoicesData)
    })

    // Check URL params cho bookmarklet
    const urlParams = new URLSearchParams(window.location.search)
    const invoiceData = urlParams.get('invoice')
    
    if (invoiceData) {
      try {
        const parsed = parseInvoiceHTML(invoiceData)
        if (parsed && parsed.items.length > 0) {
          handleInvoiceParsed(parsed)
          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname)
        }
      } catch (error) {
        console.error('Error parsing invoice from URL:', error)
      }
    }

    return () => {
      unsubWeeks()
      unsubInvoices()
    }
  }, [user])

  const handleInvoiceParsed = async (invoiceData) => {
    // If data is string (JSON), parse it first
    let parsed = invoiceData
    if (typeof invoiceData === 'string') {
      parsed = parseInvoiceHTML(invoiceData)
    }
    
    // Check if invoice already exists (by orderCode)
    if (parsed.orderCode) {
      const existingInvoice = history.find(inv => 
        inv.orderCode && inv.orderCode === parsed.orderCode
      )
      
      if (existingInvoice) {
        // Invoice already exists, just display it
        setCurrentInvoice(existingInvoice)
        alert('ℹ️ Hóa đơn này đã tồn tại trong lịch sử!')
        return
      }
    }
    
    // Add id and metadata immediately
    const invoiceWithId = { 
      ...parsed, 
      id: Date.now(), 
      date: new Date().toISOString(), 
      weekId: null 
    }
    
    setCurrentInvoice(invoiceWithId)
    
    try {
      // Save to database
      const saved = await saveInvoice(invoiceWithId)
      
      // Update local state
      const newHistory = [...history, saved]
      setHistory(newHistory)
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Lỗi lưu hóa đơn: ' + error.message)
    }
  }

  const handleWeekSelect = async (invoiceId, weekId) => {
    // Convert weekId to number for consistency
    const numericWeekId = weekId ? Number(weekId) : null
    
    try {
      // Update database
      await updateInvoice(invoiceId, { weekId: numericWeekId })
      
      // Update local state
      const newHistory = history.map(inv => 
        inv.id === invoiceId ? { ...inv, weekId: numericWeekId } : inv
      )
      setHistory(newHistory)
      
      // Update current invoice if it's the one being modified
      if (currentInvoice?.id === invoiceId) {
        setCurrentInvoice({ ...currentInvoice, weekId: numericWeekId })
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Lỗi cập nhật tuần: ' + error.message)
    }
  }

  const handleViewHistory = (invoice) => {
    setCurrentInvoice(invoice)
  }

  const handleClearHistory = async () => {
    if (!confirm('Xóa toàn bộ lịch sử?')) return
    
    try {
      // Delete all invoices
      await Promise.all(history.map(inv => dbDeleteInvoice(inv.id)))
      setHistory([])
    } catch (error) {
      console.error('Error clearing history:', error)
      alert('Lỗi xóa lịch sử: ' + error.message)
    }
  }

  const handleSaveWeek = async (week) => {
    try {
      const saved = await saveWeek(week)
      
      const newWeeks = weeks.find(w => w.id === week.id)
        ? weeks.map(w => w.id === week.id ? saved : w)
        : [...weeks, saved]
      
      setWeeks(newWeeks)
    } catch (error) {
      console.error('Error saving week:', error)
      alert('Lỗi lưu tuần: ' + error.message)
    }
  }

  const handleDeleteWeek = async (weekId) => {
    try {
      await dbDeleteWeek(weekId)
      const newWeeks = weeks.filter(w => w.id !== weekId)
      setWeeks(newWeeks)
    } catch (error) {
      console.error('Error deleting week:', error)
      alert('Lỗi xóa tuần: ' + error.message)
    }
  }

  const handleEditInvoice = (invoice) => {
    setCurrentInvoice(invoice)
    // Scroll to top to see the result
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      await dbDeleteInvoice(invoiceId)
      const newHistory = history.filter(inv => inv.id !== invoiceId)
      setHistory(newHistory)
      
      // Clear current invoice if it's the one being deleted
      if (currentInvoice?.id === invoiceId) {
        setCurrentInvoice(null)
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Lỗi xóa hóa đơn: ' + error.message)
    }
  }

  const handleLogout = async () => {
    if (isSupabaseEnabled()) {
      await supabase.auth.signOut()
    }
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">⏳ Đang tải...</div>
      </div>
    )
  }

  // Show auth page if Supabase enabled and not logged in
  if (isSupabaseEnabled() && !user) {
    return <Auth onAuthSuccess={() => setUser(true)} />
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        {/* Header */}
        <header className=" overflow-hidden bg-gray-600 shadow-xl">
          {/* Animated background shapes */}
          {/* <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-5 right-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl animate-bounce" style={{animationDuration: '3s'}}></div>
            <div className="absolute -bottom-5 left-1/3 w-48 h-48 bg-pink-300/15 rounded-full blur-2xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-3xl"></div>
          </div> */}
          
          <div className="relative max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Logo/Icon */}
                <div className="relative">
                  <div className="  rounded-2xl flex items-center justify-center  ">
                    <img src="/assets/icons/ehomes.png" className="w-14 sm:w-24 " alt="" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 sm:w-5 h-4 sm:h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                </div>
                
                <div>
                  <h1 className="text-xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                    Quản lý chi tiêu
                  </h1>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                    <span className="text-white/90 font-semibold text-xs sm:text-sm tracking-wide flex items-center gap-1">
                      <img src="/assets/icons/buildings.png" className="w-4 sm:w-6 rounded-lg shadow-md inline-block" alt="" />
                       KMS Technology
                    </span>
                    {/* {isSupabaseEnabled() && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-400/30 text-emerald-100 text-xs font-bold rounded-full backdrop-blur-sm border border-emerald-300/30">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        Realtime Sync
                      </span>
                    )} */}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Stats badges */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 text-white flex items-center gap-2">
                    <span className="text-xs text-white/70 block">Hóa đơn</span>
                    <span className="text-lg sm:text-xl font-extrabold">{history.length}</span>
                  </div>
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 text-white flex items-center gap-2">
                    <span className="text-xs text-white/70 block">Tuần</span>
                    <span className="text-lg sm:text-xl font-extrabold">{weeks.length}</span>
                  </div>
                </div>
                
                {isSupabaseEnabled() && user && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white text-sm sm:text-base font-semibold rounded-xl backdrop-blur-sm border border-white/30 transition-all hover:scale-105 shadow-lg"
                  >
                    <img src="/assets/icons/logout.png" className="w-5 sm:w-6 " alt="" />
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Bottom wave decoration */}
          {/* <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 30" className="w-full h-8 fill-slate-50">
              <path d="M0,30 C300,10 600,25 900,10 C1050,5 1150,15 1200,10 L1200,30 Z"></path>
            </svg>
          </div> */}
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {/* Cột trái: Input - Sticky */}
          <div className="lg:sticky lg:top-6">
            <WeekManager 
              weeks={weeks}
              onSaveWeek={handleSaveWeek}
              onDeleteWeek={handleDeleteWeek}
            />
            <AutoAPIFetcher onInvoiceParsed={handleInvoiceParsed} />
            <CustomInvoiceInput onInvoiceParsed={handleInvoiceParsed} />
            <InvoiceInput onInvoiceParsed={handleInvoiceParsed} />
            <InvoiceHistory 
              history={history} 
              onViewHistory={handleViewHistory}
              onClearHistory={handleClearHistory}
            />
          </div>

          {/* Cột phải: Result */}
          <div>
            {currentInvoice && (
              <InvoiceResult 
                invoice={currentInvoice} 
                weeks={weeks}
                onWeekSelect={handleWeekSelect}
              />
            )}
            <WeeklySummary 
              history={history} 
              weeks={weeks}
              onEditInvoice={handleEditInvoice}
              onDeleteInvoice={handleDeleteInvoice}
            />
          </div>
        </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-neutral-200 bg-white mt-8 sm:mt-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <p className="text-xs sm:text-sm text-neutral-500 text-center">
              💡 Ứng dụng đang thử nghiệm. Vui lòng kiểm tra kỹ hóa đơn gốc.
            </p>
            <p className="text-xs sm:text-md text-neutral-600 text-center mt-2">
              © 2025 - A product of  <a href="https://kms-technology.com/" target='_blank' className="text-indigo-600 font-semibold hover:underline ">KMS Technology</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App
