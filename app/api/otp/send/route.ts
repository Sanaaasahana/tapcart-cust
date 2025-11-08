import { NextRequest, NextResponse } from "next/server"

// For production, use Twilio, AWS SNS, or similar SMS service
// This is a placeholder that can be easily replaced

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString()

    // In production, send SMS via Twilio, AWS SNS, or similar
    // Example with Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const client = require('twilio')(accountSid, authToken)
    
    await client.messages.create({
      body: `Your OTP is ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`
    })
    */

    // Example with AWS SNS:
    /*
    const AWS = require('aws-sdk')
    const sns = new AWS.SNS({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    })
    
    await sns.publish({
      Message: `Your OTP is ${otp}. Valid for 5 minutes.`,
      PhoneNumber: `+91${phone}`
    }).promise()
    */

    // Store OTP in a simple in-memory store (use Redis in production)
    // In production, use Redis with expiration:
    // await redis.setex(`otp:${phone}`, 300, JSON.stringify({ otp, timestamp, attempts: 0 }))
    
    // For now, use a shared store (in production, use Redis)
    const timestamp = Date.now()
    
    // Store in module-level variable (use Redis in production)
    if (typeof (global as any).otpStore === "undefined") {
      (global as any).otpStore = {}
    }
    (global as any).otpStore[phone] = {
      otp,
      timestamp,
      attempts: 0,
    }

    // In production, send SMS via Twilio, AWS SNS, etc.
    // For demo, log the OTP (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log(`[OTP for +91${phone}]: ${otp}`)
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Only return OTP in development for testing
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    })
  } catch (error) {
    console.error("OTP send error:", error)
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}

