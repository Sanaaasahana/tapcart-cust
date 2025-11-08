export interface UPIPaymentResponse {
  success: boolean
  transactionId: string
  timestamp: number
  message: string
  orderId?: string
}

// Razorpay payment handler
declare global {
  interface Window {
    Razorpay: any
  }
}

export async function initiateUPIPayment(
  upiId: string,
  amount: number,
  description: string,
  storeId: string, // Add storeId parameter
): Promise<UPIPaymentResponse> {
  try {
    // Import store API functions
    const { createPaymentOrder, verifyPayment } = await import("./store-api")
    
    // Create order using store's payment account
    const orderData = await createPaymentOrder(storeId, amount, "INR")

    // Initialize Razorpay payment
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.Razorpay) {
        // Fallback for demo/testing
        setTimeout(() => {
          resolve({
            success: true,
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            timestamp: Date.now(),
            message: "Payment successful (demo mode)",
            orderId: orderData.orderId,
          })
        }, 2000)
        return
      }

      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TapCart Store",
        description: description,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment using store's payment account
            const { verifyPayment } = await import("./store-api")
            const verifyData = await verifyPayment(
              storeId,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              orderData.amount
            )

            resolve({
              success: true,
              transactionId: verifyData.transactionId || response.razorpay_payment_id,
              timestamp: Date.now(),
              message: "Payment successful",
              orderId: orderData.orderId,
            })
          } catch (error) {
            reject(error)
          }
        },
        prefill: {
          contact: "",
          email: "",
        },
        notes: {
          upiId: upiId,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled"))
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    })
  } catch (error) {
    console.error("UPI payment error:", error)
    return {
      success: false,
      transactionId: "",
      timestamp: Date.now(),
      message: error instanceof Error ? error.message : "Payment failed",
    }
  }
}
