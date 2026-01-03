import { useState } from 'react'

export default function CustomInvoiceInput({ onInvoiceParsed }) {
  const [showForm, setShowForm] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [items, setItems] = useState([{ name: '', price: '', quantity: 1 }])
  const [error, setError] = useState('')
  const [isNotSplit, setIsNotSplit] = useState(false)

  const addItem = () => {
    setItems([...items, { name: '', price: '', quantity: 1 }])
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Validate
    if (!storeName.trim()) {
      setError('Vui lòng nhập tên cửa hàng')
      return
    }

    const validItems = items.filter(item => item.name.trim() && item.price)
    if (validItems.length === 0) {
      setError('Vui lòng nhập ít nhất 1 sản phẩm')
      return
    }

    // Create invoice object
    const invoice = {
      id: Date.now(),
      orderCode: `CUSTOM-${Date.now()}`, // Generate unique order code
      store: storeName.trim(),
      date: new Date().toISOString(),
      orderDate: new Date().toISOString(),
      isNotSplit: isNotSplit, // Flag for full price, not split
      items: validItems.map(item => ({
        name: item.name.trim(),
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        total: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
      })),
      total: validItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
      }, 0)
    }

    onInvoiceParsed(invoice)
    
    // Reset form
    setStoreName('')
    setItems([{ name: '', price: '', quantity: 1 }])
    setIsNotSplit(false)
    setShowForm(false)
  }

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
    }, 0)
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full mb-4 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <span className="text-xl">✏️</span>
        Nhập hóa đơn tùy chỉnh
      </button>
    )
  }

  return (
    <div className="card mb-4 border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-purple-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-violet-800 flex items-center gap-2">
          ✏️ Nhập hóa đơn tùy chỉnh
        </h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Store name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tên cửa hàng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="VD: Cửa hàng ABC, Chợ, Siêu thị..."
            className="input-field text-sm"
          />
        </div>

        {/* Items */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Danh sách sản phẩm <span className="text-red-500">*</span>
          </label>
          
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="Tên sản phẩm"
                  className="flex-1 px-2 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  placeholder="SL"
                  min="1"
                  className="w-12 px-2 py-2 border-2 border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', e.target.value)}
                  placeholder="Giá"
                  className="w-20 px-2 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className=" text-red-500 hover:bg-red-50 rounded-lg"
                  disabled={items.length === 1}
                >
                  <img src="assets/icons/delete.png" width="25" height="25" alt="Xóa" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-2 text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
          >
            <span>➕</span> Thêm sản phẩm
          </button>
        </div>

        {/* Not split option */}
        <div className="mb-4">
          <label className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={isNotSplit}
              onChange={(e) => setIsNotSplit(e.target.checked)}
              className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="font-semibold text-orange-700">Không chia tiền</span>
              </div>
              <span className="text-sm text-gray-600">Hóa đơn này thuộc về một người, không cần chia cho nhóm</span>
            </div>
          </label>
        </div>

        {/* Total preview */}
        <div className="mb-4 p-3 bg-white rounded-xl border-2 border-violet-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Tổng cộng:</span>
            <span className="text-xl font-bold text-violet-600">
              {formatCurrency(calculateTotal())}đ
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all"
          >
            ✅ Thêm hóa đơn
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}
