"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CartItem } from "./cart-item"
import { ShoppingCart, Truck } from "lucide-react"
import { formatINR } from "@/lib/currency"

interface CartPageProps {
  onCheckout: () => void
}

export function CartPage({ onCheckout }: CartPageProps) {
  const { items, total } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Simulate adding demo products from NFC
  useEffect(() => {
    const addDemoProducts = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const productId = urlParams.get("productId")
      const storeId = urlParams.get("storeId")

      if (productId && storeId && items.length === 0) {
        // Demo products
        const demoProducts = {
          PROD001: { name: "Premium Headphones", price: 99.99 },
          PROD002: { name: "Wireless Charger", price: 29.99 },
          PROD003: { name: "Phone Case", price: 19.99 },
          PROD004: { name: "Screen Protector", price: 9.99 },
        }

        const product = demoProducts[productId as keyof typeof demoProducts]
        if (product) {
          const cartEvent = new CustomEvent("nfc-product-add", {
            detail: {
              id: productId,
              name: product.name,
              price: product.price,
              image: "/diverse-products-still-life.png",
              storeId,
            },
          })
          window.dispatchEvent(cartEvent)
        }
      }
    }

    addDemoProducts()
  }, [items.length])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in-up">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your Cart</h1>
          </div>
          <p className="text-muted-foreground">Tap products with NFC chip to add items</p>
        </div>

        {/* Cart Items */}
        <div className="mb-8">
          {items.length === 0 ? (
            <Card className="p-8 md:p-12 text-center animate-fade-in-scale">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                  <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Cart is Empty</h2>
              <p className="text-muted-foreground mb-6">Tap products with NFC chip to start adding items</p>
              <Button
                onClick={() => {
                  const testProduct = {
                    id: "DEMO001",
                    name: "Premium Wireless Headphones",
                    price: 99.99,
                    image: "/diverse-people-listening-headphones.png",
                    storeId: "STORE001",
                  }
                  const event = new CustomEvent("nfc-product-add", { detail: testProduct })
                  window.dispatchEvent(event)
                }}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Add Demo Product
              </Button>
            </Card>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="animate-slide-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CartItem item={item} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        {items.length > 0 && (
          <Card className="p-6 md:p-8 bg-card border border-border sticky bottom-0 md:relative animate-slide-in-up">
            <div className="space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total:</span>
                <span className="text-2xl font-bold text-accent">{formatINR(total)}</span>
              </div>

              {/* Shipping Info */}
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Truck className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Pay at counter or checkout online</span>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={onCheckout}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-semibold"
              >
                Proceed to Checkout
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
