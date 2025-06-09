export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  isFavorite: boolean
  created: string
  modified: string
}

export interface NoteTemplate {
  title: string
  content: string
  tags: string[]
}

export interface NotesState {
  notes: Note[]
  templates: Record<string, NoteTemplate>
}
