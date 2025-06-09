"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, MoreHorizontal, Star, Upload } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNotes } from "@/context/notes-context"
import { formatDate } from "@/lib/utils"
import { DeleteNoteDialog } from "./delete-note-dialog"
import { ImportNoteDialog } from "./import-note-dialog"

interface NotesListProps {
  onNoteSelect: (id: string) => void
  onNoteDetail: (id: string) => void
}

export function NotesList({ onNoteSelect, onNoteDetail }: NotesListProps) {
  const { notes, toggleFavorite, deleteNote } = useNotes()
  const [filter, setFilter] = useState<string | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const filteredNotes = filter ? notes.filter((note) => note.tags.includes(filter)) : notes

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-light">notes</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-black hover:bg-gray-50"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="h-5 w-5" />
            <span className="sr-only">Import Note</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-black hover:bg-gray-50">
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">New Note</span>
          </Button>
        </div>
      </div>

      {filter && (
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-2 text-sm">
          <span>Filtered by:</span>
          <Button
            variant="outline"
            size="sm"
            className="h-6 rounded-md border-gray-200 px-2 text-xs"
            onClick={() => setFilter(null)}
          >
            {filter} ×
          </Button>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12">
          <p className="text-center text-sm text-gray-500">No notes yet</p>
          <Button className="bg-black text-white hover:bg-black/90">Start Writing</Button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto no-scrollbar">
          <ul className="divide-y divide-gray-100">
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className="group cursor-pointer border-l-2 border-transparent px-6 py-3 hover:border-l-black hover:bg-gray-50"
                onClick={() => onNoteSelect(note.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium leading-tight">{note.title}</h3>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {note.content.substring(0, 150).replace(/#/g, "")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 rounded-md ${note.isFavorite ? "text-yellow-400" : "text-gray-400 opacity-0 group-hover:opacity-100"}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(note.id)
                      }}
                    >
                      <Star className="h-4 w-4" fill={note.isFavorite ? "currentColor" : "none"} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onNoteDetail(note.id)
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(note.id)
                          }}
                        >
                          {note.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            setNoteToDelete({ id: note.id, title: note.title })
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1">
                    {note.tags.map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        className="h-5 rounded-md border-gray-200 px-1.5 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFilter(tag)
                        }}
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(note.modified)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {noteToDelete && (
        <DeleteNoteDialog
          isOpen={!!noteToDelete}
          onClose={() => setNoteToDelete(null)}
          onConfirm={() => {
            if (noteToDelete) {
              deleteNote(noteToDelete.id)
            }
          }}
          noteTitle={noteToDelete.title}
        />
      )}

      <ImportNoteDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImportComplete={onNoteSelect}
      />
    </div>
  )
}
