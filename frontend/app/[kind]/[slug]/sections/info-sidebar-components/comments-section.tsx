"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

interface Comment {
  id: string
  content: string
  created_at: string
  user: { display_name: string; image: string | null }
}

interface CommentsSectionProps {
  siteId: string
}

export function CommentsSection({ siteId }: CommentsSectionProps) {
  const router = useRouter()
  const { currentUser, isAuthenticated } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchComments() {
      const supabase = createClient()
      const { data } = await supabase
        .from('heritage_site_comments')
        .select('id, content, created_at, user_id, user_profiles!user_id(display_name, image)')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setComments(data.map((c: any) => ({
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          user: {
            display_name: c.user_profiles?.display_name || 'Anónimo',
            image: c.user_profiles?.image || null,
          },
        })))
      }
      setLoading(false)
    }
    fetchComments()
  }, [siteId])

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    if (!isAuthenticated || !currentUser) { router.push('/auth'); return }

    setSubmitting(true)
    const optimistic: Comment = {
      id: crypto.randomUUID(),
      content: trimmed,
      created_at: new Date().toISOString(),
      user: { display_name: currentUser.name, image: currentUser.avatarUrl || null },
    }
    setComments((prev) => [optimistic, ...prev])
    setText("")

    const supabase = createClient()
    const { error } = await supabase
      .from('heritage_site_comments')
      .insert({ site_id: siteId, user_id: currentUser.id, content: trimmed })

    if (error) {
      toast.error("Error al comentar")
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5">
        <Avatar className="size-6 mt-1.5 shrink-0">
          <AvatarImage src={currentUser?.avatarUrl || undefined} />
          <AvatarFallback className="text-[10px]">{currentUser?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="relative flex-1">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Deja un comentario..."
            className="min-h-24 bg-background resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <div className="absolute bottom-2 right-2 flex justify-end">
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5">
              <Avatar className="size-6 mt-0.5 shrink-0">
                <AvatarImage src={comment.user.image || undefined} />
                <AvatarFallback className="text-[10px]">
                  {comment.user.display_name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-text-strong truncate">
                    {comment.user.display_name}
                  </span>
                  <span className="text-xs text-text-weak shrink-0">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
                <p className="text-sm text-text leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
