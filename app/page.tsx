"use client"

import { useState, useEffect } from "react"
import { CartPage } from "@/components/cart-page"
import { CheckoutPage } from "@/components/checkout-page"
import { PaymentPage } from "@/components/payment-page"
import { SuccessPage } from "@/components/success-page"
import { CartProvider, useCart } from "@/lib/cart-context"

type PageState = "cart" | "checkout" | "payment" | "success"

function HomeContent() {
  const [currentPage, setCurrentPage] = useState<PageState>("cart")
  const { addItemFromStore } = useCart()

  useEffect(() => {
    // Handle NFC product additions from URL
    // Format: productID/storeID/cart.com or ?productId=XXX&storeId=YYY
    const handleNFCURL = async () => {
      // Check URL params first
      const params = new URLSearchParams(window.location.search)
      let productId = params.get("productId")
      let storeId = params.get("storeId")

      // If not in params, check pathname format: productID/storeID/cart.com
      if (!productId || !storeId) {
        const pathname = window.location.pathname
        // Try to parse pathname like /PROD001/STORE001/cart.com
        const pathParts = pathname.split("/").filter(Boolean)
        if (pathParts.length >= 2) {
          // Check if last part contains "cart"
          const lastPart = pathParts[pathParts.length - 1]
          if (lastPart.includes("cart")) {
            productId = pathParts[pathParts.length - 2]
            storeId = pathParts[pathParts.length - 3]
          } else {
            productId = pathParts[pathParts.length - 1]
            storeId = pathParts[pathParts.length - 2]
          }
        }
      }

      if (productId && storeId) {
        try {
          await addItemFromStore(productId, storeId)
          // Navigate to cart page
          setCurrentPage("cart")
          // Clean up URL
          window.history.replaceState({}, document.title, "/")
        } catch (error) {
          console.error("Failed to add product from NFC:", error)
          // Still navigate to cart, but show error
          setCurrentPage("cart")
          window.history.replaceState({}, document.title, "/")
        }
      }
    }

    handleNFCURL()
  }, [addItemFromStore])

  return (
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
  )
}

export default function Home() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  )
}
