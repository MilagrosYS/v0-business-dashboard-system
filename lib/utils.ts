import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique IDs
export const generateId = () => Math.random().toString(36).substring(2, 15)

// Get array or fallback to single value
export const getArrayOrFallback = (arrayField: string[], singleField: string | undefined): string[] => {
  if (arrayField.length > 0) return arrayField
  return singleField ? [singleField] : []
}
