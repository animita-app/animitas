import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ kind: string; slug: string }>
}

export default async function EditSiteRedirect({ params }: PageProps) {
  const { kind, slug } = await params
  redirect(`/${kind}/${slug}`)
}
