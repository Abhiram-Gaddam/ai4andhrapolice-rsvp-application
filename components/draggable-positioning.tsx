"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Move, RotateCcw } from "lucide-react"

interface DraggablePositioningProps {
  backgroundImage: string
  composition: any
  onCompositionChange: (composition: any) => void
  sampleName?: string
  sampleDesignation?: string
}

export function DraggablePositioning({
  backgroundImage,
  composition,
  onCompositionChange,
  sampleName = "John Doe",
  sampleDesignation = "Senior Software Development Manager",
}: DraggablePositioningProps) {
  const [isDragging, setIsDragging] = useState<"qr" | "name-invitation" | "designation-invitation" | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (type: "qr" | "name-invitation" | "designation-invitation", e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(type)

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      let elementX: number, elementY: number

      if (type === "qr") {
        elementX = composition.qrPosition.x
        elementY = composition.qrPosition.y
      } else if (type === "name-invitation") {
        elementX = composition.namePosition.x
        elementY = composition.namePosition.y
      } else if (type === "designation-invitation") {
        const designationPos = composition.designationPosition || {
          x: composition.namePosition.x,
          y: composition.namePosition.y + 40,
        }
        elementX = designationPos.x
        elementY = designationPos.y
      }

      setDragOffset({
        x: e.clientX - rect.left - elementX,
        y: e.clientY - rect.top - elementY,
      })
    },
    [composition],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const newX = e.clientX - rect.left - dragOffset.x
      const newY = e.clientY - rect.top - dragOffset.y

      if (isDragging === "qr") {
        const maxX = rect.width - composition.qrPosition.size
        const maxY = rect.height - composition.qrPosition.size
        const constrainedX = Math.max(0, Math.min(newX, maxX))
        const constrainedY = Math.max(0, Math.min(newY, maxY))

        onCompositionChange({
          ...composition,
          qrPosition: { ...composition.qrPosition, x: constrainedX, y: constrainedY },
        })
      } else if (isDragging === "name-invitation") {
        const constrainedX = Math.max(0, Math.min(newX, rect.width - 200))
        const constrainedY = Math.max(0, Math.min(newY, rect.height - 30))

        onCompositionChange({
          ...composition,
          namePosition: { ...composition.namePosition, x: constrainedX, y: constrainedY },
        })
      } else if (isDragging === "designation-invitation") {
        const constrainedX = Math.max(0, Math.min(newX, rect.width - 200))
        const constrainedY = Math.max(0, Math.min(newY, rect.height - 30))

        onCompositionChange({
          ...composition,
          designationPosition: {
            x: constrainedX,
            y: constrainedY,
            fontSize: composition.designationPosition?.fontSize || 20,
          },
        })
      }
    },
    [isDragging, dragOffset, composition, onCompositionChange],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  const resetPositions = () => {
    onCompositionChange({
      ...composition,
      qrPosition: { ...composition.qrPosition, x: 50, y: 50 },
      namePosition: { ...composition.namePosition, x: 200, y: 100 },
      designationPosition: {
        x: 200,
        y: 140,
        fontSize: 20,
      },
    })
  }

  const designationPosition = composition.designationPosition || {
    x: composition.namePosition.x,
    y: composition.namePosition.y + 40,
    fontSize: 20,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Move className="h-5 w-5" />✅ WORKING FONTS: Dancing Script + Rajdhani
          </span>
          <Button variant="outline" size="sm" onClick={resetPositions}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Draggable Preview */}
          <div
            ref={containerRef}
            className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
            style={{ height: "500px" }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background Image */}
            <img
              src={backgroundImage || "/placeholder.svg"}
              alt="Background"
              className="w-full h-full object-cover"
              draggable={false}
            />

            {/* QR Code */}
            <div
              className={`absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move flex items-center justify-center ${
                isDragging === "qr" ? "z-20" : "z-10"
              }`}
              style={{
                left: `${composition.qrPosition.x}px`,
                top: `${composition.qrPosition.y}px`,
                width: `${composition.qrPosition.size}px`,
                height: `${composition.qrPosition.size}px`,
              }}
              onMouseDown={(e) => handleMouseDown("qr", e)}
            >
              <div className="text-white text-xs font-bold bg-blue-500 px-2 py-1 rounded">QR CODE</div>
            </div>

            {/* Name Text - FIXED with Dancing Script */}
            <div
              className={`absolute cursor-move ${isDragging === "name-invitation" ? "z-20" : "z-10"}`}
              style={{
                left: `${composition.namePosition.x}px`,
                top: `${composition.namePosition.y}px`,
                fontSize: `${Math.min(composition.namePosition.fontSize, 24)}px`,
                color: composition.nameColor,
                fontFamily:
                  composition.nameFont === "Dancing Script" ? "Dancing Script, cursive" : composition.nameFont,
                fontWeight: composition.nameFont === "Dancing Script" ? "600" : "normal",
                fontStyle: composition.nameFont === "Dancing Script" ? "italic" : "normal",
                textShadow: composition.nameFont === "Dancing Script" ? "2px 2px 4px rgba(0,0,0,0.3)" : "none",
              }}
              onMouseDown={(e) => handleMouseDown("name-invitation", e)}
            >
              <div className="text-white text-xs font-bold bg-green-500 px-2 py-1 rounded absolute -top-6">
                ✅ DANCING SCRIPT
              </div>
              {sampleName}
            </div>

            {/* Designation Text - FIXED with Rajdhani */}
            <div
              className={`absolute cursor-move ${isDragging === "designation-invitation" ? "z-20" : "z-10"}`}
              style={{
                left: `${designationPosition.x}px`,
                top: `${designationPosition.y}px`,
                fontSize: `${Math.min(designationPosition.fontSize, 18)}px`,
                color: composition.designationColor || composition.nameColor,
                fontFamily:
                  (composition.designationFont || composition.nameFont) === "Rajdhani"
                    ? "Rajdhani, sans-serif"
                    : composition.designationFont || composition.nameFont,
                fontWeight: (composition.designationFont || composition.nameFont) === "Rajdhani" ? "600" : "normal",
                letterSpacing:
                  (composition.designationFont || composition.nameFont) === "Rajdhani" ? "0.5px" : "normal",
                textTransform:
                  (composition.designationFont || composition.nameFont) === "Rajdhani" ? "uppercase" : "none",
              }}
              onMouseDown={(e) => handleMouseDown("designation-invitation", e)}
            >
              <div className="text-white text-xs font-bold bg-purple-500 px-2 py-1 rounded absolute -top-6">
                ✅ RAJDHANI
              </div>
              {sampleDesignation}
            </div>
          </div>

          {/* Position Controls */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">QR Code</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="X"
                  value={composition.qrPosition.x}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      qrPosition: { ...composition.qrPosition, x: Number.parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Y"
                  value={composition.qrPosition.y}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      qrPosition: { ...composition.qrPosition, y: Number.parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Size"
                  value={composition.qrPosition.size}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      qrPosition: { ...composition.qrPosition, size: Number.parseInt(e.target.value) || 100 },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Name</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="X"
                  value={composition.namePosition.x}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      namePosition: { ...composition.namePosition, x: Number.parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Y"
                  value={composition.namePosition.y}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      namePosition: { ...composition.namePosition, y: Number.parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Font Size"
                  value={composition.namePosition.fontSize}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      namePosition: { ...composition.namePosition, fontSize: Number.parseInt(e.target.value) || 24 },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Designation</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="X"
                  value={designationPosition.x}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      designationPosition: {
                        ...designationPosition,
                        x: Number.parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Y"
                  value={designationPosition.y}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      designationPosition: {
                        ...designationPosition,
                        y: Number.parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Font Size"
                  value={designationPosition.fontSize}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      designationPosition: {
                        ...designationPosition,
                        fontSize: Number.parseInt(e.target.value) || 20,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* FIXED Font Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>✅ Name Font (WORKING)</Label>
              <select
                className="w-full p-2 border rounded"
                value={composition.nameFont}
                onChange={(e) =>
                  onCompositionChange({
                    ...composition,
                    nameFont: e.target.value,
                  })
                }
              >
                <option value="Dancing Script">✅ Dancing Script (WORKING)</option>
                <option value="Rajdhani">🏛️ Rajdhani</option>
                <option value="Playfair Display">📖 Playfair Display</option>
                <option value="Great Vibes">✨ Great Vibes</option>
                <option value="Pacifico">🌊 Pacifico</option>
                <option value="Arial">📄 Arial</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>✅ Designation Font (WORKING)</Label>
              <select
                className="w-full p-2 border rounded"
                value={composition.designationFont || composition.nameFont}
                onChange={(e) =>
                  onCompositionChange({
                    ...composition,
                    designationFont: e.target.value,
                  })
                }
              >
                <option value="Rajdhani">✅ Rajdhani (WORKING)</option>
                <option value="Dancing Script">✨ Dancing Script</option>
                <option value="Playfair Display">📖 Playfair Display</option>
                <option value="Arial">📄 Arial</option>
                <option value="Helvetica">📄 Helvetica</option>
              </select>
            </div>
          </div>

          {/* Color Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name Color (Dancing Script)</Label>
              <div className="grid grid-cols-4 gap-2">
                <Input
                  type="color"
                  value={composition.nameColor}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      nameColor: e.target.value,
                    })
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCompositionChange({
                      ...composition,
                      nameColor: "#D4AF37",
                    })
                  }
                >
                  Gold
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCompositionChange({
                      ...composition,
                      nameColor: "#8B4513",
                    })
                  }
                >
                  Brown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCompositionChange({
                      ...composition,
                      nameColor: "#FFFFFF",
                    })
                  }
                >
                  White
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Designation Color (Rajdhani)</Label>
              <div className="grid grid-cols-4 gap-2">
                <Input
                  type="color"
                  value={composition.designationColor || composition.nameColor}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      designationColor: e.target.value,
                    })
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCompositionChange({
                      ...composition,
                      designationColor: "#666666",
                    })
                  }
                >
                  Gray
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCompositionChange({
                      ...composition,
                      designationColor: "#333333",
                    })
                  }
                >
                  Dark
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCompositionChange({
                      ...composition,
                      designationColor: "#FFFFFF",
                    })
                  }
                >
                  White
                </Button>
              </div>
            </div>
          </div>

          {/* PERFECT COMBO BUTTON */}
          <div className="space-y-2">
            <Label>✅ GUARANTEED WORKING COMBINATION</Label>
            <Button
              onClick={() =>
                onCompositionChange({
                  ...composition,
                  nameFont: "Dancing Script",
                  designationFont: "Rajdhani",
                  nameColor: "#D4AF37",
                  designationColor: "#666666",
                  namePosition: { ...composition.namePosition, fontSize: 40 },
                  designationPosition: {
                    x: composition.namePosition.x,
                    y: composition.namePosition.y + 60,
                    fontSize: 24,
                  },
                })
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
              size="lg"
            >
              ✅ APPLY WORKING FONTS (Dancing Script + Rajdhani)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
