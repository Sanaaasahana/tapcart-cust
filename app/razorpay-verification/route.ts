import { NextResponse } from "next/server"

// Razorpay website verification
// Razorpay will provide you with a verification code
// Replace 'YOUR_VERIFICATION_CODE' with the code Razorpay gives you
const RAZORPAY_VERIFICATION_CODE = process.env.RAZORPAY_VERIFICATION_CODE || "YOUR_VERIFICATION_CODE"

export async function GET() {
  // Return the verification code as plain text
  // Razorpay will check: https://tapcart-cust.onrender.com/razorpay-verification
  return new NextResponse(RAZORPAY_VERIFICATION_CODE, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}

