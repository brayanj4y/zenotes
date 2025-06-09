"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNotes } from "@/context/notes-context"
import { useToast } from "@/hooks/use-toast"

interface ImportNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: (noteId: string) => void
}

export function ImportNoteDialog({ isOpen, onClose, onImportComplete }: ImportNoteDialogProps) {
  const { addNote } = useNotes()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Extract filename without extension as potential title
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
    if (!title) {
      setTitle(nameWithoutExt)
    }

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)
    }
    reader.readAsText(file)
  }

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleImport = () => {
    if (!fileContent) {
      toast({
        title: "No file selected",
        description: "Please select a markdown file to import",
        variant: "destructive",
      })
      return
    }

    const noteId = addNote({
      title: title || fileName || "Imported Note",
      content: fileContent,
      tags,
      isFavorite: false,
    })

    toast({
      title: "Note imported",
      description: "Your note has been imported successfully",
    })

    // Reset form
    setTitle("")
    setTags([])
    setFileContent(null)
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    onImportComplete(noteId)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-md border-gray-100 p-6">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-xl font-light">Import Note</DialogTitle>
          <DialogDescription>Import a markdown file as a new note.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Markdown File</Label>
            <Input
              id="file"
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="cursor-pointer"
            />
            {fileName && <p className="text-xs text-gray-500">Selected: {fileName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="h-9 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 items-center border rounded-md p-2 border-gray-200">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm">
                  #{tag}
                  <button className="text-gray-400 hover:text-gray-600" onClick={() => handleRemoveTag(tag)}>
                    ×
                  </button>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="Add tag..."
                  className="w-24 bg-transparent outline-none text-sm"
                />
                <button className="text-sm text-gray-500 hover:text-black" onClick={handleAddTag}>
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex-row gap-2">
          <Button variant="outline" className="flex-1 rounded-md border-gray-200" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-md bg-black text-white hover:bg-black/90"
            onClick={handleImport}
            disabled={!fileContent}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
