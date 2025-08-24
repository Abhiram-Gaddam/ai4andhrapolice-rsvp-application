"use client"

import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Crop, RotateCw, ZoomIn, ZoomOut } from "lucide-react"

interface ImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedImageUrl: string) => void
  onClose: () => void
}

export function ImageCropper({ imageUrl, onCropComplete, onClose }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 300, height: 200 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleCrop = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to crop dimensions
    canvas.width = crop.width
    canvas.height = crop.height

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)

    // Draw cropped portion
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      -crop.width / 2,
      -crop.height / 2,
      crop.width,
      crop.height,
    )

    ctx.restore()

    // Convert to data URL
    const croppedImageUrl = canvas.toDataURL("image/png")
    onCropComplete(croppedImageUrl)
  }, [crop, zoom, rotation, onCropComplete])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Background Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <img
              ref={imageRef}
              src={imageUrl || "/placeholder.svg"}
              alt="Background to crop"
              className="max-w-full max-h-96 mx-auto"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center",
              }}
            />

            {/* Crop Overlay */}
            <div
              className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
              style={{
                left: `${crop.x}px`,
                top: `${crop.y}px`,
                width: `${crop.width}px`,
                height: `${crop.height}px`,
              }}
            >
              <div className="absolute inset-0 border border-white border-dashed"></div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Crop Position X</label>
                <Slider
                  value={[crop.x]}
                  onValueChange={([x]) => setCrop({ ...crop, x })}
                  max={500}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Crop Position Y</label>
                <Slider
                  value={[crop.y]}
                  onValueChange={([y]) => setCrop({ ...crop, y })}
                  max={500}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Crop Width</label>
                <Slider
                  value={[crop.width]}
                  onValueChange={([width]) => setCrop({ ...crop, width })}
                  min={100}
                  max={800}
                  step={10}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Crop Height</label>
                <Slider
                  value={[crop.height]}
                  onValueChange={([height]) => setCrop({ ...crop, height })}
                  min={100}
                  max={600}
                  step={10}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Zoom</label>
                <div className="flex items-center gap-2 mt-2">
                  <ZoomOut className="h-4 w-4" />
                  <Slider
                    value={[zoom]}
                    onValueChange={([z]) => setZoom(z)}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <ZoomIn className="h-4 w-4" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Rotation</label>
                <div className="flex items-center gap-2 mt-2">
                  <RotateCw className="h-4 w-4" />
                  <Slider
                    value={[rotation]}
                    onValueChange={([r]) => setRotation(r)}
                    min={-180}
                    max={180}
                    step={15}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{rotation}°</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCrop({ x: 0, y: 0, width: 400, height: 300 })}
                  className="w-full"
                >
                  Reset Crop
                </Button>
                <Button variant="outline" size="sm" onClick={() => setZoom(1)} className="w-full">
                  Reset Zoom
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRotation(0)} className="w-full">
                  Reset Rotation
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCrop}>
              <Crop className="h-4 w-4 mr-2" />
              Apply Crop
            </Button>
          </div>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
