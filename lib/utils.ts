import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function generateUniqueToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function downloadQRCode(dataURL: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataURL
  link.download = `${filename}.png`
  link.click()
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
