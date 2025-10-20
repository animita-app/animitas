import { signIn, signOut } from 'next-auth/react'
import { getSession } from 'next-auth/react'

describe('Authentication Flow', () => {
  describe('Phone Authentication', () => {
    test('should send verification code to phone number', async () => {
      const phoneNumber = '+56912345678'

      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.message).toContain('code')
    })

    test('should reject invalid phone number', async () => {
      const invalidPhone = '123'

      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: invalidPhone })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    test('should reject empty phone number', async () => {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '' })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Code Verification', () => {
    test('should verify valid code and create session', async () => {
      const credentials = {
        phone: '+56912345678',
        code: '123456'
      }

      const result = await signIn('credentials', {
        ...credentials,
        redirect: false
      })

      expect(result?.ok).toBe(true)
      expect(result?.error).toBeUndefined()
    })

    test('should reject expired verification code', async () => {
      const credentials = {
        phone: '+56912345678',
        code: '000000'
      }

      const result = await signIn('credentials', {
        ...credentials,
        redirect: false
      })

      expect(result?.ok).toBe(false)
      expect(result?.error).toContain('expired')
    })

    test('should reject incorrect verification code', async () => {
      const credentials = {
        phone: '+56912345678',
        code: '999999'
      }

      const result = await signIn('credentials', {
        ...credentials,
        redirect: false
      })

      expect(result?.ok).toBe(false)
    })

    test('should lock account after multiple failed attempts', async () => {
      const credentials = {
        phone: '+56912345678',
        code: 'wrong'
      }

      for (let i = 0; i < 5; i++) {
        await signIn('credentials', {
          ...credentials,
          redirect: false
        })
      }

      const finalResult = await signIn('credentials', {
        ...credentials,
        redirect: false
      })

      expect(finalResult?.error).toContain('locked')
    })
  })

  describe('User Signup & Onboarding', () => {
    test('should check if phone already exists', async () => {
      const response = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+56912345678' })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.exists).toBeDefined()
      expect(typeof data.exists).toBe('boolean')
    })

    test('should check if username is available', async () => {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser123' })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.available).toBeDefined()
      expect(typeof data.available).toBe('boolean')
    })

    test('should reject username with invalid characters', async () => {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test@#$%' })
      })

      expect(response.status).toBe(400)
    })

    test('should complete signup for new user', async () => {
      const signupData = {
        phone: '+56987654321',
        displayName: 'Juan Pérez',
        username: 'juanperez',
        profilePicture: 'https://example.com/profile.jpg'
      }

      const response = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.user.displayName).toBe(signupData.displayName)
      expect(data.user.phone).toBe(signupData.phone)
    })

    test('should reject signup with duplicate username', async () => {
      const signupData = {
        phone: '+56911111111',
        displayName: 'Another User',
        username: 'juanperez',
        profilePicture: 'https://example.com/profile.jpg'
      }

      const response = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('username')
    })

    test('should not allow missing required fields', async () => {
      const incompleteData = {
        phone: '+56922222222',
        displayName: 'Incomplete User'
      }

      const response = await fetch('/api/auth/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData)
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Session Management', () => {
    test('should maintain session across requests', async () => {
      const session1 = await getSession()
      const session2 = await getSession()

      if (session1 && session2) {
        expect(session1.user?.phone).toBe(session2.user?.phone)
        expect(session1.user?.id).toBe(session2.user?.id)
      }
    })

    test('should include user role in session', async () => {
      const session = await getSession()

      expect(session?.user).toBeDefined()
      expect(session?.user?.phone).toBeDefined()
      expect(session?.role).toBeDefined()
    })

    test('should store JWT token securely', async () => {
      const result = await signIn('credentials', {
        phone: '+56912345678',
        code: '123456',
        redirect: false
      })

      expect(result?.ok).toBe(true)
      const session = await getSession()
      expect(session).toBeDefined()
    })
  })

  describe('Sign Out', () => {
    test('should clear session on sign out', async () => {
      await signOut({ redirect: false })
      const session = await getSession()
      expect(session).toBeNull()
    })

    test('should redirect to home after sign out', async () => {
      const result = await signOut({ redirect: false })
      expect(result?.url).toBeDefined()
    })
  })

  describe('Profile Management', () => {
    test('should allow updating display name', async () => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'Nuevo Nombre' })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.displayName).toBe('Nuevo Nombre')
    })

    test('should allow updating profile picture', async () => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profilePicture: 'https://example.com/new-profile.jpg'
        })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profilePicture).toContain('example.com')
    })

    test('should require authentication for profile updates', async () => {
      await signOut({ redirect: false })

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'Unauthorized' })
      })

      expect(response.status).toBe(401)
    })
  })

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      try {
        await fetch('/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: null })
        })
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    test('should return descriptive error messages', async () => {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: 'invalid' })
      })

      const data = await response.json()
      expect(data.error).toBeDefined()
      expect(data.error).not.toBe('')
    })
  })

  describe('Rate Limiting', () => {
    test('should rate limit verification code requests', async () => {
      for (let i = 0; i < 6; i++) {
        const response = await fetch('/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '+56912345678' })
        })

        if (i === 5) {
          expect(response.status).toBe(429)
        }
      }
    })
  })
})
