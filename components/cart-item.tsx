"use client"

import React from "react"

import { useCart, type CartProduct } from "@/lib/cart-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"
import { formatINR } from "@/lib/currency"

interface CartItemProps {
  item: CartProduct
  index: number
}

export function CartItem({ item, index }: CartItemProps) {
  const { removeItem } = useCart()
  const [isRemoving, setIsRemoving] = (React as any).useState(false)

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      removeItem(item.id)
    }, 200)
  }

  return (
    <Card
      className={`p-4 md:p-5 flex items-center justify-between gap-4 transition-all duration-200 ${
        isRemoving ? "animate-slide-out-down opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Product Image */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate text-sm md:text-base">{item.name}</h3>
          <p className="text-muted-foreground text-xs md:text-sm">1 item</p>
        </div>
      </div>

      {/* Price and Remove Button */}
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="font-bold text-accent text-base md:text-lg">{formatINR(item.price)}</p>
        </div>
        <Button
          onClick={handleRemove}
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
