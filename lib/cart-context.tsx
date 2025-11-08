"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartProduct {
  id: string
  name: string
  price: number
  image: string
  storeId: string
}

interface CartContextType {
  items: CartProduct[]
  addItem: (product: CartProduct) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartProduct[]>([])
  const [total, setTotal] = useState(0)

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        const parsedItems = JSON.parse(saved)
        setItems(parsedItems)
        calculateTotal(parsedItems)
      } catch (e) {
        console.error("Failed to load cart:", e)
      }
    }

    // Listen for NFC/URL product additions
    const handleNFCAdd = (e: CustomEvent) => {
      const product = e.detail as CartProduct
      addItem(product)
    }

    window.addEventListener("nfc-product-add", handleNFCAdd as EventListener)
    return () => window.removeEventListener("nfc-product-add", handleNFCAdd as EventListener)
  }, [])

  const calculateTotal = (cartItems: CartProduct[]) => {
    const sum = cartItems.reduce((acc, item) => acc + item.price, 0)
    setTotal(sum)
  }

  const addItem = (product: CartProduct) => {
    setItems((prev) => {
      const newItems = [...prev, product]
      localStorage.setItem("cart", JSON.stringify(newItems))
      calculateTotal(newItems)
      return newItems
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.id !== productId)
      localStorage.setItem("cart", JSON.stringify(newItems))
      calculateTotal(newItems)
      return newItems
    })
  }

  const clearCart = () => {
    setItems([])
    setTotal(0)
    localStorage.removeItem("cart")
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>{children}</CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
