"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Code, Heading2, Minus } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  fontSize: number
}

export function RichTextEditor({ value, onChange, fontSize }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-inside",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-inside",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-100 p-3 rounded font-mono text-sm overflow-auto",
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none outline-none focus:outline-none",
      },
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-10 items-center border-b border-gray-100 px-6 gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-900"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          data-active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-900"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          data-active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-900"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          data-active={editor.isActive("code")}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-900"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
          data-active={editor.isActive("heading", { level: 2 })}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-900"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          data-active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-900"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-gray-500 hover:text-gray-900"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <div
          className="p-6 font-sans outline-none focus:outline-none ProseMirror"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
