import { QRGenerator } from "@/components/qr-generator"

export default function GeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
          <p className="text-gray-600">
            Create QR codes for your invitees by adding names manually or uploading an Excel file.
          </p>
        </div>
        <QRGenerator />
      </div>
    </div>
  )
}
