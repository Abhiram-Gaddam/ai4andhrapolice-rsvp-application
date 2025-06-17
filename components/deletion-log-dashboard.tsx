"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface DeletionRecord {
  id: string
  invitee_name: string
  invitee_token: string
  deletion_reason: string
  deleted_at: string
}

interface DeletionLogDashboardProps {
  deletions: DeletionRecord[]
}

export function DeletionLogDashboard({ deletions }: DeletionLogDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDeletions = useMemo(() => {
    return deletions.filter(
      (deletion) =>
        deletion.invitee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deletion.deletion_reason.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [deletions, searchTerm])

  const exportToCSV = () => {
    const headers = ["Name", "Token", "Deletion Reason", "Deleted Date"]
    const csvContent = [
      headers.join(","),
      ...filteredDeletions.map((deletion) =>
        [
          `"${deletion.invitee_name}"`,
          `"${deletion.invitee_token}"`,
          `"${deletion.deletion_reason}"`,
          new Date(deletion.deleted_at).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "deletion-log.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Deletion Log</h1>
        <p className="text-gray-600">Track all deleted invitees with reasons for record keeping.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deletions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{deletions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                deletions.filter((d) => {
                  const deletedDate = new Date(d.deleted_at)
                  const now = new Date()
                  return deletedDate.getMonth() === now.getMonth() && deletedDate.getFullYear() === now.getFullYear()
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {
                deletions.filter((d) => {
                  const deletedDate = new Date(d.deleted_at)
                  const today = new Date()
                  return deletedDate.toDateString() === today.toDateString()
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
                <TableHead>Invitee Name</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Deletion Reason</TableHead>
                <TableHead>Deleted Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeletions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No deletion records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeletions.map((deletion) => (
                  <TableRow key={deletion.id}>
                    <TableCell className="font-medium">{deletion.invitee_name}</TableCell>
                    <TableCell className="font-mono text-sm">{deletion.invitee_token}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={deletion.deletion_reason}>
                        {deletion.deletion_reason}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(deletion.deleted_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
