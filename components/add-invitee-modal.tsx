"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createServerClient } from "@/lib/supabase"
import { generateUniqueToken } from "@/lib/utils/crypto"

interface AddInviteeModalProps {
  onClose: () => void
  onAdd: (invitee: any) => void
}

export function AddInviteeModal({ onClose, onAdd }: AddInviteeModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createServerClient()
      const uniqueToken = generateUniqueToken()

      const { data, error } = await supabase
        .from("invitees")
        .insert({
          name,
          email: email || null,
          unique_token: uniqueToken,
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding invitee:", error)
        return
      }

      onAdd(data)
    } catch (error) {
      console.error("Error adding invitee:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Invitee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Adding..." : "Add Invitee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
