"use client"


import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useSettings } from "@/context/settings-context"


export function SettingsView() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-light">Settings</h1>

      <div className="space-y-6">
        <Collapsible defaultOpen className="rounded-md border border-gray-100">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
            <h2 className="text-lg font-medium">Profile</h2>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t border-gray-100 p-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => updateSettings({ name: e.target.value })}
                  className="h-9 border-gray-200"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={settings.email}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                  className="h-9 border-gray-200"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen className="rounded-md border border-gray-100">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
            <h2 className="text-lg font-medium">Editor</h2>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t border-gray-100 p-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
                  <span className="text-sm text-gray-500">{settings.fontSize}px</span>
                </div>
                <Slider
                  id="font-size"
                  min={12}
                  max={28}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                  className="py-2"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>


      </div>
    </div>
  )
}
