'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { es } from 'date-fns/locale'
import { useUser } from '@/contexts/user-context'
import { createClient } from '@/lib/supabase/client'
import { animitaHref } from '@/lib/routes'
import { TABLES } from '@/lib/animitas'

export interface NewRecuerdo {
  id: string
  who: string
  where: string
  text: string
  timeAgo: string
  href: string
  slug: string
}

// Recuerdos other people left on the animitas you added, newest first.
export function useNewRecuerdos() {
  const { currentUser } = useUser()
  const [recuerdos, setRecuerdos] = useState<NewRecuerdo[]>([])

  useEffect(() => {
    if (!currentUser) return
    const userId = currentUser.id
    let cancelled = false

    async function load() {
      const supabase = createClient()
      const { data: mySites } = await supabase.from(TABLES.animitas).select('id').eq('creator_id', userId)
      if (!mySites?.length) {
        if (!cancelled) setRecuerdos([])
        return
      }
      const { data: comments } = await supabase
        .from(TABLES.comments)
        .select('id, content, created_at, user_id, heritage_sites(title, slug), user_profiles!user_id(display_name)')
        .in('site_id', mySites.map(s => s.id))
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      if (cancelled || !comments) return
      setRecuerdos(comments.map((c: any) => ({
        id: c.id,
        who: c.user_profiles?.display_name || 'Alguien',
        where: c.heritage_sites?.title || 'tu animita',
        text: c.content,
        // "hace 1 hora", not "hace alrededor de 1 hora".
        timeAgo: formatDistanceToNowStrict(new Date(c.created_at), { addSuffix: true, locale: es }),
        href: animitaHref(c.heritage_sites?.slug),
        slug: c.heritage_sites?.slug ?? '',
      })))
    }

    load()
    return () => { cancelled = true }
  }, [currentUser])

  return recuerdos
}
