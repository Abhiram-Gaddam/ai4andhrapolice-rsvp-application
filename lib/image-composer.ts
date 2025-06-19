export interface ImageComposition {
  backgroundImage: string
  qrPosition: { x: number; y: number; size: number }
  namePosition: { x: number; y: number; fontSize: number }
  nameColor: string
  nameFont: string
}

export async function composePersonalizedImage(
  backgroundImageUrl: string,
  qrCodeDataUrl: string,
  inviteeName: string,
  composition: ImageComposition,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Canvas not supported"))
      return
    }

    const backgroundImg = new Image()
    backgroundImg.crossOrigin = "anonymous"

    backgroundImg.onload = () => {
      // ULTRA HIGH QUALITY: 4x scale for maximum sharpness
      const scale = 4
      canvas.width = backgroundImg.width * scale
      canvas.height = backgroundImg.height * scale

      // Scale context for ultra-high DPI
      ctx.scale(scale, scale)

      // Maximum quality settings
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      // Draw background image with perfect quality
      ctx.drawImage(backgroundImg, 0, 0, backgroundImg.width, backgroundImg.height)

      // Load and draw QR code with pixel-perfect precision
      const qrImg = new Image()
      qrImg.onload = () => {
        // CRITICAL: Disable smoothing for QR codes to maintain scanning reliability
        ctx.imageSmoothingEnabled = false

        // Draw QR code at EXACT pixel boundaries for maximum sharpness
        const qrX = Math.round(composition.qrPosition.x)
        const qrY = Math.round(composition.qrPosition.y)
        const qrSize = Math.round(composition.qrPosition.size)

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

        // Re-enable smoothing for text rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        // Enhanced text rendering with premium quality
        ctx.font = `bold ${composition.namePosition.fontSize}px ${composition.nameFont}`
        ctx.fillStyle = composition.nameColor

        // 🎯 KEY FIX: LEFT-ALIGNED TEXT POSITIONING
        ctx.textAlign = "left" // Text starts from X position (not centered)
        ctx.textBaseline = "top" // Text starts from Y position (not middle)

        // Premium text outline for maximum readability
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
        ctx.lineWidth = 3
        ctx.strokeText(inviteeName, composition.namePosition.x, composition.namePosition.y)

        // Add subtle shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
        ctx.shadowBlur = 2
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1

        // Fill the text with premium quality - STARTS AT EXACT POSITION
        ctx.fillText(inviteeName, composition.namePosition.x, composition.namePosition.y)

        // Reset shadow
        ctx.shadowColor = "transparent"

        // Convert to maximum quality PNG (lossless)
        const composedImageDataUrl = canvas.toDataURL("image/png", 1.0)
        resolve(composedImageDataUrl)
      }

      qrImg.onerror = () => reject(new Error("Failed to load QR code"))
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
  link.click()
}

// Enhanced bulk download with progress tracking
export async function downloadAllImagesAsZip(
  images: { name: string; dataUrl: string }[],
  zipName: string,
  onProgress?: (current: number, total: number) => void,
) {
  // Dynamic import to avoid bundling JSZip if not used
  const JSZip = (await import("jszip")).default

  const zip = new JSZip()

  // Add each image to the zip with progress tracking
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    onProgress?.(i + 1, images.length)

    // Convert data URL to blob
    const response = await fetch(image.dataUrl)
    const blob = await response.blob()
    zip.file(`${image.name}.png`, blob)
  }

  // Generate zip file
  const zipBlob = await zip.generateAsync({ type: "blob" })

  // Download zip file
  const link = document.createElement("a")
  link.href = URL.createObjectURL(zipBlob)
  link.download = `${zipName}.zip`
  link.click()

  // Clean up
  URL.revokeObjectURL(link.href)
}

// Individual bulk download (downloads one by one)
export async function downloadAllImagesIndividually(
  images: { name: string; dataUrl: string }[],
  onProgress?: (current: number, total: number) => void,
) {
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    onProgress?.(i + 1, images.length)

    downloadImage(image.dataUrl, image.name)

    // Add delay to prevent browser blocking
    await new Promise((resolve) => setTimeout(resolve, 800))
  }
}
