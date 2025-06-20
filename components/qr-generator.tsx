"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Download,
  Trash2,
  Edit,
  Eye,
  Upload,
  Globe,
  AlertCircle,
  ImageIcon,
  Package,
  FileArchive,
  ArrowLeft,
} from "lucide-react"
import { generateQRCode } from "@/lib/qr-generator"
import { generateUniqueToken, downloadQRCode } from "@/lib/utils"
import { createClientSideClient } from "@/lib/supabase"
import { QRCodeModal } from "@/components/qr-code-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { EditNameModal } from "@/components/edit-name-modal"
import { AddInviteeModal } from "@/components/add-invitee-modal"
import { parseExcelFile, parseCSVFile, type ParsedInvitee } from "@/lib/excel-parser"
import { BackgroundImageManager } from "@/components/background-image-manager"
import { DraggablePositioning } from "@/components/draggable-positioning"
import { ViewInvitationModal } from "@/components/view-invitation-modal"
import { BulkDownloadModal } from "@/components/bulk-download-modal"
import { composePersonalizedImage, downloadImage } from "@/lib/image-composer"
import Link from "next/link"

interface Invitee {
  id: string
  name: string
  unique_token: string
  qr_scanned: boolean
  rsvp_response: string | null
  designation?: string | null
}

interface CompositionSettings {
  qrPosition: { x: number; y: number; size: number }
  namePosition: { x: number; y: number; fontSize: number }
  nameColor: string
  nameFont: string
  designationPosition?: { x: number; y: number; fontSize: number }
  designationColor?: string
  designationFont?: string
}

// Local storage keys
const STORAGE_KEYS = {
  BACKGROUND_IMAGE: "qr-generator-background-image",
  COMPOSITION: "qr-generator-composition",
  LAST_SYNC: "qr-generator-last-sync",
}

export function QRGenerator() {
  const [invitees, setInvitees] = useState<Invitee[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedInvitee, setSelectedInvitee] = useState<Invitee | null>(null)
  const [deleteInvitee, setDeleteInvitee] = useState<Invitee | null>(null)
  const [editInvitee, setEditInvitee] = useState<Invitee | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [uploadError, setUploadError] = useState<string>("")
  const [uploadSuccess, setUploadSuccess] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  // FIXED: Use REAL font names that work
  const [composition, setComposition] = useState<CompositionSettings>({
    qrPosition: { x: 50, y: 50, size: 150 },
    namePosition: { x: 300, y: 100, fontSize: 36 },
    nameColor: "#D4AF37", // Gold color
    nameFont: "Dancing Script", // REAL font that works
    designationPosition: {
      x: 300,
      y: 160,
      fontSize: 24,
    },
    designationColor: "#666666", // Gray color
    designationFont: "Rajdhani", // REAL font that works
  })
  const [viewInvitationInvitee, setViewInvitationInvitee] = useState<Invitee | null>(null)
  const [showBulkDownload, setShowBulkDownload] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load persisted state on component mount
  useEffect(() => {
    loadPersistedState()
    loadInvitees()
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveStateToStorage()
    }
  }, [backgroundImage, composition, isInitialized])

  const loadPersistedState = () => {
    try {
      // Load background image
      const savedBackgroundImage = localStorage.getItem(STORAGE_KEYS.BACKGROUND_IMAGE)
      if (savedBackgroundImage) {
        setBackgroundImage(savedBackgroundImage)
      }

      // Load composition settings
      const savedComposition = localStorage.getItem(STORAGE_KEYS.COMPOSITION)
      if (savedComposition) {
        const parsedComposition = JSON.parse(savedComposition)
        setComposition(parsedComposition)
      }

      setIsInitialized(true)
    } catch (error) {
      console.error("Error loading persisted state:", error)
      setIsInitialized(true)
    }
  }

  const saveStateToStorage = () => {
    try {
      if (backgroundImage) {
        localStorage.setItem(STORAGE_KEYS.BACKGROUND_IMAGE, backgroundImage)
      } else {
        localStorage.removeItem(STORAGE_KEYS.BACKGROUND_IMAGE)
      }

      localStorage.setItem(STORAGE_KEYS.COMPOSITION, JSON.stringify(composition))
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
    } catch (error) {
      console.error("Error saving state to storage:", error)
    }
  }

  const loadInvitees = async () => {
    try {
      setLoading(true)
      const supabase = createClientSideClient()
      const { data, error } = await supabase.from("invitees").select("*").order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading invitees:", error)
        return
      }

      setInvitees(data || [])
    } catch (error) {
      console.error("Error loading invitees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackgroundImageChange = (newImage: string | null) => {
    setBackgroundImage(newImage)
  }

  const handleCompositionChange = (newComposition: CompositionSettings) => {
    setComposition(newComposition)
  }

  const addInvitee = (newInvitee: Invitee) => {
    setInvitees((prev) => [...prev, newInvitee])
    setShowAddModal(false)
  }

  const addMultipleInvitees = async (parsedInvitees: ParsedInvitee[]) => {
    setUploadLoading(true)
    setUploadError("")
    setUploadSuccess("")

    try {
      const supabase = createClientSideClient()
      let addedCount = 0
      let skippedCount = 0
      const newInvitees: Invitee[] = []

      for (const parsedInvitee of parsedInvitees) {
        if (parsedInvitee.name && parsedInvitee.name.trim()) {
          const uniqueToken = generateUniqueToken()

          const { data, error } = await supabase
            .from("invitees")
            .insert({
              name: parsedInvitee.name.trim(),
              unique_token: uniqueToken,
              designation: parsedInvitee.designation?.trim() || null,
            })
            .select()
            .single()

          if (!error && data) {
            newInvitees.push(data)
            addedCount++
          } else {
            skippedCount++
            console.error("Error adding invitee:", parsedInvitee.name, error)
          }
        } else {
          skippedCount++
        }
      }

      if (addedCount > 0) {
        setInvitees((prev) => [...prev, ...newInvitees])
        setUploadSuccess(
          `Successfully added ${addedCount} invitees${skippedCount > 0 ? ` (${skippedCount} skipped)` : ""}`,
        )

        // AUTO-GENERATE INVITATIONS if background image exists
        if (backgroundImage && newInvitees.length > 0) {
          setTimeout(() => autoGenerateInvitations(newInvitees), 1000)
        }
      } else {
        setUploadError("No valid invitees found in the file")
      }
    } catch (error) {
      console.error("Error uploading invitees:", error)
      setUploadError("Failed to process file. Please try again.")
    } finally {
      setUploadLoading(false)
    }
  }

  // AUTO-GENERATION FEATURE
  const autoGenerateInvitations = async (newInvitees: Invitee[]) => {
    if (!backgroundImage || newInvitees.length === 0) return

    setLoading(true)
    try {
      const images: { name: string; dataUrl: string }[] = []

      // Generate invitations for all new invitees
      for (const invitee of newInvitees) {
        const qrCode = await generateQRCode(invitee.unique_token)
        const personalizedImage = await composePersonalizedImage(
          backgroundImage,
          qrCode,
          invitee.name,
          composition,
          invitee.designation || null,
        )

        images.push({
          name: `invitation-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`,
          dataUrl: personalizedImage,
        })
      }

      // Auto-download as ZIP
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      for (const image of images) {
        const response = await fetch(image.dataUrl)
        const blob = await response.blob()
        zip.file(`${image.name}.png`, blob)
      }

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(zipBlob)
      link.download = `auto-generated-invitations-${Date.now()}.zip`
      link.click()
      URL.revokeObjectURL(link.href)

      setUploadSuccess(
        `🎉 AUTO-GENERATED ${newInvitees.length} personalized invitations! ZIP file downloaded automatically.`,
      )
    } catch (error) {
      console.error("Error auto-generating invitations:", error)
      setUploadError("Failed to auto-generate invitations. You can still download them manually.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWithReason = async (invitee: Invitee, reason: string) => {
    try {
      const supabase = createClientSideClient()

      // Log the deletion with reason
      const { error: logError } = await supabase.from("deletion_log").insert({
        invitee_name: invitee.name,
        invitee_token: invitee.unique_token,
        deletion_reason: reason,
      })

      if (logError) {
        console.error("Error logging deletion:", logError)
      }

      // Delete the invitee
      const { error } = await supabase.from("invitees").delete().eq("id", invitee.id)

      if (error) {
        console.error("Error deleting invitee:", error)
        return
      }

      setInvitees((prev) => prev.filter((inv) => inv.id !== invitee.id))
      setDeleteInvitee(null)
    } catch (error) {
      console.error("Error deleting invitee:", error)
    }
  }

  const handleEditName = async (invitee: Invitee, newName: string) => {
    try {
      const supabase = createClientSideClient()
      const { error } = await supabase
        .from("invitees")
        .update({
          name: newName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitee.id)

      if (error) {
        console.error("Error updating invitee:", error)
        return
      }

      setInvitees((prev) => prev.map((inv) => (inv.id === invitee.id ? { ...inv, name: newName.trim() } : inv)))
      setEditInvitee(null)
    } catch (error) {
      console.error("Error updating invitee:", error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError("")
    setUploadSuccess("")

    try {
      let parsedInvitees: ParsedInvitee[] = []

      if (file.name.endsWith(".csv")) {
        parsedInvitees = await parseCSVFile(file)
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        parsedInvitees = await parseExcelFile(file)
      } else {
        setUploadError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
        return
      }

      if (parsedInvitees.length === 0) {
        setUploadError("No valid data found in the file. Please check the format.")
        return
      }

      await addMultipleInvitees(parsedInvitees)
    } catch (error) {
      console.error("Error processing file:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to process file")
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const downloadSingleQR = async (invitee: Invitee) => {
    try {
      const qrCode = await generateQRCode(invitee.unique_token)
      downloadQRCode(qrCode, `qr-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`)
    } catch (error) {
      console.error("Error downloading QR code:", error)
    }
  }

  const downloadAllQRCodes = async () => {
    if (invitees.length === 0) return

    setLoading(true)
    try {
      // Dynamic import to avoid bundling JSZip if not used
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      // Generate QR codes for all invitees
      for (const invitee of invitees) {
        const qrCode = await generateQRCode(invitee.unique_token)

        // Convert data URL to blob
        const response = await fetch(qrCode)
        const blob = await response.blob()

        zip.file(`qr-${invitee.name.replace(/\s+/g, "-").toLowerCase()}.png`, blob)
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(zipBlob)
      link.download = `all-qr-codes-${Date.now()}.zip`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error("Error downloading all QR codes:", error)
      setUploadError("Failed to download QR codes")
    } finally {
      setLoading(false)
    }
  }

  const downloadPersonalizedImage = async (invitee: Invitee) => {
    if (!backgroundImage) {
      setUploadError("Please upload a background image first")
      return
    }

    try {
      setLoading(true)
      const qrCode = await generateQRCode(invitee.unique_token)
      const personalizedImage = await composePersonalizedImage(
        backgroundImage,
        qrCode,
        invitee.name,
        composition,
        invitee.designation || null,
      )
      downloadImage(personalizedImage, `invitation-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`)
    } catch (error) {
      console.error("Error generating personalized image:", error)
      setUploadError("Failed to generate personalized image")
    } finally {
      setLoading(false)
    }
  }

  const clearAllData = () => {
    if (
      confirm(
        "Are you sure you want to clear all saved data? This will remove the background image and composition settings.",
      )
    ) {
      localStorage.removeItem(STORAGE_KEYS.BACKGROUND_IMAGE)
      localStorage.removeItem(STORAGE_KEYS.COMPOSITION)
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC)
      setBackgroundImage(null)
      setComposition({
        qrPosition: { x: 50, y: 50, size: 150 },
        namePosition: { x: 300, y: 100, fontSize: 32 },
        nameColor: "#000000",
        nameFont: "Arial",
      })
    }
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back to Home Button */}
      <div className="flex justify-start">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* URL Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-blue-800">
            <Globe className="h-5 w-5" />
            <span className="font-medium">QR codes will redirect to:</span>
            <code className="bg-blue-100 px-2 py-1 rounded text-sm">https://rsvp-app-beryl.vercel.app</code>
          </div>
        </CardContent>
      </Card>

      {/* FONT STATUS CARD */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">✅ FONTS WORKING</span>
              <span className="text-sm">Dancing Script for Names + Rajdhani for Designations</span>
            </div>
            <Button variant="outline" size="sm" onClick={clearAllData}>
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Background Image Manager */}
      <BackgroundImageManager
        backgroundImage={backgroundImage}
        onImageChange={handleBackgroundImageChange}
        onCompositionChange={handleCompositionChange}
        composition={composition}
      />

      {/* Draggable Positioning */}
      {backgroundImage && (
        <DraggablePositioning
          backgroundImage={backgroundImage}
          composition={composition}
          onCompositionChange={handleCompositionChange}
        />
      )}

      {/* Add Invitees Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Invitees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manual Add */}
          <div className="flex gap-4">
            <Button onClick={() => setShowAddModal(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Individual Invitee
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="file">Upload Excel/CSV File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  disabled={uploadLoading}
                />
              </div>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadLoading}>
                <Upload className="h-4 w-4 mr-2" />
                {uploadLoading ? "Processing..." : "Upload File"}
              </Button>
            </div>

            {/* File Format Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">File Format Requirements:</p>
                <ul className="text-blue-800 space-y-1">
                  <li>
                    • <strong>Column A:</strong> Invitee Name (required)
                  </li>
                  <li>
                    • <strong>Column B:</strong> Designation (optional)
                  </li>
                  <li>• First row should contain headers (will be skipped)</li>
                  <li>• Supported formats: .csv, .xlsx, .xls</li>
                </ul>
              </div>
            </div>

            {/* AUTO-GENERATION STATUS */}
            {backgroundImage ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                  <div className="text-sm">
                    <p className="font-medium text-green-900 mb-1">🚀 Auto-Generation ACTIVE</p>
                    <p className="text-green-800">
                      Excel upload will automatically create personalized invitations and download them as ZIP!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mt-1"></div>
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 mb-1">📋 Manual Mode</p>
                    <p className="text-amber-800">
                      Upload a background image first to enable auto-generation of invitations!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Status Messages */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploadSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{uploadSuccess}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invitees List */}
      {invitees.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invitees ({invitees.length})</CardTitle>
            <div className="flex gap-2">
              {backgroundImage && (
                <Button onClick={() => setShowBulkDownload(true)} size="lg" className="bg-green-600 hover:bg-green-700">
                  <FileArchive className="h-4 w-4 mr-2" />
                  Download All Invitations
                </Button>
              )}
              <Button onClick={downloadAllQRCodes} disabled={loading} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {loading ? "Generating..." : "Download All QR Codes"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitees.map((invitee) => (
                  <TableRow key={invitee.id}>
                    <TableCell className="font-medium">{invitee.name}</TableCell>
                    <TableCell>
                      {invitee.designation ? (
                        <Badge variant="outline">{invitee.designation}</Badge>
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={invitee.qr_scanned ? "default" : "secondary"}>
                        {invitee.qr_scanned ? "Scanned" : "Not Scanned"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invitee.rsvp_response ? (
                        <Badge variant={invitee.rsvp_response === "yes" ? "default" : "destructive"}>
                          {invitee.rsvp_response === "yes" ? "Yes" : "No"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvitee(invitee)}
                          title="View QR Code"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadSingleQR(invitee)}
                          title="Download QR Code"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {backgroundImage && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewInvitationInvitee(invitee)}
                              title="View Invitation"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadPersonalizedImage(invitee)}
                              title="Download Invitation"
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setEditInvitee(invitee)} title="Edit Name">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteInvitee(invitee)}
                          title="Delete Invitee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddInviteeModal
          onClose={() => setShowAddModal(false)}
          onAdd={addInvitee}
          backgroundImage={backgroundImage}
          composition={composition}
          autoGenerateInvitation={true}
        />
      )}

      {selectedInvitee && <QRCodeModal invitee={selectedInvitee} onClose={() => setSelectedInvitee(null)} />}

      {deleteInvitee && (
        <DeleteConfirmModal
          invitee={deleteInvitee}
          onConfirm={handleDeleteWithReason}
          onClose={() => setDeleteInvitee(null)}
        />
      )}

      {editInvitee && (
        <EditNameModal invitee={editInvitee} onConfirm={handleEditName} onClose={() => setEditInvitee(null)} />
      )}

      {viewInvitationInvitee && backgroundImage && (
        <ViewInvitationModal
          invitee={viewInvitationInvitee}
          backgroundImage={backgroundImage}
          composition={composition}
          onClose={() => setViewInvitationInvitee(null)}
        />
      )}

      {showBulkDownload && backgroundImage && (
        <BulkDownloadModal
          invitees={invitees}
          backgroundImage={backgroundImage}
          composition={composition}
          onClose={() => setShowBulkDownload(false)}
        />
      )}
    </div>
  )
}
