'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ProfileSetupProps {
  phone: string
  onSubmit: (data: {
    phone: string
    displayName: string
    username: string
    profilePicture?: string
  }) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function ProfileSetup({
  phone,
  onSubmit,
  isLoading = false,
  error,
}: ProfileSetupProps) {
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (displayName.length < 2) {
      errors.displayName = 'Display name must be at least 2 characters'
    } else if (displayName.length > 100) {
      errors.displayName = 'Display name must be less than 100 characters'
    }

    if (!username.trim()) {
      errors.username = 'Username is required'
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (username.length > 30) {
      errors.username = 'Username must be less than 30 characters'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens'
    }

    setLocalErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        phone,
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        profilePicture: profilePicture.trim() || undefined,
      })
    } catch (err) {
      setLocalErrors({
        submit: err instanceof Error ? err.message : 'Failed to create profile',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-medium">
          Display Name
        </label>
        <Input
          id="displayName"
          type="text"
          placeholder="Your full name or nickname"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value)
            if (localErrors.displayName) {
              setLocalErrors({ ...localErrors, displayName: '' })
            }
          }}
          disabled={isLoading}
        />
        {localErrors.displayName && (
          <p className="text-sm text-red-500">{localErrors.displayName}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <Input
          id="username"
          type="text"
          placeholder="Choose a unique username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value.toLowerCase())
            if (localErrors.username) {
              setLocalErrors({ ...localErrors, username: '' })
            }
          }}
          disabled={isLoading}
        />
        {localErrors.username && (
          <p className="text-sm text-red-500">{localErrors.username}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="profilePicture" className="text-sm font-medium">
          Profile Picture URL (Optional)
        </label>
        <Input
          id="profilePicture"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={profilePicture}
          onChange={(e) => setProfilePicture(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {(error || localErrors.submit) && (
        <p className="text-sm text-red-500">{error || localErrors.submit}</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Profile...
          </>
        ) : (
          'Complete Profile'
        )}
      </Button>
    </form>
  )
}
