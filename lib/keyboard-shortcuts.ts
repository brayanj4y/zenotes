import type { KeyboardEvent } from "react"

export type ShortcutHandler = () => void

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  handler: ShortcutHandler
}

export function matchShortcut(
  event: KeyboardEvent,
  shortcut: Pick<KeyboardShortcut, "key" | "ctrlKey" | "shiftKey" | "altKey" | "metaKey">,
): boolean {
  // Check if the key matches (case insensitive for letter keys)
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()

  // Check if modifier keys match
  const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
  const shiftMatches = !!shortcut.shiftKey === event.shiftKey
  const altMatches = !!shortcut.altKey === event.altKey
  const metaMatches = !!shortcut.metaKey === event.metaKey

  return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches
}

// Helper to format shortcut for display
export function formatShortcut(
  shortcut: Pick<KeyboardShortcut, "key" | "ctrlKey" | "shiftKey" | "altKey" | "metaKey">,
): string {
  const modifiers = []

  if (shortcut.ctrlKey) modifiers.push("Ctrl")
  if (shortcut.altKey) modifiers.push("Alt")
  if (shortcut.shiftKey) modifiers.push("Shift")
  if (shortcut.metaKey) modifiers.push("⌘")

  const key =
    shortcut.key.length === 1
      ? shortcut.key.toUpperCase()
      : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1)

  return [...modifiers, key].join("+")
}
