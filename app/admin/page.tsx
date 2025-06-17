import { AdminDashboard } from "@/components/admin-dashboard"
import { createServerClient } from "@/lib/supabase"

async function getInvitees() {
  const supabase = createServerClient()

  const { data: invitees, error } = await supabase.from("invitees").select("*").order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching invitees:", error)
    return []
  }

  return invitees || []
}

export default async function AdminPage() {
  const invitees = await getInvitees()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard invitees={invitees} />
    </div>
  )
}
