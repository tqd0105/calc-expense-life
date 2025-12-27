/**
 * Auto API Caller - Tự động gọi API với credentials
 */

const API_ENDPOINTS = {
  bachhoaxanh: 'https://api.bachhoaxanh.com/gw/History/GetDetailHistory',
  kingfoodmart: 'https://onelife-api.kingfoodmart.com/v1/gateway/'
}

// GraphQL query cho KingFoodMart - Simplified version
const KING_FOOD_MART_QUERY = `query EcomOrderDetail2($code: String!) {
  ecomOrderDetail2(code: $code) {
    groupOrders {
      orders {
        code
        orderDate
        totalAmount
        phone
        products {
          productName
          quantity
          discountPrice
          originalPrice
          unit
        }
      }
    }
  }
}`

/**
 * Gọi API Bách Hóa Xanh
 */
export async function fetchBachHoaXanhAPI(orderCode, credentials) {
  const { accessToken, authorization, customerId, deviceId, deviceToken, username } = credentials
  
  const response = await fetch(API_ENDPOINTS.bachhoaxanh, {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'vi-VN,vi;q=0.5',
      'access-control-allow-origin': '*',
      'accesstoken': accessToken,
      'authorization': `Bearer ${authorization}`,
      'content-type': 'application/json',
      'customer-id': customerId,
      'deviceid': deviceId,
      'devicetoken': deviceToken,
      'origin': 'https://www.bachhoaxanh.com',
      'platform': 'webnew',
      'referer': 'https://www.bachhoaxanh.com/',
      'referer-url': `https://www.bachhoaxanh.com/don-hang/${orderCode}`,
      'reversehost': 'http://bhxapi.live',
      'username': username,
      'xapikey': 'bhx-api-core-2022',
      'user-agent': navigator.userAgent
    },
    body: JSON.stringify({
      searchKey: orderCode,
      phone: username,
      wardId: 100623
    })
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Gọi API KingFoodMart qua backend proxy để bypass CORS
 */
export async function fetchKingFoodMartAPI(orderCode, credentials = {}) {
  try {
    // Gọi qua backend proxy với cookie
    const response = await fetch('http://localhost:5001/api/proxy/kingfoodmart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        orderCode,
        cookie: credentials.cookie || '' 
      })
    })

    if (!response.ok) {
      throw new Error(`Proxy Error: ${response.status} - ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('KFM API Error:', error)
    throw new Error(`Không thể lấy dữ liệu: ${error.message}. Đảm bảo backend đang chạy (npm start trong /backend)`)
  }
}

/**
 * Lưu credentials vào localStorage
 */
export function saveCredentials(store, credentials) {
  localStorage.setItem(`${store}_credentials`, JSON.stringify(credentials))
}

/**
 * Load credentials từ localStorage
 */
export function loadCredentials(store) {
  const saved = localStorage.getItem(`${store}_credentials`)
  return saved ? JSON.parse(saved) : null
}

/**
 * Xóa credentials
 */
export function clearCredentials(store) {
  localStorage.removeItem(`${store}_credentials`)
}
