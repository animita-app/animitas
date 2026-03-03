"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex h-svh w-full items-center justify-center bg-background-weak p-6">
      <Card className="w-full max-w-sm border-none shadow-sm p-8 pt-7">
        <CardContent className="p-0">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
