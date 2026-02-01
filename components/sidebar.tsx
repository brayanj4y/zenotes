"use client"

import { useState } from "react"
import { FileText, Tag, Star, Search, Settings, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  onViewChange: (view: "notes" | "editor" | "settings" | "detail" | "search" | "tags" | "favorites" | "new") => void
  currentView: string
  onLogout: () => void
}

export function Sidebar({ onViewChange, currentView, onLogout }: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false)

  const navItems = [
    { icon: FileText, label: "Notes", view: "notes" },
    { icon: Tag, label: "Tags", view: "tags" },
    { icon: Star, label: "Favorites", view: "favorites" },
    { icon: Search, label: "Search", view: "search" },
    { icon: Settings, label: "Settings", view: "settings" },
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-screen w-[60px] flex-col items-center border-r border-gray-100 bg-[#f8f9fa] py-4">
        <div className="mb-8 flex h-8 w-8 items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-all duration-200 hover:text-black hover:rotate-3"
          >
            <path
              d="M3 18V6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M7 9L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 13L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 17L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <nav className="flex flex-1 flex-col items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onViewChange("new")}
                className="flex h-8 w-8 items-center justify-center rounded-md text-black hover:bg-gray-200"
              >
                <Plus className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="border-none bg-black text-white">
              <p>New Note</p>
            </TooltipContent>
          </Tooltip>

          {navItems.map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewChange(item.view as any)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                    currentView === item.view ? "text-black" : "text-gray-500 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="border-none bg-black text-white">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-4">
          <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900">
                  <User className="h-5 w-5" />
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="border-none bg-black text-white">
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-48 rounded-md border-gray-100 p-2">
              <div className="mb-2 px-2 py-1.5">
                <p className="text-sm font-medium">alex@zenotes.app</p>
                <p className="text-xs text-gray-500">Free Plan</p>
              </div>
              <DropdownMenuItem className="rounded-md">Account</DropdownMenuItem>
              <DropdownMenuItem className="rounded-md">Upgrade</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  )
}
