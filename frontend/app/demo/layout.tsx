/**
 * Demo Mode Layout
 *
 * Provides a clean, isolated environment for recording component demos
 * Optimized for 1080x1350px (Instagram/TikTok portrait) at 4x resolution
 */

import { ReactNode } from 'react'

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Demo Container - Exact Instagram/TikTok portrait dimensions */}
      <div
        className="relative bg-white overflow-hidden shadow-2xl"
        style={{
          width: '1080px',
          height: '1350px',
        }}
      >
        {children}
      </div>

      {/* Recording Indicator (hidden in final export) */}
      <div className="fixed top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
        ● REC
      </div>
    </div>
  )
}
