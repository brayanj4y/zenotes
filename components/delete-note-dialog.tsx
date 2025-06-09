"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  noteTitle: string
}

export function DeleteNoteDialog({ isOpen, onClose, onConfirm, noteTitle }: DeleteNoteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs rounded-md border-gray-100 p-6 sm:max-w-xs">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-center text-xl font-light">Delete note?</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Are you sure you want to delete "{noteTitle}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-row gap-2">
          <Button variant="outline" className="flex-1 rounded-md border-gray-200" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-md bg-red-500 text-white hover:bg-red-600"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
