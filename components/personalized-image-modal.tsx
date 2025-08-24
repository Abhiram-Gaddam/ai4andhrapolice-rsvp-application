"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { generateQRCode } from "@/lib/qr-generator"
import { composePersonalizedImage, downloadImage } from "@/lib/image-composer"
import { Download, ImageIcon } from "lucide-react"

interface Invitee {
  id: string
  name: string
  unique_token: string
}

interface PersonalizedImageModalProps {
  invitee: Invitee
  backgroundImage: string
  composition: any
  onClose: () => void
}

export function PersonalizedImageModal({
  invitee,
  backgroundImage,
  composition,
  onClose,
}: PersonalizedImageModalProps) {
  const [personalizedImage, setPersonalizedImage] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generatePersonalizedImage = async () => {
      try {
        // Generate QR code
        const qrCode = await generateQRCode(invitee.unique_token)

        // Compose personalized image
        const composedImage = await composePersonalizedImage(backgroundImage, qrCode, invitee.name, composition)

        setPersonalizedImage(composedImage)
      } catch (error) {
        console.error("Failed to generate personalized image:", error)
      } finally {
        setLoading(false)
      }
    }

    generatePersonalizedImage()
  }, [invitee, backgroundImage, composition])

  const handleDownload = () => {
    if (personalizedImage) {
      downloadImage(personalizedImage, `invitation-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-500" />
            Personalized Invitation for {invitee.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Generating personalized image...</span>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img
                src={personalizedImage || "/placeholder.svg"}
                alt={`Personalized invitation for ${invitee.name}`}
                className="max-w-full max-h-96 rounded-lg"
              />
            </div>
          )}

          <Button onClick={handleDownload} disabled={loading} size="lg">
            <Download className="h-4 w-4 mr-2" />
            Download Personalized Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
