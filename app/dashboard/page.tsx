"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { NotesList } from "@/components/notes-list"
import EditorView from "@/components/editor-view"
import { SettingsView } from "@/components/settings-view"
import { NoteDetailView } from "@/components/note-detail-view"
import { SearchView } from "@/components/search-view"
import { TagsView } from "@/components/tags-view"
import { FavoritesView } from "@/components/favorites-view"
import { NewNoteView } from "@/components/new-note-view"
import { useNotes } from "@/context/notes-context"

type View = "notes" | "editor" | "settings" | "detail" | "search" | "tags" | "favorites" | "new"

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>("notes")
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [viewHistory, setViewHistory] = useState<View[]>(["notes"])
  const { notes } = useNotes()

  // If there are no notes, show the new note view
  if (notes.length === 0 && activeView !== "new" && activeView !== "settings") {
    setActiveView("new")
  }

  const handleNoteSelect = (id: string) => {
    setSelectedNote(id)
    setActiveView("editor")
    setViewHistory([...viewHistory, "editor"])
  }

  const handleViewChange = (view: View) => {
    setActiveView(view)
    setViewHistory([...viewHistory, view])
  }

  const handleNoteDetail = (id: string) => {
    setSelectedNote(id)
    setActiveView("detail")
    setViewHistory([...viewHistory, "detail"])
  }

  const handleNewNote = (id: string) => {
    setSelectedNote(id)
    setActiveView("editor")
    setViewHistory([...viewHistory, "editor"])
  }

  const handleCloseDetail = () => {
    if (viewHistory.length > 1) {
      const previousView = viewHistory[viewHistory.length - 2]
      setActiveView(previousView)
      setViewHistory(viewHistory.slice(0, -1))
    } else {
      setActiveView("notes")
      setViewHistory(["notes"])
    }
  }

  return (
    <AppLayout onViewChange={handleViewChange} currentView={activeView}>
      {activeView === "notes" && <NotesList onNoteSelect={handleNoteSelect} onNoteDetail={handleNoteDetail} />}
      {activeView === "editor" && selectedNote && (
        <EditorView noteId={selectedNote} onDetailView={() => setActiveView("detail")} />
      )}
      {activeView === "settings" && <SettingsView />}
      {activeView === "detail" && selectedNote && (
        <NoteDetailView noteId={selectedNote} onClose={handleCloseDetail} />
      )}
      {activeView === "search" && <SearchView onNoteSelect={handleNoteSelect} />}
      {activeView === "tags" && <TagsView onNoteSelect={handleNoteSelect} />}
      {activeView === "favorites" && <FavoritesView onNoteSelect={handleNoteSelect} />}
      {activeView === "new" && <NewNoteView onNoteCreated={handleNewNote} />}
    </AppLayout>
  )
}
