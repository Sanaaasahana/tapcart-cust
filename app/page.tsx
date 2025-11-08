"use client"

import { useState, useEffect } from "react"
import { CartPage } from "@/components/cart-page"
import { CheckoutPage } from "@/components/checkout-page"
import { PaymentPage } from "@/components/payment-page"
import { SuccessPage } from "@/components/success-page"
import { CartProvider } from "@/lib/cart-context"

type PageState = "cart" | "checkout" | "payment" | "success"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageState>("cart")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)

    // Handle NFC product additions from URL params
    const params = new URLSearchParams(window.location.search)
    const productId = params.get("productId")
    const storeId = params.get("storeId")

    if (productId && storeId) {
      // Product will be added via context
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-ring">
          <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <CartProvider>
      <main className="min-h-screen bg-background">
        {currentPage === "cart" && <CartPage onCheckout={() => setCurrentPage("checkout")} />}
        {currentPage === "checkout" && (
          <CheckoutPage onProceed={() => setCurrentPage("payment")} onBack={() => setCurrentPage("cart")} />
        )}
        {currentPage === "payment" && (
          <PaymentPage onSuccess={() => setCurrentPage("success")} onBack={() => setCurrentPage("checkout")} />
        )}
        {currentPage === "success" && <SuccessPage />}
      </main>
    </CartProvider>
  )
}
