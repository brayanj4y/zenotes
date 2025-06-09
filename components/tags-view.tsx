"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TagIcon } from "lucide-react"
import { useNotes } from "@/context/notes-context"
import { formatDate } from "@/lib/utils"

interface TagsViewProps {
  onNoteSelect: (id: string) => void
}

export function TagsView({ onNoteSelect }: TagsViewProps) {
  const { getAllTags, getNotesByTag } = useNotes()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Get all existing tags
  const existingTags = getAllTags()

  // Filter tags based on search
  const filteredTags = searchQuery
    ? existingTags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : existingTags

  // Get notes for selected tag
  const selectedTagNotes = selectedTag ? getNotesByTag(selectedTag) : []

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-light">tags</h1>
      </div>

      <div className="flex h-full">
        <div className="w-64 border-r border-gray-100 p-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags..."
            className="h-9 border-gray-200 mb-4"
          />

          {filteredTags.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No tags found</p>
            </div>
          ) : (
            <div className="space-y-1 overflow-auto h-[calc(100vh-140px)] no-scrollbar">
              {filteredTags.map((tag) => (
                <Button
                  key={tag.name}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1.5 h-auto text-sm ${
                    selectedTag === tag.name ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setSelectedTag(tag.name)}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <TagIcon className="mr-2 h-3.5 w-3.5 text-gray-500" />
                      <span>#{tag.name}</span>
                    </div>
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{tag.count}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          {selectedTag ? (
            <div>
              <h2 className="mb-4 text-lg font-medium">#{selectedTag}</h2>

              {selectedTagNotes.length === 0 ? (
                <div className="rounded-md border border-gray-200 p-6 text-center">
                  <p className="text-gray-500">No notes with this tag</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                  {selectedTagNotes.map((note) => (
                    <li
                      key={note.id}
                      className="cursor-pointer p-4 hover:bg-gray-50"
                      onClick={() => onNoteSelect(note.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium leading-tight">{note.title}</h3>
                          <p className="line-clamp-2 text-sm text-gray-500">
                            {note.content.substring(0, 150).replace(/#/g, "")}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(note.modified)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <TagIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">Select a tag to view notes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
