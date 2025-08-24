// SIMPLIFIED: Clean font rendering that actually works
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
      canvas.width = backgroundImg.width
      canvas.height = backgroundImg.height
      ctx.drawImage(backgroundImg, 0, 0)

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

        // FIXED: Use REAL font names that actually work
        const nameFont = composition.nameFont || "Arial"
        const nameFontSize = composition.namePosition.fontSize

        // Use actual working fonts
        if (nameFont === "Dancing Script") {
          ctx.font = `italic 600 ${nameFontSize}px "Dancing Script", cursive`
        } else if (nameFont === "Rajdhani") {
          ctx.font = `600 ${nameFontSize}px "Rajdhani", sans-serif`
        } else {
          ctx.font = `${nameFontSize}px "${nameFont}"`
        }

        ctx.fillStyle = composition.nameColor || "#D4AF37"
        ctx.textAlign = "left"
        ctx.textBaseline = "top"

        // Add shadow for Dancing Script
        if (nameFont === "Dancing Script") {
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
          ctx.shadowBlur = 3
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
        }

        ctx.fillText(name.toUpperCase(), composition.namePosition.x, composition.namePosition.y)

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Draw DESIGNATION
        if (designation && designation.trim()) {
          const designationPosition = composition.designationPosition || {
            x: composition.namePosition.x,
            y: composition.namePosition.y + composition.namePosition.fontSize + 15,
            fontSize: Math.max(18, composition.namePosition.fontSize - 10),
          }

          const designationFont = composition.designationFont || "Rajdhani"
          const designationFontSize = designationPosition.fontSize

          // Use actual working fonts for designation
          if (designationFont === "Rajdhani") {
            ctx.font = `600 ${designationFontSize}px "Rajdhani", sans-serif`
          } else if (designationFont === "Dancing Script") {
            ctx.font = `italic 500 ${designationFontSize}px "Dancing Script", cursive`
          } else {
            ctx.font = `${designationFontSize}px "${designationFont}"`
          }

          ctx.fillStyle = composition.designationColor || "#666666"
          ctx.textAlign = "left"
          ctx.textBaseline = "top"

          // Handle text wrapping
          const maxWidth = canvas.width - designationPosition.x - 50
          const words = designation.split(" ")
          let line = ""
          let y = designationPosition.y

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " "
            const metrics = ctx.measureText(testLine)
            const testWidth = metrics.width

            if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line.toUpperCase(), designationPosition.x, y)
              line = words[n] + " "
              y += designationPosition.fontSize + 8
            } else {
              line = testLine
            }
          }
          ctx.fillText(line.toUpperCase(), designationPosition.x, y)
        }

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
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
