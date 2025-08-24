// Simple font utilities
export const AVAILABLE_FONTS = [
  { value: "Sunset Clouds Personal Use", label: "🌅 Sunset Clouds Personal Use", category: "Custom" },
  { value: "Rajdhani Semi Bold", label: "🏛️ Rajdhani Semi Bold", category: "Modern" },
  { value: "Arial", label: "📄 Arial", category: "Sans-Serif" },
  { value: "Helvetica", label: "📄 Helvetica", category: "Sans-Serif" },
  { value: "Times New Roman", label: "📄 Times New Roman", category: "Serif" },
  { value: "Georgia", label: "📄 Georgia", category: "Serif" },
] as const

export type FontValue = (typeof AVAILABLE_FONTS)[number]["value"]

export function getFontFallback(fontName: string): string {
  const fallbacks: Record<string, string> = {
    "Sunset Clouds Personal Use": "Dancing Script, cursive",
    "Rajdhani Semi Bold": "Rajdhani, sans-serif",
    Arial: "Arial, sans-serif",
    Helvetica: "Helvetica, sans-serif",
    "Times New Roman": "Times New Roman, serif",
    Georgia: "Georgia, serif",
  }

  return fallbacks[fontName] || fontName
}

export function getFontWeight(fontName: string): string {
  const weights: Record<string, string> = {
    "Sunset Clouds Personal Use": "normal",
    "Rajdhani Semi Bold": "600",
    Arial: "normal",
    Helvetica: "normal",
    "Times New Roman": "normal",
    Georgia: "normal",
  }

  return weights[fontName] || "normal"
}
