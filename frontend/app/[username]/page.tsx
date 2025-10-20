'use client'

import { useSession, signOut } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getInitials, getErrorMessage } from '@/lib/utils'
import { handleProfileImageUpload, fetchUserMemorials, fetchUserLists } from '@/lib/profile'
import { Pencil, LogOut, Edit2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function UserProfilePage() {
  const params = useParams<{ username: string }>()
  const { username } = params
  const { data: session, update } = useSession()
  const sessionUser = session?.user as any
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any | null>(null)
  const [memorials, setMemorials] = useState<any[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const isOwnProfile = sessionUser?.username === username

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${username}`)

        if (!response.ok) {
          throw new Error('User not found')
        }

        const userData = await response.json()
        setUser(userData)

        const [memorialsData, listsData] = await Promise.all([
          fetchUserMemorials(userData.id),
          fetchUserLists(userData.id)
        ])

        setMemorials(memorialsData || [])
        setLists(listsData || [])
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const imageUrl = await handleProfileImageUpload(file, async () => {
      await update({ image: imageUrl })
      setUser(prev => prev ? { ...prev, profilePicture: imageUrl } : null)
    })
    setUploading(false)
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const displayName = user.displayName || sessionUser?.displayName || sessionUser?.name || 'Usuario'
  const profileImage = user.profilePicture || sessionUser?.image || null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="size-24 text-xl">
                  {profileImage && <AvatarImage src={profileImage} alt={displayName} />}
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <>
                    <button
                      className="absolute bottom-0 right-0 bg-black rounded-full p-2 hover:bg-gray-800 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      aria-label="Edit profile picture"
                    >
                      <Pencil className="size-4 text-white" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-semibold">{displayName}</h1>
                {user.username && <p className="text-muted-foreground">@{user.username}</p>}
              </div>
            </div>

            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            )}
          </div>

          {isOwnProfile && (
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="gap-2"
            >
              <Link href="/edit-profile">
                <Edit2 className="size-4" />
                Edit Profile
              </Link>
            </Button>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Created Memorials</h2>
              {memorials.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No memorials created yet</p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {memorials.map((memorial) => (
                    <Link
                      key={memorial.id}
                      href={`/animita/${memorial.id}`}
                      className="group"
                    >
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-secondary mb-3">
                        {memorial.primaryPerson?.image ? (
                          <Image
                            src={memorial.primaryPerson.image}
                            alt={memorial.name}
                            fill
                            className="object-cover group-hover:opacity-80 transition-opacity"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400" />
                        )}
                      </div>
                      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {memorial.name}
                      </h3>
                      {memorial._count && (
                        <p className="text-xs text-muted-foreground">
                          {memorial._count.candles} candles · {memorial._count.testimonies} testimonies
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Created Lists</h2>
              {lists.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No lists created yet</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lists.map((list) => (
                    <Link
                      key={list.id}
                      href={`/lists/${list.id}`}
                      className="group"
                    >
                      <Card className="p-4 hover:shadow-md transition-shadow h-full">
                        {list.thumbnailPicture && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 bg-secondary">
                            <Image
                              src={list.thumbnailPicture}
                              alt={list.name}
                              fill
                              className="object-cover group-hover:opacity-80 transition-opacity"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {list.name}
                        </h3>
                        {list.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {list.description}
                          </p>
                        )}
                        {list._count && (
                          <p className="text-xs text-muted-foreground mt-3">
                            {list._count.items} memorials · {list._count.saves} saves
                          </p>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
