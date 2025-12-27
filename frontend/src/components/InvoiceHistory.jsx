export default function InvoiceHistory({ history, onViewHistory, onClearHistory }) {
  if (history.length === 0) return null

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📚 Lịch sử</h2>
        <button
          onClick={onClearHistory}
          className="text-sm text-red-600 hover:text-red-800 font-semibold"
        >
          🗑️ Xóa tất cả
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.slice().reverse().map((invoice) => (
          <div
            key={invoice.id}
            onClick={() => onViewHistory(invoice)}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{invoice.store}</p>
                <p className="text-xs text-gray-600">
                  {new Date(invoice.date).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{invoice.total.toLocaleString('vi-VN')}₫</p>
                <p className="text-sm text-green-600">Mỗi người: {(invoice.total / 2).toLocaleString('vi-VN')}₫</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
