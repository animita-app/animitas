"use client"

import { CreateSiteProvider } from "@/contexts/create-site-context"

export default function AddLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CreateSiteProvider>
      <main className="h-svh w-full overflow-hidden">
        {children}
      </main>
    </CreateSiteProvider>
  )
}
