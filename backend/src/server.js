import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// IP Whitelist từ .env (phân cách bằng dấu phẩy)
const ALLOWED_IPS = process.env.ALLOWED_IPS 
  ? process.env.ALLOWED_IPS.split(',').map(ip => ip.trim())
  : []

const ALLOWED_LOCAL_RANGES = process.env.ALLOWED_LOCAL_RANGES
  ? process.env.ALLOWED_LOCAL_RANGES.split(',').map(range => range.trim())
  : ['192.168.1.', '192.168.0.', '10.0.0.']

// Middleware: Get client IP
function getClientIP(req) {
  // Check headers for proxy IP
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  // Check other common headers
  const realIP = req.headers['x-real-ip']
  if (realIP) return realIP
  
  // Fallback to direct connection IP
  const remoteIP = req.socket.remoteAddress || req.connection.remoteAddress
  
  // Convert IPv6 localhost to IPv4
  if (remoteIP === '::1' || remoteIP === '::ffff:127.0.0.1') {
    return '127.0.0.1'
  }
  
  // Remove IPv6 prefix if present
  return remoteIP?.replace('::ffff:', '') || 'unknown'
}

// Middleware: Check IP whitelist
function checkIPWhitelist(req, res, next) {
  const clientIP = getClientIP(req)
  
  // Allow localhost for development
  if (clientIP === '127.0.0.1' || clientIP === 'localhost') {
    return next()
  }
  
  // Check if IP is in whitelist
  if (ALLOWED_IPS.length > 0 && ALLOWED_IPS.includes(clientIP)) {
    return next()
  }
  
  // Check if IP is in local network range
  const isLocalNetwork = ALLOWED_LOCAL_RANGES.some(range => 
    clientIP.startsWith(range)
  )
  
  if (isLocalNetwork) {
    return next()
  }
  
  // IP not allowed
  console.warn(`❌ Access denied from IP: ${clientIP}`)
  return res.status(403).json({ 
    error: 'Access denied',
    message: 'This application can only be accessed from the room WiFi',
    clientIP: clientIP
  })
}

// Middleware
app.use(cors())
app.use(express.json())

// Apply IP whitelist to all routes (except health check and KFM proxy)
app.use((req, res, next) => {
  if (req.path === '/api/health' || req.path === '/api/proxy/kingfoodmart') {
    return next()
  }
  checkIPWhitelist(req, res, next)
})

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Bill Splitter API is running' })
})

// Check IP access (for frontend to verify before loading app)
app.get('/api/check-access', (req, res) => {
  const clientIP = getClientIP(req)
  res.json({ 
    allowed: true, 
    clientIP: clientIP,
    message: 'Access granted from room WiFi'
  })
})

// CORS Proxy for KingFoodMart API
app.post('/api/proxy/kingfoodmart', async (req, res) => {
  try {
    const { orderCode, cookie } = req.body
    
    if (!orderCode) {
      return res.status(400).json({ error: 'orderCode is required' })
    }

    const graphqlQuery = `query EcomOrderDetail2($code: String!) {
  ecomOrderDetail2(code: $code) {
    groupOrders {
      orders {
        code
        orderDate
        totalAmount
        undiscountedTotalAmount
        totalDiscount
        phone
        products {
          productName
          quantity
          discountPrice
          originalPrice
          unit
        }
        accumulatedPoint {
          point
        }
      }
    }
  }
}`

    const headers = {
      'Content-Type': 'application/json',
      'Accept': '*/*'
    }
    
    // Add cookie if provided
    if (cookie && cookie.trim()) {
      headers['Cookie'] = cookie
    }

    const response = await fetch('https://onelife-api.kingfoodmart.com/v1/gateway/', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        operationName: 'EcomOrderDetail2',
        variables: { code: orderCode },
        query: graphqlQuery
      })
    })

    if (!response.ok) {
      throw new Error(`KFM API Error: ${response.status}`)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: error.message })
  }
})

// TODO: Add more routes in Phase 2
// - POST /api/invoices - Save invoice to database
// - GET /api/invoices - Get user's invoices
// - GET /api/invoices/:id - Get specific invoice
// - DELETE /api/invoices/:id - Delete invoice

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📡 Network: http://192.168.1.2:${PORT}`)
})
