"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateQRCode } from "@/lib/qr-generator"
import { composePersonalizedImage } from "@/lib/image-composer"
import { Eye, Download, RefreshCw } from "lucide-react"

interface FullPreviewModalProps {
  backgroundImage: string
  composition: any
  sampleName?: string
  onClose: () => void
}

export function FullPreviewModal({
  backgroundImage,
  composition,
  sampleName = "John Doe",
  onClose,
}: FullPreviewModalProps) {
  const [previewImage, setPreviewImage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [customSampleName, setCustomSampleName] = useState(sampleName)
  const [customSampleDesignation, setCustomSampleDesignation] = useState("Senior Software Development Manager")

  const generatePreview = async () => {
    setLoading(true)
    try {
      // Generate sample QR code
      const sampleQR = await generateQRCode("sample-token-preview")

      // Use fixed positioning composition (left-aligned text)
      const fixedComposition = {
        ...composition,
        namePosition: {
          ...composition.namePosition,
          textAlign: "left", // Ensure left alignment
          textBaseline: "top", // Anchor at top-left
        },
        designationPosition: composition.designationPosition || {
          x: composition.namePosition.x,
          y: composition.namePosition.y + 40,
          fontSize: 20,
        },
      }

      // Compose preview image with fixed positioning - INCLUDE SAMPLE DESIGNATION
      const preview = await composePersonalizedImage(
        backgroundImage,
        sampleQR,
        customSampleName,
        fixedComposition,
        customSampleDesignation, // Use custom designation
      )
      setPreviewImage(preview)
    } catch (error) {
      console.error("Failed to generate preview:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generatePreview()
  }, [backgroundImage, composition, customSampleName, customSampleDesignation])

  const downloadPreview = () => {
    if (previewImage) {
      const link = document.createElement("a")
      link.href = previewImage
      link.download = "preview-invitation.png"
      link.click()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            Full Background Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sample Name Input */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label htmlFor="sampleName" className="text-sm font-medium">
              Test with different name:
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="sampleName"
                value={customSampleName}
                onChange={(e) => setCustomSampleName(e.target.value)}
                placeholder="Enter a name to test positioning"
                className="flex-1"
              />
              <Button onClick={generatePreview} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <Label htmlFor="sampleDesignation" className="text-sm font-medium mt-3 block">
              Test with different designation:
            </Label>
            <Input
              id="sampleDesignation"
              value={customSampleDesignation}
              onChange={(e) => setCustomSampleDesignation(e.target.value)}
              placeholder="Enter a long designation to test wrapping"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">Try long designations to see auto-wrapping in action</p>
          </div>

          {/* Preview Image */}
          <div className="flex justify-center">
            {loading ? (
              <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Generating preview...</span>
              </div>
            ) : (
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={previewImage || "/placeholder.svg"}
                  alt="Full preview"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            )}
          </div>

          {/* Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>Sample Name:</strong> {customSampleName}
                </p>
                <p>
                  <strong>QR Position:</strong> X:{composition.qrPosition.x}, Y:{composition.qrPosition.y}
                </p>
                <p>
                  <strong>QR Size:</strong> {composition.qrPosition.size}px
                </p>
              </div>
              <div>
                <p>
                  <strong>Name Position:</strong> X:{composition.namePosition.x}, Y:{composition.namePosition.y}
                </p>
                <p>
                  <strong>Font Size:</strong> {composition.namePosition.fontSize}px
                </p>
                <p>
                  <strong>Text Alignment:</strong> Left-anchored (fixed position)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={generatePreview} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Preview
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadPreview} disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Download Preview
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
