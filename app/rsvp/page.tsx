import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { RSVPForm } from "@/components/rsvp-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RSVPPageProps {
  searchParams: { id?: string }
}

async function getInvitee(token: string) {
  const supabase = createServerClient()

  const { data: invitee, error } = await supabase.from("invitees").select("*").eq("unique_token", token).single()

  if (error || !invitee) {
    return null
  }

  return invitee
}

async function RSVPContent({ token }: { token: string }) {
  const invitee = await getInvitee(token)

  if (!invitee) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">RSVP Confirmation</CardTitle>
          <CardDescription className="text-lg">
            Hi <span className="font-semibold text-indigo-600">{invitee.name}</span>, will you attend?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RSVPForm inviteeId={invitee.id} token={token} currentResponse={invitee.rsvp_response} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function RSVPPage({ searchParams }: RSVPPageProps) {
  const token = searchParams.id

  if (!token) {
    notFound()
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <RSVPContent token={token} />
    </Suspense>
  )
}
