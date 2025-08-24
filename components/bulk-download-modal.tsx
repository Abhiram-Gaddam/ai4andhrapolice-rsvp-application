"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { generateQRCode } from "@/lib/qr-generator"
import { composePersonalizedImage, downloadAllImagesAsZip, downloadAllImagesIndividually } from "@/lib/image-composer"
import { FileArchive, Download, Loader2, CheckCircle } from "lucide-react"

interface Invitee {
  id: string
  name: string
  unique_token: string
}

interface BulkDownloadModalProps {
  invitees: Invitee[]
  backgroundImage: string
  composition: any
  onClose: () => void
}

export function BulkDownloadModal({ invitees, backgroundImage, composition, onClose }: BulkDownloadModalProps) {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [completed, setCompleted] = useState(false)

  const handleZipDownload = async () => {
    setDownloading(true)
    setProgress(0)
    setCurrentStep("Generating invitations...")
    setCompleted(false)

    try {
      const images: { name: string; dataUrl: string }[] = []

      // Generate all images with progress
      for (let i = 0; i < invitees.length; i++) {
        const invitee = invitees[i]
        setCurrentStep(`Generating invitation for ${invitee.name}...`)
        setProgress(((i + 1) / invitees.length) * 50) // First 50% for generation

        const qrCode = await generateQRCode(invitee.unique_token)
        const personalizedImage = await composePersonalizedImage(backgroundImage, qrCode, invitee.name, composition)

        images.push({
          name: `invitation-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`,
          dataUrl: personalizedImage,
        })
      }

      setCurrentStep("Creating ZIP file...")
      setProgress(75)

      // Download as ZIP with progress
      await downloadAllImagesAsZip(images, "all-invitations", (current, total) => {
        setProgress(75 + (current / total) * 25) // Last 25% for ZIP creation
      })

      setCurrentStep("Download completed!")
      setProgress(100)
      setCompleted(true)

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error downloading ZIP:", error)
      alert("Failed to create ZIP file")
      setDownloading(false)
    }
  }

  const handleIndividualDownload = async () => {
    setDownloading(true)
    setProgress(0)
    setCurrentStep("Generating and downloading invitations...")
    setCompleted(false)

    try {
      const images: { name: string; dataUrl: string }[] = []

      // Generate all images first
      for (let i = 0; i < invitees.length; i++) {
        const invitee = invitees[i]
        setCurrentStep(`Generating invitation for ${invitee.name}...`)
        setProgress(((i + 1) / invitees.length) * 70) // 70% for generation

        const qrCode = await generateQRCode(invitee.unique_token)
        const personalizedImage = await composePersonalizedImage(backgroundImage, qrCode, invitee.name, composition)

        images.push({
          name: `invitation-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`,
          dataUrl: personalizedImage,
        })
      }

      setCurrentStep("Downloading files...")

      // Download individually with progress
      await downloadAllImagesIndividually(images, (current, total) => {
        setCurrentStep(`Downloading ${current} of ${total} files...`)
        setProgress(70 + (current / total) * 30) // Last 30% for downloads
      })

      setCurrentStep("All downloads completed!")
      setProgress(100)
      setCompleted(true)

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error downloading files:", error)
      alert("Failed to download some files")
      setDownloading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-500" />
            Bulk Download Invitations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!downloading && !completed && (
            <>
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Ready to download <strong>{invitees.length} invitations</strong>
                </p>
                <p className="text-sm text-gray-500">Choose your preferred download method:</p>
              </div>

              <div className="space-y-3">
                <Button onClick={handleZipDownload} className="w-full" size="lg">
                  <FileArchive className="h-4 w-4 mr-2" />
                  Download as ZIP File
                  <span className="text-xs ml-2">(Recommended)</span>
                </Button>

                <Button onClick={handleIndividualDownload} variant="outline" className="w-full" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download Individual Files
                  <span className="text-xs ml-2">(One by one)</span>
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p>ZIP file keeps all invitations organized in one download.</p>
                <p>Individual downloads may be blocked by your browser.</p>
              </div>
            </>
          )}

          {downloading && (
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="font-medium">{currentStep}</p>
              </div>

              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500 text-center">{Math.round(progress)}% complete</p>
              </div>
            </div>
          )}

          {completed && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="font-medium text-green-700">Download Completed!</p>
                <p className="text-sm text-gray-500">All {invitees.length} invitations have been downloaded.</p>
              </div>
            </div>
          )}

          {!downloading && !completed && (
            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
