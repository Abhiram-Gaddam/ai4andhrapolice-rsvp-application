import * as XLSX from "xlsx"

export interface ParsedInvitee {
  name: string
  email?: string
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

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        const invitees: ParsedInvitee[] = []

        // Skip header row and process data
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (row && row.length > 0) {
            const name = String(row[0] || "").trim()
            const email = String(row[1] || "").trim()

            if (name && name !== "" && name.toLowerCase() !== "name") {
              invitees.push({
                name,
                email: email && email !== "" ? email : undefined,
              })
            }
          }
        }

        resolve(invitees)
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        reject(new Error("Failed to parse Excel file. Please check the format."))
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

        // Skip header row and process data
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line) {
            const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""))
            const name = columns[0]
            const email = columns[1]

            if (name && name !== "" && name.toLowerCase() !== "name") {
              invitees.push({
                name,
                email: email && email !== "" ? email : undefined,
              })
            }
          }
        }

        resolve(invitees)
      } catch (error) {
        console.error("Error parsing CSV file:", error)
        reject(new Error("Failed to parse CSV file. Please check the format."))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}
