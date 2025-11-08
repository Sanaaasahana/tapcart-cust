import { NextRequest, NextResponse } from "next/server"
import { submitPurchase } from "@/lib/store-api"
import type { PurchaseRequest } from "@/lib/store-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      storeId,
      customerName,
      customerPhone,
      items,
      totalAmount,
      transactionId,
      paymentMethod,
    } = body

    if (!storeId || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: storeId, customerPhone, items" },
        { status: 400 }
      )
    }

    // Prepare purchase request
    const purchaseRequest: PurchaseRequest = {
      storeId,
      customerName,
      customerPhone,
      items: items.map((item: any) => ({
        customId: item.customId || item.id,
        quantity: item.quantity || 1,
        price: item.price,
        name: item.name,
      })),
      totalAmount,
      transactionId,
      paymentMethod,
    }

    // Submit to store API
    const result = await submitPurchase(purchaseRequest)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Purchase submission error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to submit purchase"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

