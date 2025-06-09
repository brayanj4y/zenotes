"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { LogoutModal } from "./logout-modal"

interface AppLayoutProps {
  children: React.ReactNode
  onViewChange: (view: "notes" | "editor" | "settings" | "detail") => void
  currentView: string
}

export function AppLayout({ children, onViewChange, currentView }: AppLayoutProps) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  return (
    <div className="flex h-screen w-full bg-white">
      <Sidebar onViewChange={onViewChange} currentView={currentView} onLogout={() => setLogoutModalOpen(true)} />
      <main className="flex-1 overflow-auto">{children}</main>

      <LogoutModal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} />
    </div>
  )
}
