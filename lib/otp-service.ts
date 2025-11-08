interface OTPStore {
  [key: string]: {
    otp: string
    timestamp: number
    attempts: number
  }
}

const otpStore: OTPStore = {}
const OTP_VALIDITY = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 5

export function generateOTP(phone: string): string {
  const otp = Math.floor(1000 + Math.random() * 9000).toString()
  const timestamp = Date.now()

  otpStore[phone] = {
    otp,
    timestamp,
    attempts: 0,
  }

  // Log for demo purposes
  console.log(`[Demo OTP for ${phone}]: ${otp}`)

  return otp
}

export function verifyOTP(phone: string, inputOTP: string): boolean {
  const stored = otpStore[phone]

  if (!stored) {
    return false
  }

  const isExpired = Date.now() - stored.timestamp > OTP_VALIDITY
  if (isExpired) {
    delete otpStore[phone]
    return false
  }

  if (stored.attempts >= MAX_ATTEMPTS) {
    delete otpStore[phone]
    return false
  }

  stored.attempts++

  if (stored.otp === inputOTP) {
    delete otpStore[phone]
    return true
  }

  return false
}

export function clearOTP(phone: string): void {
  delete otpStore[phone]
}
