"use client"

import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  LinkIcon,
  ImageIcon,
  Code,
  Heading,
  Eye,
  Edit,
  Info,
  Star,
  Sparkles,
  Save,
  Keyboard,
  Undo,
  Redo,
  Network,
} from "lucide-react"
import { marked } from "marked"
import { useNotes } from "@/context/notes-context"
import { useSettings } from "@/context/settings-context"
import { summarizeNote } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { type KeyboardShortcut, matchShortcut } from "@/lib/keyboard-shortcuts"
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog"
import { MindMapView } from "./mind-map-view"

interface EditorViewProps {
  noteId: string
  onDetailView: () => void
}

// Configure marked
const setupMarked = () => {
  const renderer = new marked.Renderer()

  // Custom renderer for code blocks (fix signature)
  renderer.code = function ({ text, lang, escaped }: { text: string; lang?: string; escaped?: boolean }) {
    const escapedCode = text.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const highlightedCode = highlightSyntax(escapedCode, lang || "")
    return `<pre><code class="language-${lang || ""}">${highlightedCode}</code></pre>`
  }

  // Custom renderer for list items (fix signature)
  renderer.listitem = function ({ text, task, checked }: { text: string; task?: boolean; checked?: boolean }) {
    if (task) {
      return `<li style="list-style: none; margin-left: -20px;"><input type="checkbox" disabled${checked ? " checked" : ""}/> ${text}</li>`
    }
    return `<li>${text}</li>`
  }

  // Configure marked options
  marked.setOptions({
    renderer,
    breaks: true,
    gfm: true,
  })

  return renderer
}

// Initialize marked
setupMarked()

// Simple syntax highlighting function
function highlightSyntax(code: string, language: string) {
  if (language === "jsx" || language === "tsx") {
    return code
      .replace(
        /(import|export|const|let|var|function|return|if|else|for|while|class|extends|=>)/g,
        '<span class="syntax-keyword">$1</span>',
      )
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="syntax-string">$1</span>')
      .replace(/(\/\/.*)/g, '<span class="syntax-comment">$1</span>')
      .replace(/(\w+)(?=\s*\()/g, '<span class="syntax-function">$1</span>')
      .replace(/(\w+)(?=\s*=)/g, '<span class="syntax-variable">$1</span>')
      .replace(/(&lt;\/?\w+)/g, '<span class="syntax-tag">$1</span>')
      .replace(/(\w+)(?==)/g, '<span class="syntax-attribute">$1</span>')
      .replace(/(&lt;[A-Z]\w+)/g, '<span class="syntax-component">$1</span>')
  }
  return code
}

export default function EditorView({ noteId, onDetailView }: EditorViewProps) {
  const { getNote, updateNote, addTag, removeTag, toggleFavorite } = useNotes()
  const { settings } = useSettings()
  const { toast } = useToast()
  const note = getNote(noteId)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [view, setView] = useState<"split" | "edit" | "preview" | "mindmap">("split")
  const [isFavorite, setIsFavorite] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const lastSavedContentRef = useRef<string>("")
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load note data
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setIsFavorite(note.isFavorite)
      setTags(note.tags)
      setIsLoaded(true)
      lastSavedContentRef.current = note.content
      // Reset undo/redo stacks when loading a new note
      setUndoStack([])
      setRedoStack([])
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
    }, 2000) // Increased to 2 seconds to give more time for undo/redo

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

  // Handle content change with undo/redo history
  const handleContentChange = (newContent: string) => {
    // Only add to undo stack if content actually changed
    if (newContent !== content) {
      setUndoStack((prev) => [...prev, content])
      setRedoStack([]) // Clear redo stack on new changes
      setContent(newContent)
    }
  }

  // Undo function
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const prevContent = undoStack[undoStack.length - 1]
      const newUndoStack = undoStack.slice(0, -1)

      setRedoStack((prev) => [...prev, content])
      setContent(prevContent)
      setUndoStack(newUndoStack)
    }
  }, [content, undoStack])

  // Redo function
  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1]
      const newRedoStack = redoStack.slice(0, -1)

      setUndoStack((prev) => [...prev, content])
      setContent(nextContent)
      setRedoStack(newRedoStack)
    }
  }, [content, redoStack])

  // Function to insert markdown syntax at cursor position
  const insertMarkdown = useCallback(
    (syntax: string, placeholder = "") => {
      if (!editorRef.current) return

      const textarea = editorRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = content.substring(start, end)
      const beforeText = content.substring(0, start)
      const afterText = content.substring(end)

      let newText
      if (selectedText) {
        newText = beforeText + syntax.replace("$1", selectedText) + afterText
      } else {
        newText = beforeText + syntax.replace("$1", placeholder) + afterText
      }

      // Add current content to undo stack
      setUndoStack((prev) => [...prev, content])
      setRedoStack([]) // Clear redo stack
      setContent(newText)

      // Set cursor position after update
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + syntax.indexOf("$1") + (selectedText || placeholder).length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    },
    [content],
  )

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
        // Ensure summary is formatted as markdown bullet points if not already
        let formattedSummary = summary.trim()
        if (!/^[-*] /.test(formattedSummary) && !formattedSummary.startsWith("#")) {
          formattedSummary = formattedSummary
            .split(/\n+/)
            .map(line => line ? `- ${line}` : "")
            .join("\n")
        }
        const summaryWithHeader = `# Summary of \"${title}\"\n\n${formattedSummary}\n\n---\n\n# Original Content\n\n${content}`

        // Add current content to undo stack before summarizing
        setUndoStack((prev) => [...prev, content])
        setRedoStack([]) // Clear redo stack

        setContent(summaryWithHeader)
        updateNote(noteId, { content: summaryWithHeader })
        lastSavedContentRef.current = summaryWithHeader

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

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setView((currentView) => {
      if (currentView === "edit") return "preview"
      if (currentView === "preview") return "split"
      if (currentView === "split") return "mindmap"
      return "edit"
    })
  }, [])

  // Define keyboard shortcuts
  const keyboardShortcuts: KeyboardShortcut[] = [
    {
      key: "s",
      ctrlKey: true,
      description: "Save note",
      handler: handleSave,
    },
    {
      key: "z",
      ctrlKey: true,
      description: "Undo",
      handler: handleUndo,
    },
    {
      key: "y",
      ctrlKey: true,
      description: "Redo",
      handler: handleRedo,
    },
    {
      key: "b",
      ctrlKey: true,
      description: "Bold text",
      handler: () => insertMarkdown("**$1**", "bold text"),
    },
    {
      key: "i",
      ctrlKey: true,
      description: "Italic text",
      handler: () => insertMarkdown("*$1*", "italic text"),
    },
    {
      key: "k",
      ctrlKey: true,
      description: "Insert link",
      handler: () => insertMarkdown("[$1](url)", "Link text"),
    },
    {
      key: "1",
      ctrlKey: true,
      description: "Heading 1",
      handler: () => insertMarkdown("# $1", "Heading 1"),
    },
    {
      key: "2",
      ctrlKey: true,
      description: "Heading 2",
      handler: () => insertMarkdown("## $1", "Heading 2"),
    },
    {
      key: "3",
      ctrlKey: true,
      description: "Heading 3",
      handler: () => insertMarkdown("### $1", "Heading 3"),
    },
    {
      key: "l",
      ctrlKey: true,
      description: "Insert bullet list",
      handler: () => insertMarkdown("\n- $1", "List item"),
    },
    {
      key: "o",
      ctrlKey: true,
      description: "Insert numbered list",
      handler: () => insertMarkdown("\n1. $1", "List item"),
    },
    {
      key: "t",
      ctrlKey: true,
      description: "Insert task list",
      handler: () => insertMarkdown("\n- [ ] $1", "Task"),
    },
    {
      key: "e",
      ctrlKey: true,
      description: "Toggle view mode",
      handler: toggleViewMode,
    },
    {
      key: "f",
      ctrlKey: true,
      description: "Toggle favorite",
      handler: handleToggleFavorite,
    },
    {
      key: "g",
      ctrlKey: true,
      description: "Generate summary",
      handler: handleSummarize,
    },
    {
      key: "/",
      ctrlKey: true,
      description: "Show keyboard shortcuts",
      handler: () => setIsShortcutsDialogOpen(true),
    },
  ]

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (event.target instanceof HTMLInputElement) return

      // Special handling for Ctrl+Z and Ctrl+Y to prevent browser's default behavior
      if ((event.ctrlKey && event.key === "z") || (event.ctrlKey && event.key === "y")) {
        event.preventDefault()
      }

      for (const shortcut of keyboardShortcuts) {
        if (matchShortcut(event, shortcut)) {
          event.preventDefault()
          shortcut.handler()
          return
        }
      }
    },
    [
      handleUndo,
      handleRedo,
      handleSave,
      insertMarkdown,
      toggleViewMode,
      handleToggleFavorite,
      handleSummarize,
      setIsShortcutsDialogOpen,
    ],
  )

  //Add global keyboard shortcut listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown as any)
    return () => {
      document.removeEventListener("keydown", handleKeyDown as any)
    }
  }, [handleKeyDown])

  // Toolbar actions
  const toolbarActions = [
    {
      icon: Undo,
      label: "Undo",
      action: handleUndo,
      shortcut: "Ctrl+Z",
      disabled: undoStack.length === 0,
    },
    {
      icon: Redo,
      label: "Redo",
      action: handleRedo,
      shortcut: "Ctrl+Y",
      disabled: redoStack.length === 0,
    },
    {
      icon: Heading,
      label: "Heading",
      action: () => insertMarkdown("# $1", "Heading"),
      shortcut: "Ctrl+1",
    },
    {
      icon: Bold,
      label: "Bold",
      action: () => insertMarkdown("**$1**", "bold text"),
      shortcut: "Ctrl+B",
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertMarkdown("*$1*", "italic text"),
      shortcut: "Ctrl+I",
    },
    {
      icon: Code,
      label: "Code",
      action: () => insertMarkdown("`$1`", "code"),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertMarkdown("\n- $1", "List item"),
      shortcut: "Ctrl+L",
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertMarkdown("\n1. $1", "List item"),
      shortcut: "Ctrl+O",
    },
    {
      icon: CheckSquare,
      label: "Task List",
      action: () => insertMarkdown("\n- [ ] $1", "Task"),
      shortcut: "Ctrl+T",
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => insertMarkdown("[$1](url)", "Link text"),
      shortcut: "Ctrl+K",
    },
    {
      icon: ImageIcon,
      label: "Image",
      action: () => insertMarkdown("![$1](/placeholder.svg?height=200&width=400)", "Alt text"),
    },
  ]

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

  // Process markdown for preview
  const renderMarkdown = () => {
    try {
      return marked.parse(content)
    } catch (error) {
      console.error("Markdown rendering error:", error)
      return `<p>Error rendering markdown: ${error instanceof Error ? error.message : String(error)}</p>`
    }
  }

  // Sync scroll between editor and preview
  useEffect(() => {
    const handleEditorScroll = () => {
      if (!editorRef.current || !previewRef.current || view !== "split") return

      const editorEl = editorRef.current
      const previewEl = previewRef.current

      const percentage = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight)
      previewEl.scrollTop = percentage * (previewEl.scrollHeight - previewEl.clientHeight)
    }

    const editor = editorRef.current
    if (editor && view === "split") {
      editor.addEventListener("scroll", handleEditorScroll)
    }

    return () => {
      if (editor) {
        editor.removeEventListener("scroll", handleEditorScroll)
      }
    }
  }, [view])

  // Export note as markdown file
  const exportMarkdown = () => {
    if (!note) return

    const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`
    const blob = new Blob([content], { type: "text/markdown" })
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
    <div className="editor-container">
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
            title="Toggle favorite (Ctrl+F)"
          >
            <Star className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-md border-gray-200"
            onClick={handleSummarize}
            disabled={isSummarizing}
            title="Generate summary (Ctrl+G)"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            {isSummarizing ? "Summarizing..." : "Summarize"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-md border-gray-200"
            onClick={exportMarkdown}
            title="Export as Markdown"
          >
            <Save className="mr-1 h-3.5 w-3.5" />
            Export
          </Button>
          {!settings.autoSave && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md border-gray-200"
              onClick={handleSave}
              title="Save (Ctrl+S)"
            >
              Save
            </Button>
          )}
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList className="h-8 bg-gray-50 p-0.5">
              <TabsTrigger
                value="edit"
                className="h-7 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-none"
                title="Edit view (Ctrl+E)"
              >
                <Edit className="mr-1 h-3.5 w-3.5" />
                Edit
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="h-7 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-none"
                title="Preview view (Ctrl+E)"
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="split"
                className="h-7 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-none"
                title="Split view (Ctrl+E)"
              >
                Split
              </TabsTrigger>
              <TabsTrigger
                value="mindmap"
                className="h-7 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-none"
                title="Mind Map view"
              >
                <Network className="mr-1 h-3.5 w-3.5" />
                Mind Map
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setIsShortcutsDialogOpen(true)}
            title="Keyboard shortcuts (Ctrl+/)"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={onDetailView}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-10 items-center border-b border-gray-100 px-6">
        <div className="flex items-center gap-1">
          {toolbarActions.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-900"
              onClick={item.action}
              disabled={item.disabled}
              title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ""}`}
            >
              <item.icon className="h-4 w-4" />
              <span className="sr-only">{item.label}</span>
            </Button>
          ))}
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
            <button className="text-xs text-gray-500 hover:text-black" onClick={handleAddTag}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="editor-content">
        {view === "mindmap" ? (
          <MindMapView content={content} title={title} />
        ) : (
          <>
            {(view === "edit" || view === "split") && (
              <div className={`editor-pane no-scrollbar ${view === "split" ? "w-1/2" : "w-full"}`}>
                <textarea
                  ref={editorRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="h-full w-full resize-none bg-white p-6 font-mono outline-none"
                  style={{ fontSize: `${settings.fontSize}px` }}
                  placeholder="Start writing..."
                />
              </div>
            )}

            {(view === "preview" || view === "split") && (
              <div
                ref={previewRef}
                className={`editor-preview no-scrollbar ${view === "split" ? "w-1/2 border-l border-gray-100" : "w-full"}`}
              >
                <div className="prose prose-sm max-w-none p-6" style={{ fontSize: `${settings.fontSize}px` }}>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown() }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <KeyboardShortcutsDialog
        isOpen={isShortcutsDialogOpen}
        onClose={() => setIsShortcutsDialogOpen(false)}
        shortcuts={keyboardShortcuts}
      />
    </div>
  )
}
