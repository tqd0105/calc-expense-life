import * as cheerio from 'cheerio'

/**
 * Parse hóa đơn từ HTML hoặc JSON API
 * @param {string} input - HTML source code hoặc JSON string
 * @returns {object} - Invoice data
 */
export function parseInvoiceHTML(input) {
  // Try parse as JSON first
  try {
    const jsonData = JSON.parse(input)
    
    // Detect Bách Hóa Xanh API
    if (jsonData.data && jsonData.data.deliveryList) {
      return parseBachHoaXanhJSON(jsonData)
    }
    
    // Detect KingFoodMart API
    if (jsonData.data && jsonData.data.ecomOrderDetail2) {
      return parseKingFoodMartJSON(jsonData)
    }
  } catch (e) {
    // Not JSON, continue with HTML parsing
  }

  // Parse as HTML
  const $ = cheerio.load(input)
  
  // Detect store type
  let storeType = 'unknown'
  if (input.includes('bachhoaxanh') || input.includes('Bach Hoa Xanh')) {
    storeType = 'bachhoaxanh'
  } else if (input.includes('kingfoodmart') || input.includes('King Food Mart')) {
    storeType = 'kingfoodmart'
  }

  // Parse based on store
  if (storeType === 'bachhoaxanh') {
    return parseBachHoaXanhHTML($, input)
  } else if (storeType === 'kingfoodmart') {
    return parseKingFoodMartHTML($, input)
  } else {
    return parseGeneric($, input)
  }
}

/**
 * Parse JSON từ API Bách Hóa Xanh
 */
function parseBachHoaXanhJSON(jsonData) {
  const data = jsonData.data
  const delivery = data.deliveryList[0]
  const items = []

  // Parse items
  delivery.deliveryDetailList.forEach(item => {
    const quantity = item.quantity
    const unitValue = item.quantityUnitValue || `${quantity}`
    
    items.push({
      name: item.productName,
      price: item.salePrice * quantity,
      quantity: quantity,
      unitPrice: item.salePrice,
      unit: unitValue
    })
  })

  return {
    store: 'Bách Hóa Xanh',
    storeType: 'bachhoaxanh',
    orderCode: data.customerDemand,
    date: new Date(data.inputTime).toISOString(),
    address: data.address,
    outputStore: delivery.outputStoreName,
    items,
    total: data.cartTotalAmount,
    shippingCost: data.totalShippingCost,
    discount: data.totalDiscount,
    rewardPoints: data.rewardPoints
  }
}

/**
 * Parse JSON từ API KingFoodMart
 */
function parseKingFoodMartJSON(jsonData) {
  const orderDetail = jsonData.data.ecomOrderDetail2.groupOrders[0].orders[0]
  const items = []

  // Parse items
  orderDetail.products.forEach(product => {
    const quantity = product.quantity
    const totalPrice = product.discountPrice * quantity
    
    items.push({
      name: product.productName,
      price: totalPrice,
      quantity: quantity,
      unitPrice: product.discountPrice,
      originalPrice: product.originalPrice,
      unit: product.unit,
      isDiscount: product.discountPrice < product.originalPrice
    })
  })

  return {
    store: 'KingFoodMart',
    storeType: 'kingfoodmart',
    orderCode: orderDetail.code,
    date: new Date(orderDetail.orderDate).toISOString(),
    address: orderDetail.phone,
    outputStore: 'KingFoodMart',
    items,
    total: orderDetail.totalAmount,
    originalTotal: orderDetail.undiscountedTotalAmount,
    discount: orderDetail.totalDiscount,
    shippingCost: 0,
    rewardPoints: orderDetail.accumulatedPoint?.point || 0
  }
}

/**
 * Parser HTML cho Bách Hóa Xanh (fallback)
 */
function parseBachHoaXanhHTML($, html) {
  const items = []
  let total = 0
  let orderCode = ''
  let date = ''

  // TODO: Cập nhật selectors sau khi có HTML thật
  // Đây là template, cần điều chỉnh theo cấu trúc HTML thực tế
  
  // Tìm mã đơn hàng (thường có pattern OV...)
  const orderCodeMatch = html.match(/OV\d+/i)
  if (orderCodeMatch) {
    orderCode = orderCodeMatch[0]
  }

  // Tìm ngày (nhiều format khác nhau)
  const dateMatch = html.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (dateMatch) {
    date = dateMatch[0]
  }

  // Parse items - cần xem HTML thực để biết selector chính xác
  // Các pattern có thể có:
  // - <div class="product-item">
  // - <tr class="order-item">
  // - data-product-name, data-product-price
  
  // Tạm thời dùng pattern chung
  $('[class*="product"], [class*="item"], tr').each((_, el) => {
    const $el = $(el)
    const text = $el.text()
    
    // Tìm tên sản phẩm
    const name = $el.find('[class*="name"], [class*="title"], td:first').text().trim()
    
    // Tìm giá (pattern: số + đ hoặc ₫)
    const priceMatch = text.match(/([\d,\.]+)\s*[đ₫]/i)
    const price = priceMatch ? parsePrice(priceMatch[1]) : 0
    
    // Tìm số lượng
    const qtyMatch = text.match(/SL:?\s*(\d+)|x\s*(\d+)/i)
    const quantity = qtyMatch ? parseInt(qtyMatch[1] || qtyMatch[2]) : 1

    if (name && price > 0) {
      items.push({ name, price, quantity })
    }
  })

  // Tìm tổng tiền (thường ở cuối, có text "tổng" hoặc "total")
  const totalTexts = $('[class*="total"], [class*="sum"], strong, b').toArray()
  for (const el of totalTexts) {
    const text = $(el).text()
    if (/tổng|total|sum/i.test(text)) {
      const priceMatch = text.match(/([\d,\.]+)\s*[đ₫]/i)
      if (priceMatch) {
        total = parsePrice(priceMatch[1])
        break
      }
    }
  }

  // Fallback: tính tổng từ items nếu không tìm thấy
  if (total === 0 && items.length > 0) {
    total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  }

  return {
    store: 'Bách Hóa Xanh',
    storeType: 'bachhoaxanh',
    orderCode,
    date,
    items,
    total
  }
}

/**
 * Parser HTML cho KingFoodMart (fallback)
 */
function parseKingFoodMartHTML($, html) {
  const items = []
  let total = 0
  let orderCode = ''
  let date = ''

  // TODO: Cập nhật selectors sau khi có HTML thật
  // Tương tự như Bách Hóa Xanh, cần điều chỉnh theo cấu trúc thực tế

  const orderCodeMatch = html.match(/\b[A-Z]{2,}\d+\b/i)
  if (orderCodeMatch) {
    orderCode = orderCodeMatch[0]
  }

  const dateMatch = html.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
  if (dateMatch) {
    date = dateMatch[0]
  }

  // Parse items (tương tự BHX)
  $('[class*="product"], [class*="item"], tr').each((_, el) => {
    const $el = $(el)
    const text = $el.text()
    
    const name = $el.find('[class*="name"], [class*="title"], td:first').text().trim()
    const priceMatch = text.match(/([\d,\.]+)\s*[đ₫]/i)
    const price = priceMatch ? parsePrice(priceMatch[1]) : 0
    const qtyMatch = text.match(/SL:?\s*(\d+)|x\s*(\d+)/i)
    const quantity = qtyMatch ? parseInt(qtyMatch[1] || qtyMatch[2]) : 1

    if (name && price > 0) {
      items.push({ name, price, quantity })
    }
  })

  // Tìm tổng tiền
  const totalTexts = $('[class*="total"], [class*="sum"], strong, b').toArray()
  for (const el of totalTexts) {
    const text = $(el).text()
    if (/tổng|total|sum/i.test(text)) {
      const priceMatch = text.match(/([\d,\.]+)\s*[đ₫]/i)
      if (priceMatch) {
        total = parsePrice(priceMatch[1])
        break
      }
    }
  }

  if (total === 0 && items.length > 0) {
    total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  }

  return {
    store: 'KingFoodMart',
    storeType: 'kingfoodmart',
    orderCode,
    date,
    items,
    total
  }
}

/**
 * Generic parser cho các trang khác
 */
function parseGeneric($, html) {
  const items = []
  let total = 0

  // Tìm tất cả các số tiền trong trang
  const pricePattern = /([\d,\.]+)\s*[đ₫]/gi
  const matches = html.matchAll(pricePattern)
  
  const prices = Array.from(matches, m => parsePrice(m[1]))
    .filter(p => p > 0)
    .sort((a, b) => b - a)

  // Giả sử số lớn nhất là tổng
  total = prices[0] || 0

  // Các số còn lại là items
  prices.slice(1).forEach((price, index) => {
    items.push({
      name: `Sản phẩm ${index + 1}`,
      price,
      quantity: 1
    })
  })

  return {
    store: 'Cửa hàng khác',
    storeType: 'generic',
    orderCode: '',
    date: new Date().toLocaleDateString('vi-VN'),
    items,
    total
  }
}

/**
 * Parse giá tiền từ string
 */
function parsePrice(priceStr) {
  if (!priceStr) return 0
  return parseInt(priceStr.replace(/[,\.]/g, '').trim())
}

/**
 * Demo data mẫu - Bách Hóa Xanh
 */
export const DEMO_DATA_BHX = {
  store: 'Bách Hóa Xanh',
  storeType: 'bachhoaxanh',
  orderCode: 'OV209272511223011',
  date: new Date().toISOString(),
  address: '342 - 342A Nguyễn Duy Trinh, ấp Trung 2, Phường Bình Trị Đông, TP HCM',
  outputStore: 'BHX_HCM_TDU - 342 Nguyễn Duy Trinh',
  items: [
    {
      name: 'HÀNH LÁ GÓI 100G',
      price: 8500,
      quantity: 1,
      unitPrice: 8500,
      unit: '1'
    },
    {
      name: 'DƯA HẤU KHÔNG HẠT',
      price: 51424,
      quantity: 2.306,
      unitPrice: 22300,
      unit: '2.306kg'
    },
    {
      name: 'BÍ XANH',
      price: 14070,
      quantity: 0.402,
      unitPrice: 35000,
      unit: '402g'
    }
  ],
  total: 73994,
  shippingCost: 0,
  discount: 0,
  rewardPoints: 740
}

/**
 * Demo data mẫu - KingFoodMart
 */
export const DEMO_DATA_KFM = {
  store: 'KingFoodMart',
  storeType: 'kingfoodmart',
  orderCode: 'KP039840384',
  date: new Date().toISOString(),
  address: '0779461536',
  outputStore: 'KingFoodMart',
  items: [
    {
      name: 'Rau nêm hỗn hợp VietGap gói 80g (1 Gói)',
      price: 12900,
      quantity: 1,
      unitPrice: 12900,
      unit: '1 GÓI'
    },
    {
      name: 'Đậu hũ non Vị Nguyên 280g (1 hộp)',
      price: 14000,
      quantity: 1,
      unitPrice: 14000,
      unit: '1 hộp'
    },
    {
      name: 'Cà tím Đà Lạt VietGAP 400g (2 Quả)',
      price: 17175,
      quantity: 1,
      unitPrice: 17175,
      originalPrice: 22900,
      unit: 'Quả',
      isDiscount: true
    },
    {
      name: 'Cà chua beef VietGAP Đà Lạt (1 kg)',
      price: 12580,
      quantity: 0.2,
      unitPrice: 62900,
      unit: '1 KG'
    }
  ],
  total: 56655,
  shippingCost: 0,
  discount: 0,
  rewardPoints: 39
}

// Default demo data
export const DEMO_DATA = DEMO_DATA_BHX
