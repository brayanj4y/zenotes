"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Share2, Trash2, Tag, Calendar, Clock } from "lucide-react"
import { useNotes } from "@/context/notes-context"
import { formatDate } from "@/lib/utils"
import { DeleteNoteDialog } from "./delete-note-dialog"

interface NoteDetailViewProps {
  noteId: string
  onClose: () => void
}

export function NoteDetailView({ noteId, onClose }: NoteDetailViewProps) {
  const { getNote, deleteNote, addTag } = useNotes()
  const note = getNote(noteId)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  if (!note) {
    return null
  }

  // Calculate word and character count
  const wordCount = note.content.trim().split(/\s+/).filter(Boolean).length
  const characterCount = note.content.length

  // Handle delete
  const handleDelete = () => {
    deleteNote(noteId)
    onClose()
  }

  // Handle adding a new tag
  const handleAddTag = () => {
    const tag = prompt("Enter a new tag:")
    if (tag && !note.tags.includes(tag)) {
      addTag(noteId, tag)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 flex w-80 flex-col bg-white/95 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-lg font-light">Details</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <h3 className="mb-4 text-xl font-medium">{note.title}</h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(note.created)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Modified: {formatDate(note.modified)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag) => (
                  <Button key={tag} variant="outline" size="sm" className="h-6 rounded-md border-gray-200 px-2 text-xs">
                    #{tag}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 rounded-md border-gray-200 px-2 text-xs text-gray-400"
                  onClick={handleAddTag}
                >
                  + Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Statistics</h4>
              <div className="grid grid-cols-2 gap-2 rounded-md bg-gray-50 p-3 text-sm">
                <div>
                  <p className="text-gray-500">Words</p>
                  <p className="font-medium">{wordCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Characters</p>
                  <p className="font-medium">{characterCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 rounded-md border-gray-200">
              <Share2 className="mr-1 h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-md border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <DeleteNoteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        noteTitle={note.title}
      />
    </div>
  )
}
