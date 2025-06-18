import QRCode from "qrcode"

export async function generateQRCode(token: string): Promise<string> {
  try {
    // ALWAYS use production URL to avoid hydration issues
    const url = `https://rsvp-app-beryl.vercel.app/rsvp?id=${token}`

    // Generate ULTRA HIGH QUALITY QR code optimized for bulk operations
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 2048, // MASSIVE resolution for perfect scanning
      margin: 6, // Extra large margin for reliability
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // Highest error correction
      type: "image/png",
      quality: 1.0,
      rendererOpts: {
        quality: 1.0,
      },
    })
    return qrCodeDataURL
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}
