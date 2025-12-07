"use client"

import { CreateSiteProvider } from "@/contexts/create-site-context"
import { CreationFooter } from "./creation-footer"
import { Header } from "@/components/headers/header"

export default function AddLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CreateSiteProvider>
      <main className="flex-1 w-full max-w-xl mx-auto p-6 pb-24">
        {children}
      </main>
    </CreateSiteProvider>
  )
}
