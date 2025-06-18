"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { generateQRCode } from "@/lib/qr-generator"
import { composePersonalizedImage, downloadImage } from "@/lib/image-composer"
import { Download, ImageIcon, Loader2 } from "lucide-react"

interface Invitee {
  id: string
  name: string
  unique_token: string
}

interface ViewInvitationModalProps {
  invitee: Invitee
  backgroundImage: string
  composition: any
  onClose: () => void
}

export function ViewInvitationModal({ invitee, backgroundImage, composition, onClose }: ViewInvitationModalProps) {
  const [invitationImage, setInvitationImage] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateInvitation = async () => {
      try {
        // Generate QR code
        const qrCode = await generateQRCode(invitee.unique_token)

        // Compose invitation image
        const invitation = await composePersonalizedImage(backgroundImage, qrCode, invitee.name, composition)

        setInvitationImage(invitation)
      } catch (error) {
        console.error("Failed to generate invitation:", error)
      } finally {
        setLoading(false)
      }
    }

    generateInvitation()
  }, [invitee, backgroundImage, composition])

  const handleDownload = () => {
    if (invitationImage) {
      downloadImage(invitationImage, `invitation-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-purple-500" />
            Invitation for {invitee.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating invitation...</span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 max-w-full">
              <img
                src={invitationImage || "/placeholder.svg"}
                alt={`Invitation for ${invitee.name}`}
                className="max-w-full max-h-[70vh] rounded-lg object-contain"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleDownload} disabled={loading} size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Invitation
            </Button>
            <Button variant="outline" onClick={onClose} size="lg">
              Close
            </Button>
          </div>

          {/* Invitation Details */}
          <div className="text-sm text-gray-500 text-center">
            <p>High-quality invitation with QR code for {invitee.name}</p>
            <p>Token: {invitee.unique_token}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
