"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type KeyboardShortcut, formatShortcut } from "@/lib/keyboard-shortcuts"

interface KeyboardShortcutsDialogProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcutsDialog({ isOpen, onClose, shortcuts }: KeyboardShortcutsDialogProps) {
  // Group shortcuts by category
  const editorShortcuts = shortcuts.filter(
    (s) =>
      s.description.includes("Bold") ||
      s.description.includes("Italic") ||
      s.description.includes("Heading") ||
      s.description.includes("list") ||
      s.description.includes("link") ||
      s.description.includes("task"),
  )

  const viewShortcuts = shortcuts.filter((s) => s.description.includes("view") || s.description.includes("Toggle view"))

  const fileShortcuts = shortcuts.filter(
    (s) => s.description.includes("Save") || s.description.includes("Export") || s.description.includes("summary"),
  )

  const otherShortcuts = shortcuts.filter(
    (s) => !editorShortcuts.includes(s) && !viewShortcuts.includes(s) && !fileShortcuts.includes(s),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-md border-gray-100 p-4">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-light">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase text-gray-500">Formatting</h3>
              <div className="space-y-1">
                {editorShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{shortcut.description}</span>
                    <kbd className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-1 text-xs font-medium uppercase text-gray-500">View</h3>
              <div className="space-y-1">
                {viewShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{shortcut.description}</span>
                    <kbd className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-1 text-xs font-medium uppercase text-gray-500">File</h3>
              <div className="space-y-1">
                {fileShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{shortcut.description}</span>
                    <kbd className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {otherShortcuts.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-medium uppercase text-gray-500">Other</h3>
                <div className="space-y-1">
                  {otherShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{shortcut.description}</span>
                      <kbd className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
