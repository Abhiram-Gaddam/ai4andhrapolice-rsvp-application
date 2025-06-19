"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { generateQRCode } from "@/lib/qr-generator"
import { composePersonalizedImage, downloadImage } from "@/lib/image-composer"
import { Download, ImageIcon, Loader2, Settings } from "lucide-react"
import { IndividualPositioningModal } from "@/components/individual-positioning-modal"

interface Invitee {
  id: string
  name: string
  designation?: string | null
  unique_token: string
  custom_qr_position?: any
  custom_name_position?: any
  custom_text_style?: any
}

interface ViewInvitationModalProps {
  invitee: Invitee
  backgroundImage: string
  composition: any
  onClose: () => void
  onUpdateInvitee?: (invitee: Invitee) => void
}

export function ViewInvitationModal({
  invitee,
  backgroundImage,
  composition,
  onClose,
  onUpdateInvitee,
}: ViewInvitationModalProps) {
  const [invitationImage, setInvitationImage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [showPositioning, setShowPositioning] = useState(false)

  const generateInvitation = async () => {
    setLoading(true)
    try {
      // Generate QR code
      const qrCode = await generateQRCode(invitee.unique_token)

      // Use individual positioning if available, otherwise use global
      const finalComposition = {
        qrPosition: invitee.custom_qr_position || composition.qrPosition,
        namePosition: {
          ...(invitee.custom_name_position || composition.namePosition),
          textAlign: "left", // Always left-align text
          textBaseline: "top", // Always anchor at top
        },
        nameColor: invitee.custom_text_style?.color || composition.nameColor,
        nameFont: invitee.custom_text_style?.font || composition.nameFont,
        // FIX: Include designation positioning
        designationPosition: composition.designationPosition || {
          x: composition.namePosition.x,
          y: composition.namePosition.y + 40,
          fontSize: 20,
        },
        designationColor: composition.designationColor || composition.nameColor,
        designationFont: composition.designationFont || composition.nameFont,
      }

      // FIX: Compose invitation image with designation parameter
      const invitation = await composePersonalizedImage(
        backgroundImage,
        qrCode,
        invitee.name,
        finalComposition,
        invitee.designation || null, // Pass designation parameter
      )

      setInvitationImage(invitation)
    } catch (error) {
      console.error("Failed to generate invitation:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateInvitation()
  }, [invitee, backgroundImage, composition])

  const handleDownload = () => {
    if (invitationImage) {
      downloadImage(invitationImage, `invitation-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`)
    }
  }

  const handlePositioningUpdate = (updatedInvitee: Invitee) => {
    if (onUpdateInvitee) {
      onUpdateInvitee(updatedInvitee)
    }
    // Regenerate invitation with new positioning
    generateInvitation()
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-500" />
              Invitation for {invitee.name}
              {invitee.designation && <span className="text-sm text-gray-500">({invitee.designation})</span>}
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
              <Button variant="outline" onClick={() => setShowPositioning(true)} disabled={loading} size="lg">
                <Settings className="h-4 w-4 mr-2" />
                Custom Position
              </Button>
              <Button variant="outline" onClick={onClose} size="lg">
                Close
              </Button>
            </div>

            {/* Invitation Details */}
            <div className="text-sm text-gray-500 text-center">
              <p>High-quality invitation with QR code for {invitee.name}</p>
              {invitee.designation && <p>Designation: {invitee.designation}</p>}
              <p>Token: {invitee.unique_token}</p>
              {(invitee.custom_qr_position || invitee.custom_name_position) && (
                <p className="text-blue-600 font-medium">✨ Using custom positioning</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual Positioning Modal */}
      {showPositioning && (
        <IndividualPositioningModal
          invitee={invitee}
          backgroundImage={backgroundImage}
          globalComposition={composition}
          onClose={() => setShowPositioning(false)}
          onUpdate={handlePositioningUpdate}
        />
      )}
    </>
  )
}
