import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"
import { NotesProvider } from "@/context/notes-context"
import { SettingsProvider } from "@/context/settings-context"
import { Toaster } from "@/components/ui/toaster"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Zenotes",
  description: "Minimal, Gen Z-Inspired Markdown Note App",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        <SettingsProvider>
          <NotesProvider>{children}</NotesProvider>
        </SettingsProvider>
        <Toaster />
      </body>
    </html>
  )
}
