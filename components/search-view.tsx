"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Star } from "lucide-react"
import { useNotes } from "@/context/notes-context"
import { formatDate } from "@/lib/utils"

interface SearchViewProps {
  onNoteSelect: (id: string) => void
}

export function SearchView({ onNoteSelect }: SearchViewProps) {
  const { searchNotes } = useNotes()
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<ReturnType<typeof searchNotes>>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Handle search
  const handleSearch = () => {
    setResults(searchNotes(searchQuery))
    setHasSearched(true)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-light">search</h1>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search notes..."
              className="h-10 border-gray-200"
            />
            <Button className="bg-gray-900 text-white hover:bg-gray-900/90" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {hasSearched && (
            <h2 className="mb-4 text-sm font-medium text-gray-500">
              {results.length} {results.length === 1 ? "result" : "results"}
            </h2>
          )}

          {hasSearched && results.length === 0 ? (
            <div className="rounded-md border border-gray-200 p-6 text-center">
              <p className="text-gray-500">No results found</p>
            </div>
          ) : hasSearched ? (
            <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
              {results.map((note) => (
                <li
                  key={note.id}
                  className="group cursor-pointer p-4 hover:bg-gray-50"
                  onClick={() => onNoteSelect(note.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium leading-tight">{note.title}</h3>
                        {note.isFavorite && <Star className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />}
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-500">
                        {note.content.substring(0, 150).replace(/#/g, "")}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(note.modified)}</span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {note.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-md border border-gray-200 p-6">
              <div className="text-center">
                <Search className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-gray-500">Search for notes by title, content, or tags</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
