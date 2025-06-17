"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"

interface Invitee {
  id: string
  name: string
  unique_token: string
}

interface EditNameModalProps {
  invitee: Invitee
  onConfirm: (invitee: Invitee, newName: string) => void
  onClose: () => void
}

export function EditNameModal({ invitee, onConfirm, onClose }: EditNameModalProps) {
  const [newName, setNewName] = useState(invitee.name)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!newName.trim() || newName.trim() === invitee.name) return

    setLoading(true)
    try {
      await onConfirm(invitee, newName.trim())
    } finally {
      setLoading(false)
    }
  }

  const hasChanged = newName.trim() !== invitee.name && newName.trim() !== ""

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-500" />
            Edit Invitee Name
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentName">Current Name</Label>
            <Input id="currentName" value={invitee.name} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newName">New Name *</Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              onKeyPress={(e) => e.key === "Enter" && hasChanged && handleConfirm()}
            />
          </div>

          {hasChanged && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Name will be changed from <strong>"{invitee.name}"</strong> to <strong>"{newName.trim()}"</strong>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !hasChanged}>
            {loading ? "Updating..." : "Update Name"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
