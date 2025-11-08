"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { ArrowLeft, Phone, Loader2, AlertCircle } from "lucide-react"
import { generateOTP, verifyOTP } from "@/lib/otp-service"
import { formatINR } from "@/lib/currency"

interface CheckoutPageProps {
  onProceed: () => void
  onBack: () => void
}

export function CheckoutPage({ onProceed, onBack }: CheckoutPageProps) {
  const { total, items } = useCart()
  const [phone, setPhone] = useState("")
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [otpAttempts, setOtpAttempts] = useState(0)

  const phoneRegex = /^\d{10}$/ // Updated phone regex to accept any 10-digit number, not just starting with 6-9

  const handleSendOTP = async () => {
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    setError("")
    setIsLoading(true)

    const newOTP = generateOTP(phone)
    setGeneratedOTP(newOTP)

    setTimeout(() => {
      setShowOTP(true)
      setOtpSent(true)
      setIsLoading(false)
      setOtpAttempts(0)
      // Store phone for later use
      sessionStorage.setItem("userPhone", phone)
    }, 1500)
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP")
      return
    }

    setError("")
    setIsLoading(true)

    const isValid = verifyOTP(phone, otp)

    setTimeout(() => {
      setIsLoading(false)

      if (isValid) {
        setGeneratedOTP(null)
        onProceed()
      } else {
        const newAttempts = otpAttempts + 1
        setOtpAttempts(newAttempts)

        if (newAttempts >= 3) {
          setError("Too many incorrect attempts. Please request a new OTP.")
          setShowOTP(false)
          setOtp("")
          setOtpAttempts(0)
        } else {
          setError(`Invalid OTP. ${3 - newAttempts} attempts remaining.`)
          setOtp("")
        }
      }
    }, 800)
  }

  const finalTotal = total // Removed tax multiplication, use total directly

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in-up">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Cart</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Verify Phone</h1>
          <p className="text-muted-foreground mt-2">We'll send an OTP to confirm your delivery address</p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2 space-y-6 animate-slide-in-up">
            <Card className="p-6 md:p-8">
              {!showOTP ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-accent" />
                        Phone Number
                      </div>
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="text-base py-3"
                      disabled={isLoading}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Format: 10 digits</p> // Updated format message
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSendOTP}
                    disabled={!phoneRegex.test(phone) || isLoading}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in-scale">
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <p className="text-sm text-foreground">
                      OTP sent to <span className="font-semibold">+91 {phone}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Enter OTP</label>
                    <Input
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="text-center text-2xl tracking-widest py-3"
                      disabled={isLoading}
                      maxLength={4}
                    />
                    {generatedOTP && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Demo OTP: <span className="font-mono font-semibold text-accent">{generatedOTP}</span>
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 4 || isLoading}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <button
                    onClick={() => {
                      setShowOTP(false)
                      setOtp("")
                      setError("")
                    }}
                    className="w-full text-accent hover:text-accent/80 text-sm font-medium py-2 transition-colors"
                  >
                    Change Phone Number
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
            <Card className="p-6 bg-card sticky top-8">
              <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3 pb-4 border-b border-border">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="text-foreground font-medium">{formatINR(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-accent">{formatINR(finalTotal)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
