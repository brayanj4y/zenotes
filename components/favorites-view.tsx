"use client"

import { Star } from "lucide-react"
import { useNotes } from "@/context/notes-context"
import { formatDate } from "@/lib/utils"

interface FavoritesViewProps {
  onNoteSelect: (id: string) => void
}

export function FavoritesView({ onNoteSelect }: FavoritesViewProps) {
  const { getFavorites } = useNotes()
  const favoriteNotes = getFavorites()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-light">favorites</h1>
      </div>

      <div className="flex-1 p-6">
        {favoriteNotes.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Star className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">No favorite notes yet</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteNotes.map((note) => (
              <div
                key={note.id}
                className="cursor-pointer rounded-md border border-gray-200 p-4 transition-shadow hover:shadow-md"
                onClick={() => onNoteSelect(note.id)}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium leading-tight">{note.title}</h3>
                  <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                  {note.content.substring(0, 150).replace(/#/g, "")}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {note.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(note.modified)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
