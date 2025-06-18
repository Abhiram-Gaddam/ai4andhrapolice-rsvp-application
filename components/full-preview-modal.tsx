"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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

  const generatePreview = async () => {
    setLoading(true)
    try {
      // Generate sample QR code
      const sampleQR = await generateQRCode("sample-token-preview")

      // Compose preview image
      const preview = await composePersonalizedImage(backgroundImage, sampleQR, sampleName, composition)
      setPreviewImage(preview)
    } catch (error) {
      console.error("Failed to generate preview:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generatePreview()
  }, [backgroundImage, composition, sampleName])

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
                  <strong>Sample Name:</strong> {sampleName}
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
                  <strong>Font Color:</strong> {composition.nameColor}
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
