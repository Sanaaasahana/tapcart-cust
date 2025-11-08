"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, FileText, Phone, Share2 } from "lucide-react"
import { formatINR } from "@/lib/currency"
import { useCart } from "@/lib/cart-context"
import { generatePDFBill } from "@/lib/bill-generator"

export function SuccessPage() {
  const { items, total } = useCart()
  const [mounted, setMounted] = useState(false)
  const [phone] = useState(() => sessionStorage.getItem("userPhone") || "")
  const [billId] = useState(`BILL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`)
  const [paymentMethod] = useState(() => sessionStorage.getItem("paymentMethod") || "Unknown")
  const [transactionId] = useState(() => sessionStorage.getItem("transactionId") || "TXN-000000000000")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const storeId = items.length > 0 ? items[0].storeId : "STORE001"
  const storeNames: Record<string, string> = {
    STORE001: "Premium Retail Store",
    STORE002: "Main Store",
    STORE003: "Express Shop",
  }
  const storeName = storeNames[storeId] || "Store"

  const handleDownloadBill = () => {
    const billData = {
      billId,
      timestamp: new Date().toLocaleString("en-IN"),
      items,
      total, // Removed tax, just use total
      phone,
      paymentMethod,
      transactionId,
      storeName,
    }

    generatePDFBill(billData)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Success Animation */}
        <div className="flex justify-center mb-8 animate-fade-in-scale">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-full animate-pulse-ring"></div>
            <CheckCircle className="w-24 h-24 text-accent relative z-10" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8 animate-slide-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">Thank you for your purchase</p>
        </div>

        {/* Success Cards */}
        <div className="space-y-4 md:space-y-5 mb-8 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
          {/* Bill Card */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-muted/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-lg flex-shrink-0">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Your Bill</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Bill ID: <span className="font-mono font-semibold text-foreground">{billId}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Generated at: {new Date().toLocaleString()}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent" onClick={handleDownloadBill}>
                <FileText className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </Card>

          {/* SMS Notification Card */}
          <Card className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-lg flex-shrink-0">
                <Phone className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">E-Bill Sent</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Your e-bill has been sent to <span className="font-semibold text-foreground">+91 {phone}</span>
                </p>
                <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                  <p className="text-xs font-medium text-accent">Delivered</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary Details */}
        <Card className="p-6 md:p-8 mb-8 animate-slide-in-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
          <div className="space-y-3 pb-4 border-b border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Status</span>
              <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">Completed</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="text-foreground font-medium">{formatINR(total)}</span>
            </div>
          </div>
          <div className="pt-4 flex justify-between items-center">
            <span className="font-semibold text-foreground">Transaction ID</span>
            <span className="font-mono font-semibold text-accent">{transactionId}</span>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-up" style={{ animationDelay: "300ms" }}>
          <Button
            variant="outline"
            className="flex-1 h-12 font-semibold bg-transparent"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Receipt",
                  text: `My receipt: ${billId}`,
                })
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Receipt
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/"
            }}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-semibold"
          >
            Start New Order
          </Button>
        </div>

        {/* Footer Note */}
        <div
          className="mt-8 p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground animate-slide-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <p>Thank you for shopping with us! Keep your receipt for your records.</p>
        </div>
      </div>
    </div>
  )
}
