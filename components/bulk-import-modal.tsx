"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Download, CheckCircle, AlertCircle } from "lucide-react"
import { parseExcelFile, parseCSVFile, downloadSampleTemplate } from "@/lib/excel-parser"
import { createClientSideClient } from "@/lib/supabase"
import { generateUniqueToken } from "@/lib/utils/crypto"

interface ParsedInvitee {
  name: string
  designation?: string
}

interface BulkImportModalProps {
  onClose: () => void
  onImportComplete: (count: number) => void
}

export function BulkImportModal({ onClose, onImportComplete }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedInvitee[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile)
    setError("")
    setLoading(true)

    try {
      let parsed: ParsedInvitee[] = []

      if (uploadedFile.name.endsWith(".csv")) {
        parsed = await parseCSVFile(uploadedFile)
      } else if (uploadedFile.name.endsWith(".xlsx") || uploadedFile.name.endsWith(".xls")) {
        parsed = await parseExcelFile(uploadedFile)
      } else {
        throw new Error("Please upload a CSV or Excel file")
      }

      setParsedData(parsed)
      setSuccess(`Successfully parsed ${parsed.length} invitees from file`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file")
      setParsedData([])
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return

    setImporting(true)
    setError("")

    try {
      const supabase = createClientSideClient()
      const inviteesToInsert = parsedData.map((invitee) => ({
        name: invitee.name,
        designation: invitee.designation || null, // Handle designation properly
        unique_token: generateUniqueToken(),
      }))

      const { data, error: insertError } = await supabase.from("invitees").insert(inviteesToInsert).select()

      if (insertError) {
        throw new Error(`Database error: ${insertError.message}`)
      }

      setSuccess(`Successfully imported ${data?.length || 0} invitees!`)
      onImportComplete(data?.length || 0)

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import data")
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Bulk Import Invitees
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Expected File Format:</h4>
            <div className="text-sm text-blue-800">
              <p>
                <strong>Column 1:</strong> Name (required)
              </p>
              <p>
                <strong>Column 2:</strong> Designation (optional)
              </p>
              <p className="mt-2 text-xs">Example: John Doe, Manager</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadSampleTemplate} className="mt-3">
              <Download className="h-4 w-4 mr-2" />
              Download Sample Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Upload CSV or Excel File</p>
            <p className="text-gray-500 mb-4">Select a file containing names and designations</p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                const uploadedFile = e.target.files?.[0]
                if (uploadedFile) handleFileUpload(uploadedFile)
              }}
              className="hidden"
              id="file-upload"
            />
            <Button onClick={() => document.getElementById("file-upload")?.click()}>Choose File</Button>
          </div>

          {/* File Info */}
          {file && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>File:</strong> {file.name}
              </p>
              <p className="text-sm">
                <strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Preview ({parsedData.length} invitees):</h4>
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 border-b">Name</th>
                      <th className="text-left p-2 border-b">Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((invitee, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{invitee.name}</td>
                        <td className="p-2 text-gray-600">{invitee.designation || <em>Not specified</em>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <p className="text-xs text-gray-500 p-2">... and {parsedData.length - 10} more</p>
                )}
              </div>
            </div>
          )}

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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={parsedData.length === 0 || importing || loading}>
              {importing ? "Importing..." : `Import ${parsedData.length} Invitees`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
