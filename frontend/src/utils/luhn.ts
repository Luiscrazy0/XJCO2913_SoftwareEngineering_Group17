export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false

  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10)
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

export function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '')
  if (cleaned.startsWith('34') || cleaned.startsWith('37')) return 'Amex'
  if (cleaned.startsWith('6011') || cleaned.startsWith('65')) return 'Discover'
  if (cleaned.startsWith('4')) return 'Visa'
  if (cleaned.startsWith('5')) return 'Mastercard'
  if (cleaned.startsWith('6')) return 'Discover'
  return 'Unknown'
}
