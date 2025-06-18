'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { submitRSVP } from "@/app/actions/rsvp"

interface RSVPFormProps {
  inviteeId: string
  token: string
  currentResponse?: string | null
  inviteeName: string
}

export function RSVPForm({
  inviteeId,
  token,
  currentResponse,
  inviteeName
}: RSVPFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isDisabled, setIsDisabled] = useState(false)

  const alreadyResponded = !!currentResponse

  const handleSubmit = async (rsvpResponse: "yes" | "no") => {
    if (alreadyResponded || isPending) return

    setIsDisabled(true)
    startTransition(async () => {
      const result = await submitRSVP(inviteeId, token, rsvpResponse)
      if (result.success && rsvpResponse === "yes") {
        const message = encodeURIComponent(
          `Hi, this is ${inviteeName}. I have confirmed my attendance for the AI 4 Andhra Police Hackathon.`
        )
        window.location.href = `https://wa.me/917989432127?text=${message}`
      }
      setIsDisabled(false)
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br  rounded-2xl from-[#23243a] via-[#2d2e4a] to-[#1e1e2f]">
      {/* Header */}
      <header className="py-4 px-4 sm:px-8 flex justify-center sm:justify-start">
        <img
          src="https://ai4andhrapolice.com/wp-content/uploads/2025/05/ai4appolice-logo-2.png"
          alt="AI 4 Andhra Police Hackathon"
          className="h-12 sm:h-14 w-auto drop-shadow-lg"
        />
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-6 sm:p-10">
          {alreadyResponded ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                {currentResponse === "yes" ? (
                  <CheckCircle className="h-20 w-20 text-green-500 animate-bounce drop-shadow-lg" />
                ) : (
                  <XCircle className="h-20 w-20 text-red-500 animate-bounce drop-shadow-lg" />
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Thank you for your response!
              </h3>
              <p className="text-gray-700 text-base sm:text-lg">
                You have {currentResponse === "yes" ? "confirmed your attendance" : "declined the invitation"}.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#23243a] mb-1">Will you attend?</h2>
                <p className="text-gray-600 text-sm sm:text-base">Please let us know your RSVP below.</p>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <Button
                  onClick={() => handleSubmit("yes")}
                  disabled={isPending || alreadyResponded || isDisabled}
                  className="w-full h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:ring-4 focus:ring-green-200 rounded-xl shadow-md"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Yes, I'll attend
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center mt-4">
                  <span className="h-px w-12 bg-gray-300" />
                  <span className="mx-3 text-gray-400 text-sm">or</span>
                  <span className="h-px w-12 bg-gray-300" />
                </div>

                <Button
                  onClick={() => handleSubmit("no")}
                  disabled={isPending || alreadyResponded || isDisabled}
                  variant="destructive"
                  className="w-full h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:ring-4 focus:ring-red-200 rounded-xl shadow-md"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      No, I can't attend
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-gray-500 text-xs sm:text-sm mt-2">
                We appreciate your quick response!
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-400 text-xs sm:text-sm">
        © {new Date().getFullYear()} AI 4 Andhra Police Hackathon
      </footer>
    </div>
  )
}
