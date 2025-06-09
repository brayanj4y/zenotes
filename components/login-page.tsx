"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-4">
      <div className="absolute left-4 top-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-light tracking-tighter">zenotes</h1>
          <p className="text-sm text-gray-500">minimal markdown notes for your thoughts</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="h-10 w-full border-gray-200 bg-white text-sm font-normal hover:bg-gray-50"
            >
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="h-10 w-full border-gray-200 bg-white text-sm font-normal hover:bg-gray-50"
            >
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
            <Button asChild className="w-full bg-black text-white hover:bg-black/90">
              <Link href="/dashboard">Sign in as Guest</Link>
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400">
          <p>
            By continuing, you agree to our{" "}
            <Link href="#" className="underline hover:text-black">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-black">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
