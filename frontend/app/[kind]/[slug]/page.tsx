import React from 'react'

interface PageProps {
  params: Promise<{
    kind: string
    slug: string
  }>
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { kind, slug } = await params

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold capitalize mb-4">
        {kind} Detail: {slug}
      </h1>
      <p className="text-muted-foreground">
        Details for {kind} {slug} will appear here.
      </p>
    </div>
  )
}
