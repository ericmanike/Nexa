// src/lib/otp.ts
import crypto from 'crypto';

export function generateOTP(length: number = 6): string {
  // Generate cryptographically strong pseudo-random bytes
  const bytes = crypto.randomBytes(length);
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    // Convert bytes to numbers between 0-9
    otp += (bytes[i] % 10).toString();
  }
  
  return otp;
}

console.log(generateOTP())