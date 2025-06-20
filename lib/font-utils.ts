// Font utility functions for better font handling
export const AVAILABLE_FONTS = [
  { value: "Arial", label: "Arial", category: "Sans-serif" },
  { value: "Georgia", label: "Georgia", category: "Serif" },
  { value: "Times New Roman", label: "Times New Roman", category: "Serif" },
  { value: "Helvetica", label: "Helvetica", category: "Sans-serif" },
  { value: "Verdana", label: "Verdana", category: "Sans-serif" },
  { value: "Impact", label: "Impact", category: "Display" },
  { value: "Comic Sans MS", label: "Comic Sans MS", category: "Casual" },
  { value: "Trajan Pro", label: "Trajan Pro (Premium)", category: "Classical" },
  { value: "Optima", label: "Optima", category: "Humanist" },
  { value: "Copperplate", label: "Copperplate", category: "Display" },
  { value: "Engravers MT", label: "Engravers MT", category: "Engraved" },
  { value: "Cinzel", label: "Cinzel (Google Fonts)", category: "Classical" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond", category: "Elegant" },
  { value: "Playfair Display", label: "Playfair Display", category: "Elegant" },
  { value: "Crimson Text", label: "Crimson Text", category: "Reading" },
  { value: "EB Garamond", label: "EB Garamond", category: "Classical" },
] as const

export type FontValue = (typeof AVAILABLE_FONTS)[number]["value"]

export function getFontFallback(fontName: string): string {
  const fallbacks: Record<string, string> = {
    "Trajan Pro": "'Trajan Pro', 'Optima', 'Copperplate', serif",
    Optima: "'Optima', 'Lucida Grande', 'Lucida Sans Unicode', Arial, sans-serif",
    Copperplate: "'Copperplate', 'Copperplate Gothic Light', fantasy",
    "Engravers MT": "'Engravers MT', 'Copperplate', fantasy",
    Cinzel: "'Cinzel', 'Trajan Pro', serif",
    "Cormorant Garamond": "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
    "Playfair Display": "'Playfair Display', 'Crimson Text', Georgia, serif",
    "Crimson Text": "'Crimson Text', 'EB Garamond', Georgia, serif",
    "EB Garamond": "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
  }

  return fallbacks[fontName] || fontName
}

export function getFontWeight(fontName: string): string {
  const weights: Record<string, string> = {
    "Trajan Pro": "600",
    Optima: "500",
    Copperplate: "600",
    "Engravers MT": "700",
    Cinzel: "600",
    "Cormorant Garamond": "500",
    "Playfair Display": "600",
    "Crimson Text": "600",
    "EB Garamond": "500",
  }

  return weights[fontName] || "normal"
}

export function isPremiumFont(fontName: string): boolean {
  const premiumFonts = ["Trajan Pro", "Optima", "Copperplate", "Engravers MT"]
  return premiumFonts.includes(fontName)
}

export function isGoogleFont(fontName: string): boolean {
  const googleFonts = ["Cinzel", "Cormorant Garamond", "Playfair Display", "Crimson Text", "EB Garamond"]
  return googleFonts.includes(fontName)
}
