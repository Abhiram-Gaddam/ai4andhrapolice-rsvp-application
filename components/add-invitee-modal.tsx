"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { createClientSideClient } from "@/lib/supabase"
import { generateUniqueToken } from "@/lib/utils/crypto"
import { generateQRCode } from "@/lib/qr-generator"
import { composePersonalizedImage, downloadImage } from "@/lib/image-composer"

interface Invitee {
  id: string
  name: string
  designation?: string | null
  unique_token: string
  qr_scanned: boolean
  rsvp_response: string | null
}

interface CompositionSettings {
  qrPosition: { x: number; y: number; size: number }
  namePosition: { x: number; y: number; fontSize: number }
  nameColor: string
  nameFont: string
}

interface AddInviteeModalProps {
  onClose: () => void
  onAdd: (invitee: Invitee) => void
  backgroundImage?: string | null
  composition?: CompositionSettings
  autoGenerateInvitation?: boolean
}

export function AddInviteeModal({
  onClose,
  onAdd,
  backgroundImage,
  composition,
  autoGenerateInvitation = false,
}: AddInviteeModalProps) {
  const [name, setName] = useState("")
  const [designation, setDesignation] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const supabase = createClientSideClient()
      const uniqueToken = generateUniqueToken()

      // Prepare the data to insert - only include email and designation if they have values
      const insertData: any = {
        name: name.trim(),
        unique_token: uniqueToken,
      }

      // Only add designation if it's not empty
      if (designation.trim()) {
        insertData.designation = designation.trim()
      }

      console.log("Attempting to insert:", insertData)

      const { data, error: dbError } = await supabase.from("invitees").insert(insertData).select().single()

      if (dbError) {
        console.error("Database error details:", {
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
          code: dbError.code,
        })
        setError(`Failed to add invitee: ${dbError.message}`)
        return
      }

      if (!data) {
        setError("Failed to add invitee: No data returned from database")
        return
      }

      console.log("Successfully inserted:", data)

      // Auto-generate invitation if background image is available
      if (autoGenerateInvitation && backgroundImage && composition) {
        try {
          const qrCode = await generateQRCode(uniqueToken)
          const personalizedImage = await composePersonalizedImage(backgroundImage, qrCode, name.trim(), composition)

          // Auto-download the invitation
          downloadImage(personalizedImage, `invitation-${name.trim().replace(/\s+/g, "-").toLowerCase()}`)

          setSuccess(`✅ ${name.trim()} added successfully! Invitation downloaded automatically.`)
        } catch (invitationError) {
          console.error("Error generating invitation:", invitationError)
          setSuccess(
            `✅ ${name.trim()} added successfully! (Invitation generation failed - you can download it manually later)`,
          )
        }
      } else {
        setSuccess(`✅ ${name.trim()} added successfully!`)
      }

      // Add to parent component
      onAdd(data)

      // Reset form
      setName("")
      setDesignation("")

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Unexpected error:", error)
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Invitee</DialogTitle>
          <DialogDescription>
            Add a new person to your invitation list.{" "}
            {backgroundImage ? "A personalized invitation will be generated automatically." : ""}
          </DialogDescription>
        </DialogHeader>

        {/* Auto-generation status */}
        {backgroundImage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-800 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Auto-generation enabled</span>
            </div>
            <p className="text-green-700 text-xs mt-1">
              Personalized invitation will be generated and downloaded automatically
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter invitee name"
              minLength={1}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation (optional)</Label>
            <Input
              id="designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              disabled={loading}
              placeholder="Enter designation (e.g., Manager, Developer)"
              maxLength={255}
            />
          </div>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Adding..." : "Add Invitee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
