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
import { Upload, Plus, Download, Trash2, Edit, Eye, FileSpreadsheet, AlertCircle } from "lucide-react"
import { generateQRCode } from "@/lib/qr-generator"
import { generateUniqueToken, downloadQRCode } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { QRCodeModal } from "@/components/qr-code-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { EditNameModal } from "@/components/edit-name-modal"
import { parseExcelFile, parseCSVFile, type ParsedInvitee } from "@/lib/excel-parser"

interface Invitee {
  id: string
  name: string
  unique_token: string
  qr_scanned: boolean
  rsvp_response: string | null
}

export function QRGenerator() {
  const [invitees, setInvitees] = useState<Invitee[]>([])
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedInvitee, setSelectedInvitee] = useState<Invitee | null>(null)
  const [deleteInvitee, setDeleteInvitee] = useState<Invitee | null>(null)
  const [editInvitee, setEditInvitee] = useState<Invitee | null>(null)
  const [uploadError, setUploadError] = useState<string>("")
  const [uploadSuccess, setUploadSuccess] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load invitees on component mount
  useEffect(() => {
    loadInvitees()
  }, [])

  const loadInvitees = async () => {
    try {
      const { data, error } = await supabase.from("invitees").select("*").order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading invitees:", error)
        return
      }

      setInvitees(data || [])
    } catch (error) {
      console.error("Error loading invitees:", error)
    }
  }

  const addInvitee = async () => {
    if (!newName.trim()) return

    setLoading(true)
    try {
      const uniqueToken = generateUniqueToken()

      const { data, error } = await supabase
        .from("invitees")
        .insert({
          name: newName.trim(),
          unique_token: uniqueToken,
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding invitee:", error)
        return
      }

      setInvitees((prev) => [...prev, data])
      setNewName("")
    } catch (error) {
      console.error("Error adding invitee:", error)
    } finally {
      setLoading(false)
    }
  }

  const addMultipleInvitees = async (parsedInvitees: ParsedInvitee[]) => {
    setUploadLoading(true)
    setUploadError("")
    setUploadSuccess("")

    try {
      let addedCount = 0
      let skippedCount = 0

      for (const invitee of parsedInvitees) {
        if (invitee.name) {
          const uniqueToken = generateUniqueToken()

          const { data, error } = await supabase
            .from("invitees")
            .insert({
              name: invitee.name,
              unique_token: uniqueToken,
            })
            .select()
            .single()

          if (!error && data) {
            setInvitees((prev) => [...prev, data])
            addedCount++
          } else {
            skippedCount++
            console.error("Error adding invitee:", invitee.name, error)
          }
        } else {
          skippedCount++
        }
      }

      if (addedCount > 0) {
        setUploadSuccess(
          `Successfully added ${addedCount} invitees${skippedCount > 0 ? ` (${skippedCount} skipped)` : ""}`,
        )
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

  const handleDeleteWithReason = async (invitee: Invitee, reason: string) => {
    try {
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
      const { data, error } = await supabase
        .from("invitees")
        .update({
          name: newName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitee.id)
        .select()
        .single()

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
      // Pass the current origin to ensure correct URL in QR
      const baseUrl = typeof window !== "undefined" ? window.location.origin : undefined
      const qrCode = await generateQRCode(invitee.unique_token, baseUrl)
      downloadQRCode(qrCode, `qr-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`)
    } catch (error) {
      console.error("Error downloading QR code:", error)
    }
  }

  const downloadAllQRs = async () => {
    setLoading(true)
    try {
      // Pass the current origin to ensure correct URL in QR
      const baseUrl = typeof window !== "undefined" ? window.location.origin : undefined

      for (const invitee of invitees) {
        const qrCode = await generateQRCode(invitee.unique_token, baseUrl)
        downloadQRCode(qrCode, `qr-${invitee.name.replace(/\s+/g, "-").toLowerCase()}`)
        // Add small delay to prevent browser blocking multiple downloads
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error("Error downloading QR codes:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Invitee Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Invitees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="name">Invitee Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter invitee name"
                onKeyPress={(e) => e.key === "Enter" && addInvitee()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addInvitee} disabled={loading || !newName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

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
              <div className="flex items-start gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">File Format Requirements:</p>
                  <ul className="text-blue-800 space-y-1">
                    <li>
                      • <strong>Column A:</strong> Invitee Name (required)
                    </li>
                    <li>
                      • <strong>Column B:</strong> Email (optional)
                    </li>
                    <li>• First row should contain headers (will be skipped)</li>
                    <li>• Supported formats: .csv, .xlsx, .xls</li>
                  </ul>
                </div>
              </div>
            </div>

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
            <Button onClick={downloadAllQRs} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Download All QRs
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
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
    </div>
  )
}
