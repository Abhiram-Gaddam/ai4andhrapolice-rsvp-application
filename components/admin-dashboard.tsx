"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Download, QrCode, History, RefreshCw, AlertCircle } from "lucide-react"
import { QRCodeModal } from "@/components/qr-code-modal"
import { createClientSideClient } from "@/lib/supabase"
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
  initialInvitees?: Invitee[]
}

export function AdminDashboard({ initialInvitees = [] }: AdminDashboardProps) {
  const [invitees, setInvitees] = useState<Invitee[]>(initialInvitees || [])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvitee, setSelectedInvitee] = useState<Invitee | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null) // Start as null
  const [error, setError] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMounted, setIsMounted] = useState(false) // Track if component is mounted

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true)
    setLastUpdated(new Date()) // Set initial timestamp only after mounting
  }, [])

  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const supabase = createClientSideClient()
      const { data, error: fetchError } = await supabase
        .from("invitees")
        .select("*")
        .order("created_at", { ascending: true })

      if (fetchError) {
        console.error("Error fetching invitees:", fetchError)
        setError(`Failed to refresh data: ${fetchError.message}`)
        return
      }

      setInvitees(data || [])
      if (isMounted) {
        setLastUpdated(new Date())
      }
      setIsInitialized(true)
    } catch (error) {
      console.error("Error refreshing data:", error)
      setError("An unexpected error occurred while refreshing data.")
    } finally {
      setLoading(false)
    }
  }, [isMounted])

  // Load data on mount if no initial data provided
  useEffect(() => {
    if (!isMounted) return

    if (!initialInvitees || initialInvitees.length === 0) {
      refreshData()
    } else {
      setIsInitialized(true)
      setLastUpdated(new Date())
    }
  }, [initialInvitees, refreshData, isMounted])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isInitialized || !isMounted) return

    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshData, isInitialized, isMounted])

  // Real-time subscription to database changes
  useEffect(() => {
    if (!isInitialized || !isMounted) return

    const supabase = createClientSideClient()

    const channel = supabase
      .channel("invitees-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invitees",
        },
        (payload) => {
          console.log("Database change detected:", payload)
          refreshData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshData, isInitialized, isMounted])

  const filteredInvitees = useMemo(() => {
    if (!Array.isArray(invitees)) {
      console.warn("Invitees is not an array:", invitees)
      return []
    }

    return invitees.filter((invitee) => {
      if (!invitee || typeof invitee.name !== "string") {
        console.warn("Invalid invitee object:", invitee)
        return false
      }

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
    if (!Array.isArray(invitees)) {
      return { total: 0, responded: 0, attending: 0, declined: 0, scanned: 0 }
    }

    const total = invitees.length
    const responded = invitees.filter((i) => i && i.rsvp_response).length
    const attending = invitees.filter((i) => i && i.rsvp_response === "yes").length
    const declined = invitees.filter((i) => i && i.rsvp_response === "no").length
    const scanned = invitees.filter((i) => i && i.qr_scanned).length

    return { total, responded, attending, declined, scanned }
  }, [invitees])

  const exportToCSV = () => {
    if (!Array.isArray(filteredInvitees) || filteredInvitees.length === 0) {
      alert("No data to export")
      return
    }

    const headers = ["Name", "QR Scanned", "RSVP Response", "Response Date", "Created Date"]
    const csvContent = [
      headers.join(","),
      ...filteredInvitees.map((invitee) =>
        [
          `"${invitee.name || ""}"`,
          invitee.qr_scanned ? "Yes" : "No",
          invitee.rsvp_response || "Pending",
          invitee.rsvp_timestamp ? new Date(invitee.rsvp_timestamp).toLocaleDateString() : "",
          invitee.created_at ? new Date(invitee.created_at).toLocaleDateString() : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rsvp-responses-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Show loading state while initializing or not mounted
  if (!isMounted || (!isInitialized && loading)) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor RSVP responses and manage your event data.</p>
          </div>
          <div className="text-right">
            <Button onClick={refreshData} disabled={loading} variant="outline" size="sm" className="mb-2">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {/* Only show timestamp after component is mounted */}
            {lastUpdated && <p className="text-xs text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Real-time Status - Only show when initialized */}
      {isInitialized && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Live Updates Active</span>
            <span className="text-green-700">• Data refreshes automatically every 30 seconds</span>
          </div>
        </div>
      )}

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
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.scanned / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Responded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.responded}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.responded / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Attending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.attending}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.responded > 0 ? Math.round((stats.attending / stats.responded) * 100) : 0}% of responses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Declined</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.responded > 0 ? Math.round((stats.declined / stats.responded) * 100) : 0}% of responses
            </p>
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
            <SelectItem value="all">All Invitees ({stats.total})</SelectItem>
            <SelectItem value="scanned">QR Scanned ({stats.scanned})</SelectItem>
            <SelectItem value="not-scanned">Not Scanned ({stats.total - stats.scanned})</SelectItem>
            <SelectItem value="responded">Responded ({stats.responded})</SelectItem>
            <SelectItem value="pending">Pending ({stats.total - stats.responded})</SelectItem>
            <SelectItem value="yes">Attending ({stats.attending})</SelectItem>
            <SelectItem value="no">Declined ({stats.declined})</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/admin/deletion-log">
          <Button variant="outline">
            <History className="h-4 w-4 mr-2" />
            Deletion Log
          </Button>
        </Link>
        <Button
          onClick={exportToCSV}
          variant="outline"
          disabled={!Array.isArray(filteredInvitees) || filteredInvitees.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV ({Array.isArray(filteredInvitees) ? filteredInvitees.length : 0})
        </Button>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {Array.isArray(filteredInvitees) ? filteredInvitees.length : 0} of {stats.total} invitees
          {searchTerm && ` matching "${searchTerm}"`}
          {statusFilter !== "all" && ` with status "${statusFilter}"`}
        </p>
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
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!Array.isArray(filteredInvitees) || filteredInvitees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== "all"
                      ? "No invitees match your current filters"
                      : stats.total === 0
                        ? "No invitees found. Add some invitees to get started."
                        : "Loading..."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvitees.map((invitee) => (
                  <TableRow key={invitee.id}>
                    <TableCell className="font-medium">{invitee.name || "Unknown"}</TableCell>
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
                    <TableCell className="text-sm text-gray-500">
                      {invitee.created_at ? new Date(invitee.created_at).toLocaleDateString() : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInvitee && <QRCodeModal invitee={selectedInvitee} onClose={() => setSelectedInvitee(null)} />}
    </div>
  )
}
