"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNotes } from "@/context/notes-context"

interface NewNoteViewProps {
  onNoteCreated: (id: string) => void
}

export function NewNoteView({ onNoteCreated }: NewNoteViewProps) {
  const { templates, addNote } = useNotes()
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [template, setTemplate] = useState<string>("blank")

  // Function to add a new tag
  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  // Function to remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Create a new note
  const createNote = () => {
    // Get the template data
    const templateData = templates[template]

    // Create a new note with the template data and user input
    const newNote = {
      title: title || templateData.title,
      content: templateData.content,
      tags: [...tags, ...templateData.tags],
      isFavorite: false,
    }

    // Add the note and get the ID
    const id = addNote(newNote)

    // Pass the ID back to the parent component
    onNoteCreated(id)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-light">new note</h1>
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={templates[template]?.title || "Untitled Note"}
              className="h-10 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2 items-center border rounded-md p-2 border-gray-200">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm">
                  #{tag}
                  <button className="text-gray-400 hover:text-gray-600" onClick={() => removeTag(tag)}>
                    ×
                  </button>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add tag..."
                  className="w-24 bg-transparent outline-none text-sm"
                />
                <button className="text-sm text-gray-500 hover:text-black" onClick={addTag}>
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Template</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(templates).map(([key, templateData]) => (
                <Button
                  key={key}
                  variant={template === key ? "default" : "outline"}
                  className={`h-auto py-3 justify-start ${
                    template === key ? "bg-gray-900 text-white" : "border-gray-200"
                  }`}
                  onClick={() => setTemplate(key)}
                >
                  <div className="text-left">
                    <div className="font-medium">
                      {key === "blank" ? "Blank" : key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                    <div className="text-xs opacity-70">
                      {key === "blank"
                        ? "Start from scratch"
                        : key === "meeting"
                          ? "Meeting notes template"
                          : key === "journal"
                            ? "Daily journal template"
                            : "Project planning template"}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div className="rounded-md border border-gray-200 p-4 h-48 overflow-auto">
              <div className="prose prose-sm max-w-none">
                <h3 className="mt-0">{title || templates[template]?.title}</h3>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-gray-50 p-2 rounded-md">
                  {templates[template]?.content.substring(0, 300)}
                  {templates[template]?.content.length > 300 ? "..." : ""}
                </pre>
                <div className="flex flex-wrap gap-1 mt-2">
                  {[...new Set([...tags, ...(templates[template]?.tags || [])])].map((tag) => (
                    <span key={tag} className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full bg-gray-900 text-white hover:bg-gray-900/90" onClick={createNote}>
            Create Note
          </Button>
        </div>
      </div>
    </div>
  )
}
