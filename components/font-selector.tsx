"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AVAILABLE_FONTS, isPremiumFont, isGoogleFont } from "@/lib/font-utils"

interface FontSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

export function FontSelector({ value, onChange, label = "Font Family", className }: FontSelectorProps) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {AVAILABLE_FONTS.map((font) => (
            <SelectItem key={font.value} value={font.value} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: font.value }}>{font.label}</span>
                {isPremiumFont(font.value) && (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                    Premium
                  </Badge>
                )}
                {isGoogleFont(font.value) && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    Google
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-1">Premium fonts may require licensing. Google Fonts are free to use.</p>
    </div>
  )
}
