"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, RotateCcw, Save } from "lucide-react"
import { createClientSideClient } from "@/lib/supabase"
import { DraggablePositioning } from "@/components/draggable-positioning"

interface Invitee {
  id: string
  name: string
  designation?: string | null
  unique_token: string
  custom_qr_position?: any
  custom_name_position?: any
  custom_text_style?: any
}

interface IndividualPositioningModalProps {
  invitee: Invitee
  backgroundImage: string
  globalComposition: any
  onClose: () => void
  onUpdate: (invitee: Invitee) => void
}

export function IndividualPositioningModal({
  invitee,
  backgroundImage,
  globalComposition,
  onClose,
  onUpdate,
}: IndividualPositioningModalProps) {
  const [useCustomPositioning, setUseCustomPositioning] = useState(
    !!(invitee.custom_qr_position || invitee.custom_name_position),
  )
  const [customComposition, setCustomComposition] = useState({
    qrPosition: invitee.custom_qr_position || globalComposition.qrPosition,
    namePosition: invitee.custom_name_position || globalComposition.namePosition,
    nameColor: invitee.custom_text_style?.color || globalComposition.nameColor,
    nameFont: invitee.custom_text_style?.font || globalComposition.nameFont,
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const supabase = createClientSideClient()

      const updateData: any = {}

      if (useCustomPositioning) {
        updateData.custom_qr_position = customComposition.qrPosition
        updateData.custom_name_position = customComposition.namePosition
        updateData.custom_text_style = {
          color: customComposition.nameColor,
          font: customComposition.nameFont,
        }
      } else {
        // Clear custom positioning
        updateData.custom_qr_position = null
        updateData.custom_name_position = null
        updateData.custom_text_style = null
      }

      const { error } = await supabase.from("invitees").update(updateData).eq("id", invitee.id)

      if (error) {
        console.error("Error updating positioning:", error)
        alert("Failed to save positioning settings")
        return
      }

      // Update the invitee object
      const updatedInvitee = {
        ...invitee,
        custom_qr_position: updateData.custom_qr_position,
        custom_name_position: updateData.custom_name_position,
        custom_text_style: updateData.custom_text_style,
      }

      onUpdate(updatedInvitee)
      onClose()
    } catch (error) {
      console.error("Error saving positioning:", error)
      alert("An error occurred while saving")
    } finally {
      setLoading(false)
    }
  }

  const resetToGlobal = () => {
    setCustomComposition({
      qrPosition: globalComposition.qrPosition,
      namePosition: globalComposition.namePosition,
      nameColor: globalComposition.nameColor,
      nameFont: globalComposition.nameFont,
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Custom Positioning for {invitee.name}
            {invitee.designation && <span className="text-sm text-gray-500">({invitee.designation})</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enable Custom Positioning Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="custom-toggle" className="text-base font-medium">
                Use Custom Positioning
              </Label>
              <p className="text-sm text-gray-600">Override global settings for this specific invitation</p>
            </div>
            <Switch id="custom-toggle" checked={useCustomPositioning} onCheckedChange={setUseCustomPositioning} />
          </div>

          {useCustomPositioning ? (
            <>
              {/* Custom Positioning Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Custom Position Settings</h3>
                  <Button variant="outline" size="sm" onClick={resetToGlobal}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Global
                  </Button>
                </div>

                {/* Draggable Positioning Component */}
                <DraggablePositioning
                  backgroundImage={backgroundImage}
                  composition={customComposition}
                  onCompositionChange={setCustomComposition}
                  sampleName={invitee.name}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>This invitation will use the global positioning settings.</p>
              <p className="text-sm mt-2">Enable custom positioning above to make individual adjustments.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
