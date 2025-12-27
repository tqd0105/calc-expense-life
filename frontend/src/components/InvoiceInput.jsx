import { useState } from 'react'
import { parseInvoiceHTML, DEMO_DATA_BHX, DEMO_DATA_KFM } from '../utils/htmlParser'

export default function InvoiceInput({ onInvoiceParsed }) {
  const [htmlInput, setHtmlInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDemo = (data) => {
    onInvoiceParsed(data)
    setError('')
  }

  const handleParse = () => {
    if (!htmlInput.trim()) {
      setError('Vui lòng nhập JSON hoặc HTML hóa đơn')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = parseInvoiceHTML(htmlInput)
      
      if (!result || result.items.length === 0) {
        setError('Không thể phân tích hóa đơn. Vui lòng kiểm tra lại dữ liệu.')
        setLoading(false)
        return
      }

      onInvoiceParsed(result)
      setHtmlInput('') // Clear input sau khi parse thành công
    } catch (err) {
      setError('Lỗi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card mb-6">
      <div className="flex  items-center">
      <img src="assets/icons/manual.png" alt="Manual Input" className=" w-8 h-8 mr-2" />
      <h2 className="text-2xl font-bold text-gray-800"> Lấy đơn hàng thủ công</h2>
      </div>
      
      {/* Demo Button */}
      {/* <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 my-2">Thử với dữ liệu mẫu:</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDemo(DEMO_DATA_BHX)}
            className="py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
          >
            <img src="assets/icons/bhx.png" alt="Bách Hóa Xanh" className="inline-block rounded-full shadow-lg w-8 h-8 mr-2" />
             Bách Hóa Xanh
          </button>
          <button
            onClick={() => handleDemo(DEMO_DATA_KFM)}
            className="py-3 px-4 bg-gradient-to-r from-orange-300 to-red-400 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg"
          >
            <img src="assets/icons/kfm.png" alt="KingFoodMart" className="inline-block rounded-full shadow-lg w-8 h-8 mr-2" />
             KingFoodMart
          </button>
        </div>
      </div> */}

      {/* <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">HOẶC</span>
        </div>
      </div> */}
      
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold my-2">
          Paste JSON từ API hoặc HTML:
        </label>
        <textarea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          placeholder="Cách 1 (Khuyến nghị): Copy JSON từ Network tab&#10;Cách 2: Copy HTML từ Elements tab"
          className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleParse}
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Đang phân tích...' : '🔍 Phân tích hóa đơn'}
      </button>

      {/* <div className="mt-4 text-sm text-gray-600">
        <p className="font-semibold mb-2">💡 Hướng dẫn (Chọn 1 trong 2):</p>
        
        <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="font-semibold text-green-800 mb-1">✅ Cách 1: Copy JSON từ API (Khuyến nghị)</p>
          <div className="mb-2">
            <p className="font-medium text-sm text-gray-700 mb-1">Bách Hóa Xanh:</p>
            <ol className="list-decimal ml-5 space-y-1 text-sm">
              <li>Mở hóa đơn trên bachhoaxanh.com</li>
              <li>F12 → Tab <strong>Network</strong> → Tìm <code className="bg-gray-200 px-1 rounded">GetDetailHistory</code></li>
              <li>Tab <strong>Response</strong> → Copy toàn bộ JSON</li>
            </ol>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-700 mb-1">KingFoodMart:</p>
            <ol className="list-decimal ml-5 space-y-1 text-sm">
              <li>Mở hóa đơn trên kingfoodmart.com</li>
              <li>F12 → Tab <strong>Network</strong> → Tìm <code className="bg-gray-200 px-1 rounded">gateway</code></li>
              <li>Tab <strong>Response</strong> → Copy toàn bộ JSON</li>
            </ol>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-semibold text-blue-800 mb-1">Cách 2: Copy HTML (Backup)</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Mở hóa đơn → Đợi load hết sản phẩm</li>
            <li>F12 → Tab <strong>Elements</strong> → Chuột phải vào <code className="bg-gray-200 px-1 rounded">&lt;html&gt;</code></li>
            <li>Chọn "Copy" → "Copy outerHTML"</li>
            <li>Paste vào ô trên</li>
          </ol>
        </div>
      </div> */}
    </div>
  )
}
