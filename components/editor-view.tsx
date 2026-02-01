"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Save, Keyboard, Info, Star, Sparkles } from "lucide-react"
import { useNotes } from "@/context/notes-context"
import { useSettings } from "@/context/settings-context"
import { summarizeNote } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "./rich-text-editor"
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog"

interface EditorViewProps {
  noteId: string
  onDetailView: () => void
}

export default function EditorView({ noteId, onDetailView }: EditorViewProps) {
  const { getNote, updateNote, addTag, removeTag, toggleFavorite } = useNotes()
  const { settings } = useSettings()
  const { toast } = useToast()
  const note = getNote(noteId)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const lastSavedContentRef = { current: "" }
  const autoSaveTimerRef = { current: null as NodeJS.Timeout | null }

  // Load note data
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setIsFavorite(note.isFavorite)
      setTags(note.tags)
      setIsLoaded(true)
      lastSavedContentRef.current = note.content
    }
  }, [note])

  // Save note when content changes (debounced)
  useEffect(() => {
    if (!isLoaded || !note || !settings.autoSave) return

    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Set a new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      // Only save if content has changed from last save
      if (content !== lastSavedContentRef.current) {
        setIsSaving(true)
        updateNote(noteId, { title, content })
        lastSavedContentRef.current = content
        setIsSaving(false)
      }
    }, 2000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [title, content, noteId, updateNote, isLoaded, note, settings.autoSave])

  // Manual save function
  const handleSave = useCallback(() => {
    if (note) {
      setIsSaving(true)
      updateNote(noteId, { title, content })
      lastSavedContentRef.current = content
      setIsSaving(false)
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      })
    }
  }, [note, noteId, title, content, updateNote, toast])

  // Toggle favorite status
  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite)
    toggleFavorite(noteId)
  }, [isFavorite, noteId, toggleFavorite])

  // Handle AI summarization
  const handleSummarize = useCallback(async () => {
    if (!note || content.trim().length < 50) {
      toast({
        title: "Cannot summarize",
        description: "Note content is too short to summarize",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSummarizing(true)
      const summary = await summarizeNote(content)

      if (summary) {
        const summaryText = `<h2>Summary of "${title}"</h2><p>${summary}</p><hr><h2>Original Content</h2><p>${content}</p>`
        setContent(summaryText)
        updateNote(noteId, { content: summaryText })
        lastSavedContentRef.current = summaryText

        toast({
          title: "Summary generated",
          description: "Your note has been summarized successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive",
      })
    } finally {
      setIsSummarizing(false)
    }
  }, [note, content, title, noteId, updateNote, toast])

  // Function to add a new tag
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      addTag(noteId, newTag)
      setNewTag("")
    }
  }

  // Function to remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
    removeTag(noteId, tagToRemove)
  }

  // Export note as HTML file
  const exportNote = () => {
    if (!note) return

    const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }</style></head><body><h1>${title}</h1>${content}</body></html>`], {
      type: "text/html",
    })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)

    toast({
      title: "Note exported",
      description: `Exported as ${filename}`,
    })
  }

  if (!note) {
    return <div className="p-6 text-center">Note not found</div>
  }

  return (
    <div className="editor-container bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-xl font-light outline-none placeholder:text-gray-400"
            placeholder="Untitled"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${isFavorite ? "text-yellow-400" : "text-gray-400"}`}
            onClick={handleToggleFavorite}
            title="Toggle favorite"
          >
            <Star className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-md border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            onClick={handleSummarize}
            disabled={isSummarizing}
            title="Generate summary"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            {isSummarizing ? "Summarizing..." : "Summarize"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-md border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            onClick={exportNote}
            title="Export note"
          >
            <Save className="mr-1 h-3.5 w-3.5" />
            Export
          </Button>
          {!settings.autoSave && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={handleSave}
              title="Save"
            >
              Save
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-gray-500 hover:text-gray-900"
            onClick={() => setIsShortcutsDialogOpen(true)}
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-gray-500 hover:text-gray-900"
            onClick={onDetailView}
            title="View details"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center px-6 py-2 border-b border-gray-100">
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-xs text-gray-500">Tags:</span>
          {tags.map((tag) => (
            <div key={tag} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md text-xs">
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
              className="ml-1 w-20 bg-transparent text-xs outline-none"
            />
            <button className="text-xs text-gray-500 hover:text-gray-900" onClick={handleAddTag}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <RichTextEditor value={content} onChange={setContent} fontSize={settings.fontSize} />
      </div>

      <KeyboardShortcutsDialog
        isOpen={isShortcutsDialogOpen}
        onClose={() => setIsShortcutsDialogOpen(false)}
        shortcuts={[
          { key: "s", ctrlKey: true, description: "Save note" },
          { key: "b", ctrlKey: true, description: "Bold" },
          { key: "i", ctrlKey: true, description: "Italic" },
          { key: "k", ctrlKey: true, description: "Code" },
        ]}
      />
    </div>
  )
}
