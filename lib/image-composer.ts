// FIX: Updated image composer to properly handle designations
// Import the font utilities
import { getFontFallback, getFontWeight } from "./font-utils"

export async function composePersonalizedImage(
  backgroundImageUrl: string,
  qrCodeDataUrl: string,
  name: string,
  composition: any,
  designation?: string | null,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    const backgroundImg = new Image()
    backgroundImg.crossOrigin = "anonymous"

    backgroundImg.onload = () => {
      // Set canvas size to match background image
      canvas.width = backgroundImg.width
      canvas.height = backgroundImg.height

      // Draw background image
      ctx.drawImage(backgroundImg, 0, 0)

      // Load and draw QR code
      const qrImg = new Image()
      qrImg.crossOrigin = "anonymous"

      qrImg.onload = () => {
        // Draw QR code
        ctx.drawImage(
          qrImg,
          composition.qrPosition.x,
          composition.qrPosition.y,
          composition.qrPosition.size,
          composition.qrPosition.size,
        )

        // Draw name text
        const nameFontFamily = getFontFallback(composition.nameFont || "Arial")
        const nameFontWeight = getFontWeight(composition.nameFont || "Arial")
        ctx.fillStyle = composition.nameColor || "#000000"
        ctx.font = `${nameFontWeight} ${composition.namePosition.fontSize}px ${nameFontFamily}`
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.fillText(name, composition.namePosition.x, composition.namePosition.y)

        // Draw designation text if provided
        if (designation && designation.trim()) {
          const designationPosition = composition.designationPosition || {
            x: composition.namePosition.x,
            y: composition.namePosition.y + composition.namePosition.fontSize + 10,
            fontSize: Math.max(16, composition.namePosition.fontSize - 8),
          }

          const designationFontFamily = getFontFallback(composition.designationFont || composition.nameFont || "Arial")
          const designationFontWeight = getFontWeight(composition.designationFont || composition.nameFont || "Arial")

          ctx.fillStyle = composition.designationColor || composition.nameColor || "#000000"
          ctx.font = `${designationFontWeight} ${designationPosition.fontSize}px ${designationFontFamily}`
          ctx.textAlign = "left"
          ctx.textBaseline = "top"

          // Handle long designations with text wrapping
          const maxWidth = canvas.width - designationPosition.x - 50
          const words = designation.split(" ")
          let line = ""
          let y = designationPosition.y

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " "
            const metrics = ctx.measureText(testLine)
            const testWidth = metrics.width

            if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line, designationPosition.x, y)
              line = words[n] + " "
              y += designationPosition.fontSize + 5
            } else {
              line = testLine
            }
          }
          ctx.fillText(line, designationPosition.x, y)
        }

        // Return the composed image as data URL
        resolve(canvas.toDataURL("image/png", 1.0))
      }

      qrImg.onerror = () => reject(new Error("Failed to load QR code image"))
      qrImg.src = qrCodeDataUrl
    }

    backgroundImg.onerror = () => reject(new Error("Failed to load background image"))
    backgroundImg.src = backgroundImageUrl
  })
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = `${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function downloadAllImagesAsZip(
  images: { name: string; dataUrl: string }[],
  zipName: string,
  onProgress?: (current: number, total: number) => void,
) {
  const JSZip = (await import("jszip")).default
  const zip = new JSZip()

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    onProgress?.(i + 1, images.length)

    const response = await fetch(image.dataUrl)
    const blob = await response.blob()
    zip.file(`${image.name}.png`, blob)
  }

  const zipBlob = await zip.generateAsync({ type: "blob" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(zipBlob)
  link.download = `${zipName}-${Date.now()}.zip`
  link.click()
  URL.revokeObjectURL(link.href)
}

export async function downloadAllImagesIndividually(
  images: { name: string; dataUrl: string }[],
  onProgress?: (current: number, total: number) => void,
) {
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    onProgress?.(i + 1, images.length)

    downloadImage(image.dataUrl, image.name)

    // Small delay between downloads to prevent browser blocking
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
