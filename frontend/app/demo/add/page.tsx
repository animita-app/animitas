/**
 * Demo Mode - Add Form Component
 *
 * Showcases the creation form with all input fields and interactions
 */

'use client'

import { UserProvider } from '@/contexts/user-context'
import AddPage from '@/app/add/page'

export default function AddFormDemoPage() {
  return (
    <UserProvider>
      <div className="w-full h-full overflow-y-auto">
        <AddPage />
      </div>
    </UserProvider>
  )
}
