"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Settings {
  name: string
  email: string
  fontSize: number
  autoSave: boolean
  darkMode: boolean
  defaultView: "split" | "edit" | "preview"
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  toggleDarkMode: () => void
}

const defaultSettings: Settings = {
  name: "Alex Kim",
  email: "alex@zenotes.app",
  fontSize: 14,
  autoSave: true,
  darkMode: false,
  defaultView: "split",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("zenotes-settings")
      if (savedSettings) {
        // Merge saved settings with default settings to ensure all keys exist
        setSettings((prev) => ({
          ...prev,
          ...JSON.parse(savedSettings),
        }))
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("zenotes-settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving settings to localStorage:", error)
    }
  }, [settings])

  // Update settings
  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))

    // Apply dark mode to the document
    if (!settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Apply dark mode on initial load
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings.darkMode])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleDarkMode }}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
