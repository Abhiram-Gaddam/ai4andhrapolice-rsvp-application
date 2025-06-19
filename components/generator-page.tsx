"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, RefreshCw, Package, Eye, Upload } from "lucide-react"
import { createClientSideClient } from "@/lib/supabase"
import { generateQRCode } from "@/lib/qr-generator"
import { composePersonalizedImage, downloadAllImagesAsZip, downloadAllImagesIndividually } from "@/lib/image-composer"
import { ViewInvitationModal } from "@/components/view-invitation-modal"
import { BulkImportModal } from "@/components/bulk-import-modal"

interface Invitee {
  id: string
  name: string
  designation?: string | null
  unique_token: string
  qr_scanned: boolean
  rsvp_response: string | null
  created_at: string
}

interface GeneratorPageProps {
  backgroundImage: string
  composition: any
}

export function GeneratorPage({ backgroundImage, composition }: GeneratorPageProps) {
  const [invitees, setInvitees] = useState<Invitee[]>([])
  const [filteredInvitees, setFilteredInvitees] = useState<Invitee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvitee, setSelectedInvitee] = useState<Invitee | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  // Load invitees
  const loadInvitees = async () => {
    setLoading(true)
    try {
      const supabase = createClientSideClient()
      const { data, error } = await supabase.from("invitees").select("*").order("created_at", { ascending: true })

      if (error) throw error
      setInvitees(data || [])
    } catch (error) {
      console.error("Error loading invitees:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter invitees
  useEffect(() => {
    const filtered = invitees.filter((invitee) => {
      const matchesSearch =
        invitee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invitee.designation && invitee.designation.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "with-designation" && invitee.designation) ||
        (statusFilter === "no-designation" && !invitee.designation) ||
        (statusFilter === "responded" && invitee.rsvp_response) ||
        (statusFilter === "pending" && !invitee.rsvp_response)

      return matchesSearch && matchesStatus
    })

    setFilteredInvitees(filtered)
  }, [invitees, searchTerm, statusFilter])

  // Load data on mount
  useEffect(() => {
    loadInvitees()
  }, [])

  // Generate all invitations
  const generateAllInvitations = async (downloadType: "zip" | "individual") => {
    if (!backgroundImage || filteredInvitees.length === 0) return

    setGenerating(true)
    setProgress({ current: 0, total: filteredInvitees.length })

    try {
      const images: { name: string; dataUrl: string }[] = []

      for (let i = 0; i < filteredInvitees.length; i++) {
        const invitee = filteredInvitees[i]
        setProgress({ current: i + 1, total: filteredInvitees.length })

        // Generate QR code
        const qrCode = await generateQRCode(invitee.unique_token)

        // Generate invitation
        const invitation = await composePersonalizedImage(backgroundImage, qrCode, invitee.name, composition)

        // Create filename with designation if available
        const filename = invitee.designation
          ? `${invitee.name.replace(/\s+/g, "-")}-${invitee.designation.replace(/\s+/g, "-")}`
          : invitee.name.replace(/\s+/g, "-")

        images.push({
          name: filename.toLowerCase(),
          dataUrl: invitation,
        })
      }

      // Download based on type
      if (downloadType === "zip") {
        await downloadAllImagesAsZip(images, "invitations", (current, total) => setProgress({ current, total }))
      } else {
        await downloadAllImagesIndividually(images, (current, total) => setProgress({ current, total }))
      }
    } catch (error) {
      console.error("Error generating invitations:", error)
      alert("Failed to generate invitations")
    } finally {
      setGenerating(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  const stats = {
    total: invitees.length,
    withDesignation: invitees.filter((i) => i.designation).length,
    withoutDesignation: invitees.filter((i) => !i.designation).length,
    responded: invitees.filter((i) => i.rsvp_response).length,
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invitation Generator</h1>
        <p className="text-gray-600">Generate and download personalized invitations with QR codes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invitees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">With Designation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.withDesignation}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">No Designation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.withoutDesignation}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Responded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Invitees ({stats.total})</SelectItem>
            <SelectItem value="with-designation">With Designation ({stats.withDesignation})</SelectItem>
            <SelectItem value="no-designation">No Designation ({stats.withoutDesignation})</SelectItem>
            <SelectItem value="responded">Responded ({stats.responded})</SelectItem>
            <SelectItem value="pending">Pending ({stats.total - stats.responded})</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowBulkImport(true)} variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Import
        </Button>
        <Button onClick={loadInvitees} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Generation Controls */}
      {backgroundImage && filteredInvitees.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-900">Ready to Generate</h3>
              <p className="text-sm text-green-700">{filteredInvitees.length} invitations ready for generation</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => generateAllInvitations("zip")} disabled={generating} size="sm">
                <Package className="h-4 w-4 mr-2" />
                Download as ZIP
              </Button>
              <Button
                onClick={() => generateAllInvitations("individual")}
                disabled={generating}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Individual
              </Button>
            </div>
          </div>
          {generating && (
            <div className="mt-3">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                Generating {progress.current} of {progress.total} invitations...
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invitees Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvitees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== "all"
                      ? "No invitees match your current filters"
                      : "No invitees found. Add some invitees to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvitees.map((invitee) => (
                  <TableRow key={invitee.id}>
                    <TableCell className="font-medium">{invitee.name}</TableCell>
                    <TableCell>
                      {invitee.designation ? (
                        <Badge variant="outline" className="text-xs">
                          {invitee.designation}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {invitee.rsvp_response ? (
                        <Badge variant={invitee.rsvp_response === "yes" ? "default" : "destructive"}>
                          {invitee.rsvp_response === "yes" ? "Attending" : "Declined"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(invitee.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvitee(invitee)}
                        disabled={!backgroundImage}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedInvitee && backgroundImage && (
        <ViewInvitationModal
          invitee={selectedInvitee}
          backgroundImage={backgroundImage}
          composition={composition}
          onClose={() => setSelectedInvitee(null)}
        />
      )}

      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onImportComplete={(count) => {
            loadInvitees()
            alert(`Successfully imported ${count} invitees!`)
          }}
        />
      )}
    </div>
  )
}
