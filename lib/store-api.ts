// API client for communicating with store side

const STORE_API_BASE_URL = process.env.NEXT_PUBLIC_STORE_API_URL || "http://localhost:3001"

export interface StoreProduct {
  id: string
  productId: number
  storeId: string
  name: string
  price: number
  stock: number
  category: string
  image: string
}

export interface PurchaseItem {
  customId: string
  quantity: number
  price: number
  name: string
}

export interface PurchaseRequest {
  storeId: string
  customerName?: string
  customerPhone: string
  items: PurchaseItem[]
  totalAmount: number
  transactionId?: string
  paymentMethod?: string
}

export interface PurchaseResponse {
  success: boolean
  purchaseIds: number[]
  customerId: number
  message: string
}

/**
 * Fetch product by custom_id and store_id from store API
 */
export async function fetchProductByCustomId(
  customId: string,
  storeId: string
): Promise<StoreProduct> {
  const url = new URL(`${STORE_API_BASE_URL}/api/public/products`)
  url.searchParams.set("customId", customId)
  url.searchParams.set("storeId", storeId)

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch product" }))
    throw new Error(error.error || "Failed to fetch product")
  }

  return response.json()
}

/**
 * Create payment order using store's Razorpay account
 */
export async function createPaymentOrder(
  storeId: string,
  amount: number,
  currency: string = "INR"
): Promise<{ success: boolean; orderId: string; amount: number; currency: string; key: string }> {
  const response = await fetch(`${STORE_API_BASE_URL}/api/public/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storeId, amount, currency }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to create payment order" }))
    throw new Error(error.error || "Failed to create payment order")
  }

  return response.json()
}

/**
 * Verify payment using store's Razorpay account
 */
export async function verifyPayment(
  storeId: string,
  orderId: string,
  paymentId: string,
  signature: string,
  amount: number
): Promise<{ success: boolean; transactionId: string; orderId: string; paymentId: string; amount: number }> {
  const response = await fetch(`${STORE_API_BASE_URL}/api/public/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storeId, orderId, paymentId, signature, amount }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to verify payment" }))
    throw new Error(error.error || "Failed to verify payment")
  }

  return response.json()
}

/**
 * Submit purchase to store API
 */
export async function submitPurchase(purchase: PurchaseRequest): Promise<PurchaseResponse> {
  const response = await fetch(`${STORE_API_BASE_URL}/api/public/purchases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(purchase),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to submit purchase" }))
    throw new Error(error.error || "Failed to submit purchase")
  }

  return response.json()
}

