import { NextRequest, NextResponse } from "next/server"

// In production, use Redis or a database to store OTPs
const OTP_VALIDITY = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP are required" }, { status: 400 })
    }

    // In production, retrieve from Redis:
    // const storedData = await redis.get(`otp:${phone}`)
    // const stored = storedData ? JSON.parse(storedData) : null
    
    // For now, use global store (use Redis in production)
    if (typeof (global as any).otpStore === "undefined") {
      (global as any).otpStore = {}
    }
    const stored = (global as any).otpStore[phone]

    if (!stored) {
      return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 })
    }

    const isExpired = Date.now() - stored.timestamp > OTP_VALIDITY
    if (isExpired) {
      delete (global as any).otpStore[phone]
      return NextResponse.json({ error: "OTP expired" }, { status: 400 })
    }

    if (stored.attempts >= MAX_ATTEMPTS) {
      delete (global as any).otpStore[phone]
      return NextResponse.json({ error: "Too many attempts" }, { status: 400 })
    }

    stored.attempts++

    if (stored.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP", attemptsRemaining: MAX_ATTEMPTS - stored.attempts },
        { status: 400 }
      )
    }

    // OTP verified successfully
    delete (global as any).otpStore[phone]
    // In production, also delete from Redis: await redis.del(`otp:${phone}`)

    return NextResponse.json({ success: true, message: "OTP verified successfully" })
  } catch (error) {
    console.error("OTP verify error:", error)
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 })
  }
}

