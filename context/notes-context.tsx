"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Note, NoteTemplate, NotesState } from "@/types/note"

// Default templates
const defaultTemplates: Record<string, NoteTemplate> = {
  blank: {
    title: "Untitled Note",
    content: "",
    tags: [],
  },
  meeting: {
    title: `Meeting Notes`,
    content: `# Meeting Notes

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion
- 

## Action Items
- [ ] 
- [ ] 

## Next Steps
- 
`,
    tags: ["meeting", "notes"],
  },
  journal: {
    title: `Journal Entry`,
    content: `# Journal Entry

## Today's Focus
- 

## Thoughts
- 

## Gratitude
- 

## Tomorrow's Plan
- 
`,
    tags: ["journal", "personal"],
  },
  project: {
    title: "New Project",
    content: `# Project

## Overview
- 

## Goals
- 

## Timeline
- Start: 
- Milestones:
- Deadline: 

## Tasks
- [ ] 
- [ ] 
- [ ] 

## Resources
- 
`,
    tags: ["project", "planning"],
  },
}

// Sample notes for first-time users
const sampleNotes: Note[] = [
  {
    id: "sample-1",
    title: "Welcome to Zenotes",
    content: `# Welcome to Zenotes!

This is your first note. Here are some things you can do:

## Features

- Create new notes with different templates
- Organize notes with tags
- Mark important notes as favorites
- Search through all your notes
- Format your notes with Markdown

## Markdown Tips

You can use Markdown to format your notes:

- **Bold text** with \`**double asterisks**\`
- *Italic text* with \`*single asterisks*\`
- # Headers with \`# hashtags\`
- Lists with \`- dashes\` or \`1. numbers\`
- [Links](https://example.com) with \`[text](url)\`
- Code blocks with \`\`\`backticks\`\`\`

Enjoy using Zenotes!
`,
    tags: ["welcome", "tutorial"],
    isFavorite: true,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  },
]

// Initial state
const initialState: NotesState = {
  notes: [],
  templates: defaultTemplates,
}

// Create context
interface NotesContextType {
  notes: Note[]
  templates: Record<string, NoteTemplate>
  getNote: (id: string) => Note | undefined
  addNote: (note: Omit<Note, "id" | "created" | "modified">) => string
  updateNote: (id: string, updates: Partial<Omit<Note, "id" | "created">>) => void
  deleteNote: (id: string) => void
  toggleFavorite: (id: string) => void
  addTag: (id: string, tag: string) => void
  removeTag: (id: string, tag: string) => void
  getAllTags: () => { name: string; count: number }[]
  getNotesByTag: (tag: string) => Note[]
  getFavorites: () => Note[]
  searchNotes: (query: string) => Note[]
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// Provider component
export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NotesState>(initialState)

  // Load notes from localStorage on initial render
  useEffect(() => {
    const loadNotes = () => {
      try {
        const savedState = localStorage.getItem("zenotes-data")
        if (savedState) {
          setState(JSON.parse(savedState))
        } else {
          // First time user - set up sample notes
          setState({
            notes: sampleNotes,
            templates: defaultTemplates,
          })
        }
      } catch (error) {
        console.error("Error loading notes from localStorage:", error)
        // Fallback to initial state
        setState({
          notes: sampleNotes,
          templates: defaultTemplates,
        })
      }
    }

    loadNotes()
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    // Skip saving on initial render when notes are empty
    if (state.notes.length === 0 && Object.keys(state.templates).length === 0) return

    try {
      localStorage.setItem("zenotes-data", JSON.stringify(state))
    } catch (error) {
      console.error("Error saving notes to localStorage:", error)
    }
  }, [state])

  // Get a note by ID
  const getNote = (id: string) => {
    return state.notes.find((note) => note.id === id)
  }

  // Add a new note
  const addNote = (note: Omit<Note, "id" | "created" | "modified">) => {
    const id = generateId()
    const now = new Date().toISOString()
    const newNote: Note = {
      ...note,
      id,
      created: now,
      modified: now,
    }

    setState((prevState) => ({
      ...prevState,
      notes: [newNote, ...prevState.notes],
    }))

    return id
  }

  // Update a note
  const updateNote = (id: string, updates: Partial<Omit<Note, "id" | "created">>) => {
    setState((prevState) => ({
      ...prevState,
      notes: prevState.notes.map((note) =>
        note.id === id
          ? {
              ...note,
              ...updates,
              modified: new Date().toISOString(),
            }
          : note,
      ),
    }))
  }

  // Delete a note
  const deleteNote = (id: string) => {
    setState((prevState) => ({
      ...prevState,
      notes: prevState.notes.filter((note) => note.id !== id),
    }))
  }

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setState((prevState) => ({
      ...prevState,
      notes: prevState.notes.map((note) =>
        note.id === id
          ? {
              ...note,
              isFavorite: !note.isFavorite,
              modified: new Date().toISOString(),
            }
          : note,
      ),
    }))
  }

  // Add a tag to a note
  const addTag = (id: string, tag: string) => {
    setState((prevState) => ({
      ...prevState,
      notes: prevState.notes.map((note) => {
        if (note.id === id && !note.tags.includes(tag)) {
          return {
            ...note,
            tags: [...note.tags, tag],
            modified: new Date().toISOString(),
          }
        }
        return note
      }),
    }))
  }

  // Remove a tag from a note
  const removeTag = (id: string, tag: string) => {
    setState((prevState) => ({
      ...prevState,
      notes: prevState.notes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            tags: note.tags.filter((t) => t !== tag),
            modified: new Date().toISOString(),
          }
        }
        return note
      }),
    }))
  }

  // Get all unique tags with counts
  const getAllTags = () => {
    const tagCounts: Record<string, number> = {}

    state.notes.forEach((note) => {
      note.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts).map(([name, count]) => ({ name, count }))
  }

  // Get notes by tag
  const getNotesByTag = (tag: string) => {
    return state.notes.filter((note) => note.tags.includes(tag))
  }

  // Get favorite notes
  const getFavorites = () => {
    return state.notes.filter((note) => note.isFavorite)
  }

  // Search notes
  const searchNotes = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return state.notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
  }

  const value = {
    notes: state.notes,
    templates: state.templates,
    getNote,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    addTag,
    removeTag,
    getAllTags,
    getNotesByTag,
    getFavorites,
    searchNotes,
  }

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

// Custom hook to use the notes context
export function useNotes() {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider")
  }
  return context
}
