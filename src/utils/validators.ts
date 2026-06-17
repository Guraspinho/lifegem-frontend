const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (value: string): boolean =>
  EMAIL_RE.test(value.trim())

export const isRequired = (value: string): boolean =>
  value.trim().length > 0

export const hasMinLength = (value: string, min: number): boolean =>
  value.length >= min

export const hasMaxLength = (value: string, max: number): boolean =>
  value.length <= max
