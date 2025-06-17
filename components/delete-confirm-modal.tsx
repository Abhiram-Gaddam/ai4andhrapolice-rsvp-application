"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle } from "lucide-react"

interface Invitee {
  id: string
  name: string
  unique_token: string
}

interface DeleteConfirmModalProps {
  invitee: Invitee
  onConfirm: (invitee: Invitee, reason: string) => void
  onClose: () => void
}

export function DeleteConfirmModal({ invitee, onConfirm, onClose }: DeleteConfirmModalProps) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!reason.trim()) return

    setLoading(true)
    try {
      await onConfirm(invitee, reason.trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Invitee
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              You are about to delete <strong>{invitee.name}</strong>. This action cannot be undone.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for deletion *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for deleting this invitee..."
              rows={3}
              required
            />
            <p className="text-xs text-gray-500">This reason will be logged for record keeping.</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading || !reason.trim()}>
            {loading ? "Deleting..." : "Delete Invitee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
