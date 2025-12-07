"use client"

import React, { createContext, useContext, useState } from "react"

interface CreateSiteData {
  photos: File[]
  name: string
  story: string
  location: { lat: number; lng: number } | null
}

interface CreateSiteContextType {
  data: CreateSiteData
  updateData: (data: Partial<CreateSiteData>) => void
}

const CreateSiteContext = createContext<CreateSiteContextType | undefined>(undefined)

export function CreateSiteProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CreateSiteData>({
    photos: [],
    name: "",
    story: "",
    location: null,
  })

  const updateData = (newData: Partial<CreateSiteData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }

  return (
    <CreateSiteContext.Provider value={{ data, updateData }}>
      {children}
    </CreateSiteContext.Provider>
  )
}

export function useCreateSite() {
  const context = useContext(CreateSiteContext)
  if (context === undefined) {
    throw new Error("useCreateSite must be used within a CreateSiteProvider")
  }
  return context
}
