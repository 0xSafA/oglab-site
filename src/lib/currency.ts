export function formatCurrencyTHB(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  try {
    // Use Thai Baht with no decimals by default
    const formatted = new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(value)
    // Ensure no non-breaking spaces creep in
    return formatted.replace(/\u00A0/g, ' ')
  } catch {
    return `฿${value}`
  }
}


