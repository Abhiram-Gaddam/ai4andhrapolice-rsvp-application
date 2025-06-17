export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Help & Support</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">How to RSVP</h2>
            <p className="text-gray-600">Scan the QR code you received and follow the prompts.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Need Help?</h2>
            <p className="text-gray-600">Contact the event organizer for assistance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
