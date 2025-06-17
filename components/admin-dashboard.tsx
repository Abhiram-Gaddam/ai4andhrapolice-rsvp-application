"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, QrCode, History } from "lucide-react"
import { QRCodeModal } from "@/components/qr-code-modal"
import Link from "next/link"

interface Invitee {
  id: string
  name: string
  unique_token: string
  qr_scanned: boolean
  rsvp_response: string | null
  rsvp_timestamp: string | null
  created_at: string
}

interface AdminDashboardProps {
  invitees: Invitee[]
}

export function AdminDashboard({ invitees }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvitee, setSelectedInvitee] = useState<Invitee | null>(null)

  const filteredInvitees = useMemo(() => {
    return invitees.filter((invitee) => {
      const matchesSearch = invitee.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "responded" && invitee.rsvp_response) ||
        (statusFilter === "pending" && !invitee.rsvp_response) ||
        (statusFilter === "yes" && invitee.rsvp_response === "yes") ||
        (statusFilter === "no" && invitee.rsvp_response === "no") ||
        (statusFilter === "scanned" && invitee.qr_scanned) ||
        (statusFilter === "not-scanned" && !invitee.qr_scanned)

      return matchesSearch && matchesStatus
    })
  }, [invitees, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const total = invitees.length
    const responded = invitees.filter((i) => i.rsvp_response).length
    const attending = invitees.filter((i) => i.rsvp_response === "yes").length
    const declined = invitees.filter((i) => i.rsvp_response === "no").length
    const scanned = invitees.filter((i) => i.qr_scanned).length

    return { total, responded, attending, declined, scanned }
  }, [invitees])

  const exportToCSV = () => {
    const headers = ["Name", "QR Scanned", "RSVP Response", "Response Date"]
    const csvContent = [
      headers.join(","),
      ...filteredInvitees.map((invitee) =>
        [
          `"${invitee.name}"`,
          invitee.qr_scanned ? "Yes" : "No",
          invitee.rsvp_response || "Pending",
          invitee.rsvp_timestamp ? new Date(invitee.rsvp_timestamp).toLocaleDateString() : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rsvp-responses.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor RSVP responses and manage your event data.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
            <CardTitle className="text-sm font-medium text-gray-600">QR Scanned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scanned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Responded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.responded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Attending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.attending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Declined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name..."
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
            <SelectItem value="all">All Invitees</SelectItem>
            <SelectItem value="scanned">QR Scanned</SelectItem>
            <SelectItem value="not-scanned">Not Scanned</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="yes">Attending</SelectItem>
            <SelectItem value="no">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/admin/deletion-log">
          <Button variant="outline">
            <History className="h-4 w-4 mr-2" />
            Deletion Log
          </Button>
        </Link>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Scanned</TableHead>
                <TableHead>RSVP Status</TableHead>
                <TableHead>Response Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvitees.map((invitee) => (
                <TableRow key={invitee.id}>
                  <TableCell className="font-medium">{invitee.name}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => setSelectedInvitee(invitee)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={invitee.qr_scanned ? "default" : "secondary"}>
                      {invitee.qr_scanned ? "Yes" : "No"}
                    </Badge>
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
                  <TableCell>
                    {invitee.rsvp_timestamp ? new Date(invitee.rsvp_timestamp).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInvitee && <QRCodeModal invitee={selectedInvitee} onClose={() => setSelectedInvitee(null)} />}
    </div>
  )
}
