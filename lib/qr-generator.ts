import QRCode from "qrcode"

export async function generateQRCode(token: string, baseUrl?: string): Promise<string> {
  try {
    // Determine the base URL with your specific deployment URL as default
    let appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL

    // If we're in the browser and no baseUrl was provided, use the current origin
    if (typeof window !== "undefined" && !baseUrl) {
      appUrl = window.location.origin
    }

    // Use your specific Vercel deployment URL as fallback
    if (!appUrl) {
      appUrl = "https://rsvp-app-beryl.vercel.app"
    }

    const url = `${appUrl}/rsvp?id=${token}`

    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
    return qrCodeDataURL
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}
