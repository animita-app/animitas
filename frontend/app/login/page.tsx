"use client"

import * as React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        toast.success("¡Revisa tu correo para confirmar tu cuenta!")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success("¡Bienvenido de vuelta!")
        router.push("/")
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-svh w-full items-center justify-center bg-neutral-50 p-6 dark:bg-neutral-950">
      <Card className="w-full max-w-sm border-none shadow-2xl shadow-neutral-200 dark:shadow-none">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[#FF5A5F]/10 text-[#FF5A5F]">
            <Sparkles className="size-6 shadow-sm" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            {isSignUp ? "Crea tu cuenta" : "Inicia sesión"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Únete a la red de preservación de animitas"
              : "Ingresa tus credenciales para continuar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                {!isSignUp && (
                  <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground" type="button">
                    ¿Olvidaste tu contraseña?
                  </Button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-neutral-800"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSignUp ? "Registrarse" : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta aún?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-[#FF5A5F] hover:underline"
              type="button"
            >
              {isSignUp ? "Inicia sesión" : "Crea una ahora"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
