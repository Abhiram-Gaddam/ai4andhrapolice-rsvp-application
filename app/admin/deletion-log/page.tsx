import { DeletionLogDashboard } from "@/components/deletion-log-dashboard"
import { createServerClient } from "@/lib/supabase"

async function getDeletionLog() {
  const supabase = createServerClient()

  const { data: deletions, error } = await supabase
    .from("deletion_log")
    .select("*")
    .order("deleted_at", { ascending: false })

  if (error) {
    console.error("Error fetching deletion log:", error)
    return []
  }

  return deletions || []
}

export default async function DeletionLogPage() {
  const deletions = await getDeletionLog()

  return (
    <div className="min-h-screen bg-gray-50">
      <DeletionLogDashboard deletions={deletions} />
    </div>
  )
}
