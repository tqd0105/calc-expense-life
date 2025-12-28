import { supabase, isSupabaseEnabled } from '../lib/supabase'

// ============================================
// WEEKS (Tuần)
// ============================================

export async function getWeeks() {
  if (!isSupabaseEnabled()) {
    const saved = localStorage.getItem('weeks')
    return saved ? JSON.parse(saved) : []
  }

  const { data, error } = await supabase
    .from('weeks')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) throw error
  
  // Convert from database format to frontend format
  return (data || []).map(week => ({
    id: week.id,
    name: week.name,
    startDate: week.start_date,
    endDate: week.end_date,
    isPaid: week.is_paid || false
  }))
}

export async function saveWeek(week) {
  if (!isSupabaseEnabled()) {
    const weeks = JSON.parse(localStorage.getItem('weeks') || '[]')
    const existing = weeks.find(w => w.id === week.id)
    const newWeeks = existing
      ? weeks.map(w => w.id === week.id ? week : w)
      : [...weeks, week]
    localStorage.setItem('weeks', JSON.stringify(newWeeks))
    return week
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  const weekData = {
    id: week.id,
    name: week.name,
    start_date: week.startDate,
    end_date: week.endDate,
    is_paid: week.isPaid || false,
    user_id: user.id
  }

  const { data, error } = await supabase
    .from('weeks')
    .upsert(weekData)
    .select()
    .single()

  if (error) throw error
  
  // Convert back to frontend format
  return {
    id: data.id,
    name: data.name,
    startDate: data.start_date,
    endDate: data.end_date,
    isPaid: data.is_paid || false
  }
}

export async function deleteWeek(weekId) {
  if (!isSupabaseEnabled()) {
    const weeks = JSON.parse(localStorage.getItem('weeks') || '[]')
    const newWeeks = weeks.filter(w => w.id !== weekId)
    localStorage.setItem('weeks', JSON.stringify(newWeeks))
    return
  }

  const { error } = await supabase
    .from('weeks')
    .delete()
    .eq('id', weekId)

  if (error) throw error
}

// ============================================
// INVOICES (Hóa đơn)
// ============================================

export async function getInvoices() {
  if (!isSupabaseEnabled()) {
    const saved = localStorage.getItem('invoiceHistory')
    return saved ? JSON.parse(saved) : []
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  
  // Convert from database format to frontend format
  return data.map(inv => ({
    id: inv.id,
    orderCode: inv.order_code,
    store: inv.store,
    total: parseFloat(inv.total),
    date: inv.date,
    weekId: inv.week_id,
    items: inv.items,
    orderDate: inv.date
  }))
}

export async function saveInvoice(invoice) {
  if (!isSupabaseEnabled()) {
    const history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]')
    const newHistory = [...history, invoice]
    localStorage.setItem('invoiceHistory', JSON.stringify(newHistory))
    return invoice
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  const invoiceData = {
    id: invoice.id,
    order_code: invoice.orderCode,
    store: invoice.store,
    total: invoice.total,
    date: invoice.date || new Date().toISOString(),
    week_id: invoice.weekId || null,
    items: invoice.items,
    user_id: user.id
  }

  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single()

  if (error) throw error
  
  return {
    id: data.id,
    orderCode: data.order_code,
    store: data.store,
    total: parseFloat(data.total),
    date: data.date,
    weekId: data.week_id,
    items: data.items,
    orderDate: data.date
  }
}

export async function updateInvoice(invoiceId, updates) {
  if (!isSupabaseEnabled()) {
    const history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]')
    const newHistory = history.map(inv => 
      inv.id === invoiceId ? { ...inv, ...updates } : inv
    )
    localStorage.setItem('invoiceHistory', JSON.stringify(newHistory))
    return
  }

  // Map frontend fields to database fields
  const dbUpdates = {}
  if (updates.weekId !== undefined) dbUpdates.week_id = updates.weekId
  if (updates.orderCode !== undefined) dbUpdates.order_code = updates.orderCode
  if (updates.store !== undefined) dbUpdates.store = updates.store
  if (updates.total !== undefined) dbUpdates.total = updates.total
  if (updates.items !== undefined) dbUpdates.items = updates.items
  if (updates.date !== undefined) dbUpdates.date = updates.date

  const { error } = await supabase
    .from('invoices')
    .update(dbUpdates)
    .eq('id', invoiceId)

  if (error) throw error
}

export async function deleteInvoice(invoiceId) {
  if (!isSupabaseEnabled()) {
    const history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]')
    const newHistory = history.filter(inv => inv.id !== invoiceId)
    localStorage.setItem('invoiceHistory', JSON.stringify(newHistory))
    return
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)

  if (error) throw error
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToWeeks(callback) {
  if (!isSupabaseEnabled()) return () => {}

  const channel = supabase
    .channel('weeks-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'weeks' }, 
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToInvoices(callback) {
  if (!isSupabaseEnabled()) return () => {}

  const channel = supabase
    .channel('invoices-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'invoices' }, 
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// ============================================
// PAYMENTS (Lịch sử thanh toán)
// ============================================

export async function getPayments() {
  if (!isSupabaseEnabled()) {
    const saved = localStorage.getItem('payments')
    return saved ? JSON.parse(saved) : []
  }

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('payment_date', { ascending: false })

  if (error) throw error
  
  return (data || []).map(p => ({
    id: p.id,
    weekId: p.week_id,
    payerName: p.payer_name,
    amount: parseFloat(p.amount),
    paymentDate: p.payment_date,
    note: p.note,
    createdAt: p.created_at
  }))
}

export async function savePayment(payment) {
  if (!isSupabaseEnabled()) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]')
    const newPayment = {
      ...payment,
      id: payment.id || Date.now(),
      createdAt: new Date().toISOString()
    }
    payments.unshift(newPayment)
    localStorage.setItem('payments', JSON.stringify(payments))
    return newPayment
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  const paymentData = {
    week_id: payment.weekId || null,
    payer_name: payment.payerName,
    amount: payment.amount,
    payment_date: payment.paymentDate || new Date().toISOString(),
    note: payment.note || null,
    user_id: user.id
  }

  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()

  if (error) throw error
  
  return {
    id: data.id,
    weekId: data.week_id,
    payerName: data.payer_name,
    amount: parseFloat(data.amount),
    paymentDate: data.payment_date,
    note: data.note,
    createdAt: data.created_at
  }
}

export async function deletePayment(paymentId) {
  if (!isSupabaseEnabled()) {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]')
    const newPayments = payments.filter(p => p.id !== paymentId)
    localStorage.setItem('payments', JSON.stringify(newPayments))
    return
  }

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)

  if (error) throw error
}

export function subscribeToPayments(callback) {
  if (!isSupabaseEnabled()) return () => {}

  const channel = supabase
    .channel('payments-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'payments' }, 
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
