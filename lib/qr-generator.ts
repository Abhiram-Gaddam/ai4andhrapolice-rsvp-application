import QRCode from "qrcode"

export async function generateQRCode(token: string): Promise<string> {
  try {
    // HARDCODED PRODUCTION URL - NO MORE VERCEL LOGIN BULLSH*T
    const url = `https://rsvp-app-beryl.vercel.app/rsvp?id=${token}`

    console.log("QR Code URL:", url) // Debug log

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
