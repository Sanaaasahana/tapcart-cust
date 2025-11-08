// OTP service using API routes
export async function generateOTP(phone: string): Promise<string> {
  try {
    const response = await fetch("/api/otp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to send OTP" }))
      throw new Error(error.error || "Failed to send OTP")
    }

    const data = await response.json()
    
    // In development, return OTP for testing (remove in production)
    if (data.otp) {
      return data.otp
    }

    // In production, OTP is sent via SMS and not returned
    return ""
  } catch (error) {
    console.error("OTP generation error:", error)
    throw error
  }
}

export async function verifyOTP(phone: string, inputOTP: string): Promise<boolean> {
  try {
    const response = await fetch("/api/otp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, otp: inputOTP }),
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("OTP verification error:", error)
    return false
  }
}

export function clearOTP(phone: string): void {
  // OTP is cleared on the server side after verification
  // This is kept for backward compatibility
}
