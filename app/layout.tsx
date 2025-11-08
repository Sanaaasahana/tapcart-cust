import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Get Razorpay verification code from environment
const razorpayVerificationCode = process.env.RAZORPAY_VERIFICATION_CODE

export const metadata: Metadata = {
  title: "Smart Checkout",
  description: "Fast, secure NFC-based self-checkout",
  generator: "v0.app",
  // Add Razorpay verification meta tag if provided
  ...(razorpayVerificationCode && {
    other: {
      "razorpay-verification": razorpayVerificationCode,
    },
  }),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        {/* Razorpay Verification Meta Tag - Automatically added if RAZORPAY_VERIFICATION_CODE env var is set */}
        {razorpayVerificationCode && (
          <script
            dangerouslySetInnerHTML={{
              __html: `document.head.insertAdjacentHTML('beforeend', '<meta name="razorpay-verification" content="${razorpayVerificationCode}" />');`,
            }}
          />
        )}
      </body>
    </html>
  )
}
