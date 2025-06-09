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
import Link from "next/link"

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs rounded-md border-gray-100 p-6 sm:max-w-xs">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-center text-xl font-light">Sure you wanna dip out?</DialogTitle>
          <DialogDescription className="text-center text-sm">
            Your notes are saved and will be waiting for you.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-row gap-2">
          <Button variant="outline" className="flex-1 rounded-md border-gray-200" onClick={onClose}>
            Nah
          </Button>
          <Button asChild className="flex-1 rounded-md bg-red-500 text-white hover:bg-red-600">
            <Link href="/">Yeah</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
