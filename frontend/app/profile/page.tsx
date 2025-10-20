'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { data: session, status } = useSession({ required: true })

  useEffect(() => {
    if (status === 'authenticated') {
      const username = (session.user as any)?.username
      if (username) {
        redirect(`/${username}`)
      } else {
        redirect('/')
      }
    }
  }, [session, status])

  return null
}
