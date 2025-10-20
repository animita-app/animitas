'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getInitials } from '@/lib/utils'
import { handleProfileImageUpload } from '@/lib/profile'
import { Pencil, LogOut, Edit2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ProfileDetailProps {
  username: string
  onClose: () => void
}

export function ProfileDetail({ username, onClose }: ProfileDetailProps) {
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<string>('')
  const [memorials, setMemorials] = useState<any[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const isOwnProfile = (session?.user as any)?.username === username

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(`/api/profile?username=${username}`)
      const data = await response.json()
      setUser(data.user)
      setProfileImage(data.user?.image || '')
      setDisplayName(data.user?.displayName || data.user?.username || '')
      setMemorials(data.memorials || [])
      setLists(data.lists || [])
    }

    fetchUserData()
  }, [username])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const imageUrl = await handleProfileImageUpload(file)
      if (imageUrl) {
        setProfileImage(imageUrl)
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="size-20 text-lg">
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
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            {user?.username && <p className="text-muted-foreground">@{user.username}</p>}
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

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-3">Created Memorials</h2>
          {memorials.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No memorials created yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {memorials.map((memorial) => (
                <Link
                  key={memorial.id}
                  href={`/animita/${memorial.id}`}
                  className="group"
                  onClick={onClose}
                >
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-secondary mb-2">
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
          <h2 className="text-lg font-semibold mb-3">Created Lists</h2>
          {lists.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No lists created yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lists.map((list) => (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className="group"
                  onClick={onClose}
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
  )
}
