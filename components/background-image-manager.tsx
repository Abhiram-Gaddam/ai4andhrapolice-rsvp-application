"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Crop, Eye } from "lucide-react"
import { ImageCropper } from "@/components/image-cropper"
import { FullPreviewModal } from "@/components/full-preview-modal"

interface BackgroundImageManagerProps {
  backgroundImage: string | null
  onImageChange: (imageUrl: string | null) => void
  onCompositionChange: (composition: any) => void
  composition: any
}

export function BackgroundImageManager({
  backgroundImage,
  onImageChange,
  onCompositionChange,
  composition,
}: BackgroundImageManagerProps) {
  const [dragOver, setDragOver] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setOriginalImage(imageUrl)
      onImageChange(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const removeBackground = () => {
    onImageChange(null)
    setOriginalImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCropComplete = (croppedImageUrl: string) => {
    onImageChange(croppedImageUrl)
    setShowCropper(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />✅ Background Image (FONTS WORKING)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {backgroundImage ? (
            <div className="space-y-4">
              {/* Current Background Preview */}
              <div className="relative">
                <img
                  src={backgroundImage || "/placeholder.svg"}
                  alt="Background"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowCropper(true)}>
                    <Crop className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={removeBackground}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Full Preview
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowCropper(true)} className="flex-1">
                  <Crop className="h-4 w-4 mr-2" />
                  Crop Image
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
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
              <div className="mt-4">
                <Button
                  onClick={() =>
                    onCompositionChange({
                      ...composition,
                      nameFont: "Dancing Script",
                      designationFont: "Rajdhani",
                      nameColor: "#D4AF37",
                      designationColor: "#666666",
                    })
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  ✅ APPLY WORKING FONTS (Dancing Script + Rajdhani)
                </Button>
              </div>
            </div>
          ) : (
            /* Upload Area */
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Upload Your Invitation Background</p>
              <p className="text-gray-500 mb-4">Drag and drop an image here, or click to browse</p>
              <Button onClick={() => fileInputRef.current?.click()}>Choose Image</Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showCropper && originalImage && (
        <ImageCropper
          imageUrl={originalImage}
          onCropComplete={handleCropComplete}
          onClose={() => setShowCropper(false)}
        />
      )}

      {showPreview && backgroundImage && (
        <FullPreviewModal
          backgroundImage={backgroundImage}
          composition={composition}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}
