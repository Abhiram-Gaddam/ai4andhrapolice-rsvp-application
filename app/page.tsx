import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Users, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RSVP Management System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to get started with QR code-based RSVP management.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <QrCode className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <CardTitle>QR Generator</CardTitle>
              <CardDescription>
                Create and manage QR codes for your invitees. Upload Excel files or add names manually.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/generator">
                <Button className="w-full" size="lg">
                  Generate QR Codes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle>Invitee</CardTitle>
              <CardDescription>
                Scan your QR code to access your personalized RSVP page and confirm attendance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Scan your QR code to get started</p>
                <Button variant="outline" className="w-full" size="lg" disabled>
                  Scan QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                View all RSVPs, track responses, and export data for your event management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full" size="lg" variant="secondary">
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
