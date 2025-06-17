"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { submitRSVP } from "@/app/actions/rsvp"

interface RSVPFormProps {
  inviteeId: string
  token: string
  currentResponse?: string | null
}

export function RSVPForm({ inviteeId, token, currentResponse }: RSVPFormProps) {
  const [response, setResponse] = useState<string | null>(currentResponse || null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (rsvpResponse: "yes" | "no") => {
    startTransition(async () => {
      const result = await submitRSVP(inviteeId, token, rsvpResponse)
      if (result.success) {
        setResponse(rsvpResponse)
      }
    })
  }

  if (response) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {response === "yes" ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Thank you for your response!</h3>
          <p className="text-gray-600 mt-2">
            You have {response === "yes" ? "confirmed your attendance" : "declined the invitation"}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => handleSubmit("yes")}
          disabled={isPending}
          className="h-16 text-lg font-semibold bg-green-600 hover:bg-green-700"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CheckCircle className="h-6 w-6 mr-2" />
              Yes, I'll attend
            </>
          )}
        </Button>
        <Button
          onClick={() => handleSubmit("no")}
          disabled={isPending}
          variant="destructive"
          className="h-16 text-lg font-semibold"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <XCircle className="h-6 w-6 mr-2" />
              No, I can't attend
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
