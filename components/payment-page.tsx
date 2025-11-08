"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { ArrowLeft, CreditCard, Smartphone, Store, Loader2, Check, AlertCircle } from "lucide-react"
import { initiateUPIPayment } from "@/lib/upi-service"
import { formatINR } from "@/lib/currency"

interface PaymentPageProps {
  onSuccess: () => void
  onBack: () => void
}

type PaymentMethod = "card" | "upi" | "counter" | null

export function PaymentPage({ onSuccess, onBack }: PaymentPageProps) {
  const { total, clearCart } = useCart()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  // Card state
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")

  // UPI state
  const [upiId, setUpiId] = useState("")

  const finalTotal = total // Removed tax calculation, use total directly

  const handleCardNumberChange = (e: string) => {
    const value = e.replace(/\s/g, "").slice(0, 16)
    setCardNumber(value.replace(/(\d{4})/g, "$1 ").trim())
  }

  const handleExpiryChange = (e: string) => {
    const value = e.replace(/\D/g, "").slice(0, 4)
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`)
    } else {
      setExpiry(value)
    }
  }

  const handleCVVChange = (e: string) => {
    setCvv(e.replace(/\D/g, "").slice(0, 3))
  }

  const handleCardPayment = async () => {
    setError("")
    setIsProcessing(true)
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    sessionStorage.setItem("transactionId", transactionId)
    sessionStorage.setItem("paymentMethod", "Credit/Debit Card")

    // Simulate card payment processing
    setTimeout(() => {
      setIsProcessing(false)
      clearCart()
      onSuccess()
    }, 2000)
  }

  const handleUPIPayment = async () => {
    setError("")
    setIsProcessing(true)

    try {
      const response = await initiateUPIPayment(upiId, finalTotal, "Checkout Payment")

      if (response.success) {
        sessionStorage.setItem("transactionId", response.transactionId)
        sessionStorage.setItem("paymentMethod", "UPI")
        console.log("[v0] UPI Payment successful:", response.transactionId)
        clearCart()
        setTimeout(() => {
          setIsProcessing(false)
          onSuccess()
        }, 1000)
      } else {
        setError(response.message || "Payment failed. Please try again.")
        setIsProcessing(false)
      }
    } catch (err) {
      setError("An error occurred during payment. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleCounterPayment = async () => {
    setError("")
    setIsProcessing(true)
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    sessionStorage.setItem("transactionId", transactionId)
    sessionStorage.setItem("paymentMethod", "Pay at Counter")

    // Simulate counter payment processing
    setTimeout(() => {
      setIsProcessing(false)
      clearCart()
      onSuccess()
    }, 1500)
  }

  const isCardValid = cardNumber.length === 19 && expiry.length === 5 && cvv.length === 3
  const isUPIValid = upiId.includes("@")

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in-up">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Checkout</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Choose Payment Method</h1>
          <p className="text-muted-foreground mt-2">Select how you'd like to pay</p>
        </div>

        {/* Payment Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Card Payment */}
          <Card
            className={`p-6 cursor-pointer transition-all duration-200 ${
              selectedMethod === "card" ? "ring-2 ring-accent bg-accent/5 border-accent" : "hover:border-accent/50"
            } animate-slide-in-up`}
            onClick={() => setSelectedMethod("card")}
          >
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Credit/Debit Card</h3>
            </div>
            <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
          </Card>

          {/* UPI Payment */}
          <Card
            className={`p-6 cursor-pointer transition-all duration-200 ${
              selectedMethod === "upi" ? "ring-2 ring-accent bg-accent/5 border-accent" : "hover:border-accent/50"
            } animate-slide-in-up`}
            style={{ animationDelay: "50ms" }}
            onClick={() => setSelectedMethod("upi")}
          >
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">UPI (Google Pay)</h3>
            </div>
            <p className="text-sm text-muted-foreground">Fast & Secure</p>
          </Card>

          {/* Pay at Counter */}
          <Card
            className={`p-6 cursor-pointer transition-all duration-200 ${
              selectedMethod === "counter" ? "ring-2 ring-accent bg-accent/5 border-accent" : "hover:border-accent/50"
            } animate-slide-in-up`}
            style={{ animationDelay: "100ms" }}
            onClick={() => setSelectedMethod("counter")}
          >
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Pay at Counter</h3>
            </div>
            <p className="text-sm text-muted-foreground">Cash payment</p>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 animate-fade-in-scale">
            {selectedMethod === "card" && (
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Cardholder Name</label>
                  <Input
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Card Number</label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    disabled={isProcessing}
                    className="text-lg tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Expiry</label>
                    <Input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">CVV</label>
                    <Input
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => handleCVVChange(e.target.value)}
                      disabled={isProcessing}
                      type="password"
                    />
                  </div>
                </div>

                {error && selectedMethod === "card" && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleCardPayment}
                  disabled={!isCardValid || isProcessing}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay ${formatINR(finalTotal)}`
                  )}
                </Button>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    For demo testing, use any card details with valid format.
                  </p>
                </div>
              </Card>
            )}

            {selectedMethod === "upi" && (
              <Card className="p-6 md:p-8 space-y-6 animate-fade-in-scale">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">UPI ID</label>
                  <Input
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>

                {error && selectedMethod === "upi" && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleUPIPayment}
                  disabled={!isUPIValid || isProcessing}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay ${formatINR(finalTotal)} via UPI`
                  )}
                </Button>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    For demo, use any valid UPI ID format (example@upi or example@googleplay)
                  </p>
                </div>
              </Card>
            )}

            {selectedMethod === "counter" && (
              <Card className="p-6 md:p-8 space-y-6 animate-fade-in-scale">
                <div className="p-6 bg-accent/5 border border-accent/20 rounded-lg">
                  <Check className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Ready to Pay at Counter</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You've selected to pay at the counter. Please collect your receipt number below and proceed to the
                    payment counter.
                  </p>
                  <div className="p-3 bg-background rounded border border-border mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Receipt Number</p>
                    <p className="font-mono font-bold text-foreground text-lg">
                      REC-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleCounterPayment}
                  disabled={isProcessing}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Completing Order...
                    </>
                  ) : (
                    "Complete Order"
                  )}
                </Button>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
            <Card className="p-6 bg-card sticky top-8">
              <h3 className="font-semibold text-foreground mb-4">Amount Due</h3>
              <div className="space-y-3 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-foreground">{formatINR(total)}</span>
                </div>
              </div>
              <div className="pt-4 flex justify-between items-center">
                <span className="font-semibold text-foreground">Amount Due</span>
                <span className="text-2xl font-bold text-accent">{formatINR(finalTotal)}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
