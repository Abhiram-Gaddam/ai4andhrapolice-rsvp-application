"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { generateQRCode } from "@/lib/qr-generator"
import { downloadQRCode } from "@/lib/utils"
import { Download, Copy, Check, QrCode } from "lucide-react"

interface Invitee {
  id: string
  name: string
  unique_token: string
}

interface QRCodeModalProps {
  invitee: Invitee
  onClose: () => void
}

export function QRCodeModal({ invitee, onClose }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrDataURL = await generateQRCode(invitee.unique_token)
        setQrCode(qrDataURL)
      } catch (error) {
        console.error("Failed to generate QR code:", error)
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [invitee.unique_token])

  const handleDownload = () => {
    if (qrCode) {
      downloadQRCode(qrCode, `qr-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`)
    }
  }

  const copyLink = async () => {
    const url = `https://ai4andhrapolice-rsvp-application.vercel.app/rsvp?id=${invitee.unique_token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const rsvpUrl = `https://ai4andhrapolice-rsvp-application.vercel.app/rsvp?id=${invitee.unique_token}`

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-500" />
            QR Code for {invitee.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Generating QR Code...</span>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img
                src={qrCode || "/placeholder.svg"}
                alt={`QR Code for ${invitee.name}`}
                className="w-64 h-64 rounded-lg"
              />
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={handleDownload} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button onClick={copyLink} variant="outline">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>

          <div className="text-sm text-gray-500 text-center max-w-full">
            <p className="font-medium mb-1">RSVP Link:</p>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all block">{rsvpUrl}</code>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
