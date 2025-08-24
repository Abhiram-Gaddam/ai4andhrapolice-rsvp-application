import * as XLSX from "xlsx"

export interface ParsedInvitee {
  name: string
  designation?: string
}

export async function parseExcelFile(file: File): Promise<ParsedInvitee[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        const invitees: ParsedInvitee[] = []

        // Process data starting from row 2 (skip header)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]

          // Skip empty rows
          if (!row || row.length === 0) continue

          const name = String(row[0] || "").trim()
          const designation = String(row[1] || "").trim()

          // Only add if name exists and is not a header
          if (name && name !== "" && name.toLowerCase() !== "name") {
            invitees.push({
              name,
              designation:
                designation && designation !== "" && designation.toLowerCase() !== "designation"
                  ? designation
                  : undefined,
            })
          }
        }

        console.log(`Parsed ${invitees.length} invitees from Excel file`)
        resolve(invitees)
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        reject(new Error("Failed to parse Excel file. Please check the format and try again."))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsBinaryString(file)
  })
}

export async function parseCSVFile(file: File): Promise<ParsedInvitee[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n")
        const invitees: ParsedInvitee[] = []

        // Process data starting from line 2 (skip header)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()

          // Skip empty lines
          if (!line) continue

          // Parse CSV line (handle quoted values)
          const columns = parseCSVLine(line)
          const name = (columns[0] || "").trim()
          const designation = (columns[1] || "").trim()

          // Only add if name exists and is not a header
          if (name && name !== "" && name.toLowerCase() !== "name") {
            invitees.push({
              name,
              designation:
                designation && designation !== "" && designation.toLowerCase() !== "designation"
                  ? designation
                  : undefined,
            })
          }
        }

        console.log(`Parsed ${invitees.length} invitees from CSV file`)
        resolve(invitees)
      } catch (error) {
        console.error("Error parsing CSV file:", error)
        reject(new Error("Failed to parse CSV file. Please check the format and try again."))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}

// Helper function to parse CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

// Generate sample CSV content
export function generateSampleCSV(): string {
  const headers = ["Name", "Designation"]
  const sampleData = [
    ["John Doe", "Manager"],
    ["Jane Smith", "Developer"],
    ["Mike Johnson", "Designer"],
    ["Sarah Wilson", "Team Lead"],
    ["David Brown", "Director"],
    ["Alice Cooper", "Analyst"],
    ["Bob Martin", "Senior Developer"],
    ["Carol White", "Product Manager"],
    ["Tom Anderson", ""],
    ["Lisa Garcia", "Marketing Specialist"],
  ]

  const csvContent = [headers.join(","), ...sampleData.map((row) => row.map((cell) => `"${cell}"`).join(","))].join(
    "\n",
  )

  return csvContent
}

// Download sample template
export function downloadSampleTemplate(): void {
  const csvContent = generateSampleCSV()
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "invitees-sample-template.csv"
  a.click()
  window.URL.revokeObjectURL(url)
}

// Generate sample Excel file
export function downloadSampleExcel(): void {
  const headers = ["Name", "Designation"]
  const sampleData = [
    ["John Doe", "Manager"],
    ["Jane Smith", "Developer"],
    ["Mike Johnson", "Designer"],
    ["Sarah Wilson", "Team Lead"],
    ["David Brown", "Director"],
    ["Alice Cooper", "Analyst"],
    ["Bob Martin", "Senior Developer"],
    ["Carol White", "Product Manager"],
    ["Tom Anderson", ""],
    ["Lisa Garcia", "Marketing Specialist"],
  ]

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData])

  // Set column widths
  ws["!cols"] = [
    { width: 20 }, // Name column
    { width: 25 }, // Designation column
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Invitees")

  // Download file
  XLSX.writeFile(wb, "invitees-sample-template.xlsx")
}
