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
    <div className="flex h-svh w-full items-center justify-center bg-background-weak p-6">
      <Card className="w-full max-w-sm border-none shadow-sm p-4">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-text-strong">
            {isSignUp ? "Crea tu cuenta" : "Inicia sesión"}
          </CardTitle>
          <CardDescription className="text-sm text-text-weak">
            {isSignUp
              ? "Únete a la red de preservación de animitas"
              : "Ingresa tus credenciales para continuar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 text-base placeholder:text-text-weaker"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                {!isSignUp && (
                  <Button variant="link" className="p-0 h-auto text-sm text-text-weak hover:text-text-strong transition-colors" type="button">
                    ¿Olvidaste tu contraseña?
                  </Button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-base placeholder:text-text-weaker"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-bold"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Registrarse" : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="text-center text-sm text-text-weak">
            {isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta aún?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-accent hover:underline"
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
