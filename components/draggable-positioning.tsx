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
}

export function DraggablePositioning({
  backgroundImage,
  composition,
  onCompositionChange,
  sampleName = "John Doe",
}: DraggablePositioningProps) {
  const [isDragging, setIsDragging] = useState<"qr" | "name" | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (type: "qr" | "name", e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(type)

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const elementX = type === "qr" ? composition.qrPosition.x : composition.namePosition.x
      const elementY = type === "qr" ? composition.qrPosition.y : composition.namePosition.y

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

      // Constrain to container bounds
      const maxX = rect.width - (isDragging === "qr" ? composition.qrPosition.size : 100)
      const maxY = rect.height - (isDragging === "qr" ? composition.qrPosition.size : 30)

      const constrainedX = Math.max(0, Math.min(newX, maxX))
      const constrainedY = Math.max(0, Math.min(newY, maxY))

      if (isDragging === "qr") {
        onCompositionChange({
          ...composition,
          qrPosition: { ...composition.qrPosition, x: constrainedX, y: constrainedY },
        })
      } else {
        onCompositionChange({
          ...composition,
          namePosition: { ...composition.namePosition, x: constrainedX, y: constrainedY },
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
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Drag to Position
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
            style={{ height: "400px" }}
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

            {/* Draggable QR Code */}
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

            {/* Draggable Name Text */}
            <div
              className={`absolute border-2 border-green-500 bg-green-500 bg-opacity-20 cursor-move flex items-center justify-center min-w-[100px] ${
                isDragging === "name" ? "z-20" : "z-10"
              }`}
              style={{
                left: `${composition.namePosition.x - 50}px`, // Center the text box
                top: `${composition.namePosition.y - 15}px`,
                height: "30px",
                fontSize: `${Math.min(composition.namePosition.fontSize, 16)}px`,
                color: composition.nameColor,
                fontFamily: composition.nameFont,
              }}
              onMouseDown={(e) => handleMouseDown("name", e)}
            >
              <div className="text-white text-xs font-bold bg-green-500 px-2 py-1 rounded absolute -top-6">NAME</div>
              {sampleName}
            </div>

            {/* Instructions */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
              Drag the blue QR box and green name box to position them
            </div>
          </div>

          {/* Manual Position Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">QR Code Position & Size</Label>
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
              <Label className="text-sm font-medium">Name Position & Font</Label>
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
          </div>

          {/* Text Styling */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={composition.nameColor}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      nameColor: e.target.value,
                    })
                  }
                  className="w-16 h-10"
                />
                <Input
                  type="text"
                  value={composition.nameColor}
                  onChange={(e) =>
                    onCompositionChange({
                      ...composition,
                      nameColor: e.target.value,
                    })
                  }
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Font Family</Label>
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
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Verdana">Verdana</option>
                <option value="Impact">Impact</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
