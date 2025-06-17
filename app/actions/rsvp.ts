"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function submitRSVP(inviteeId: string, token: string, response: "yes" | "no") {
  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from("invitees")
      .update({
        rsvp_response: response,
        qr_scanned: true,
        rsvp_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", inviteeId)
      .eq("unique_token", token)

    if (error) {
      console.error("Error updating RSVP:", error)
      return { success: false, error: "Failed to submit RSVP" }
    }

    revalidatePath("/admin")
    revalidatePath("/generator")
    return { success: true }
  } catch (error) {
    console.error("Error submitting RSVP:", error)
    return { success: false, error: "Failed to submit RSVP" }
  }
}
