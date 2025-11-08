"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { fetchProductByCustomId } from "./store-api"
import type { StoreProduct } from "./store-api"

export interface CartProduct {
  id: string
  customId: string
  name: string
  price: number
  image: string
  storeId: string
}

interface CartContextType {
  items: CartProduct[]
  addItem: (product: CartProduct) => void
  addItemFromStore: (customId: string, storeId: string) => Promise<void>
  removeItem: (productId: string) => void
  clearCart: () => void
  total: number
  isLoading: boolean
  error: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartProduct[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

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
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(newItems))
      }
      calculateTotal(newItems)
      return newItems
    })
  }

  const addItemFromStore = async (customId: string, storeId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const storeProduct: StoreProduct = await fetchProductByCustomId(customId, storeId)
      
      const cartProduct: CartProduct = {
        id: storeProduct.id,
        customId: storeProduct.id,
        name: storeProduct.name,
        price: storeProduct.price,
        image: storeProduct.image,
        storeId: storeProduct.storeId,
      }
      
      addItem(cartProduct)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add product to cart"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.id !== productId)
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(newItems))
      }
      calculateTotal(newItems)
      return newItems
    })
  }

  const clearCart = () => {
    setItems([])
    setTotal(0)
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart")
    }
  }

  return (
    <CartContext.Provider value={{ items, addItem, addItemFromStore, removeItem, clearCart, total, isLoading, error }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
