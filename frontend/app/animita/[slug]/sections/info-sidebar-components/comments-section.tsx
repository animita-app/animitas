"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { TABLES } from "@/lib/animitas"

const PAGE_SIZE = 5

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  user: { display_name: string; image: string | null }
}

interface CommentItemProps {
  comment: Comment
  isOwn: boolean
  onDelete: (id: string) => Promise<void>
}

function CommentItem({ comment, isOwn, onDelete }: CommentItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(comment.id)
    setDeleting(false)
    setDeleteOpen(false)
  }

  return (
    <div className="flex items-start gap-3 py-2">
      <Avatar className="size-6 mt-0.5 shrink-0">
        <AvatarImage src={comment.user.image || undefined} />
        <AvatarFallback className="text-xs">{comment.user.display_name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2 flex-1">
            <span className="text-sm font-medium text-text-strong">{comment.user.display_name}</span>
            <span className="text-xs text-text-weak">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
            </span>
          </div>

          {isOwn && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-xs" aria-label="Eliminar" className="shrink-0 text-text-weak" onClick={() => setDeleteOpen(true)}>
                    <Trash2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </Tooltip>

              <AlertDialog open={deleteOpen} onOpenChange={(open) => !deleting && setDeleteOpen(open)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar tu comentario?</AlertDialogTitle>
                    <AlertDialogDescription>No se puede recuperar.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel autoFocus disabled={deleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete()
                      }}
                      disabled={deleting}
                    >
                      {deleting && <Spinner />}
                      {deleting ? "Eliminando…" : "Eliminar comentario"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>

        <p className="text-sm text-text leading-relaxed whitespace-pre-line text-pretty">{comment.content}</p>
      </div>
    </div>
  )
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
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    let cancelled = false
    async function fetchComments() {
      const supabase = createClient()
      const { data } = await supabase
        .from(TABLES.comments)
        .select('id, content, created_at, user_id, user_profiles!user_id(display_name, image)')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })

      if (cancelled) return
      setComments((data ?? []).map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        content: c.content,
        created_at: c.created_at,
        user: {
          display_name: c.user_profiles?.display_name || 'Anónimo',
          image: c.user_profiles?.image || null,
        },
      })))
      setLoading(false)
    }
    fetchComments()
    return () => { cancelled = true }
  }, [siteId])

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    if (!isAuthenticated || !currentUser) { router.push('/auth'); return }

    setSubmitting(true)
    const optimistic: Comment = {
      id: crypto.randomUUID(),
      user_id: currentUser.id,
      content: trimmed,
      created_at: new Date().toISOString(),
      user: { display_name: currentUser.name, image: currentUser.avatarUrl || null },
    }
    setComments((prev) => [optimistic, ...prev])
    setText("")

    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLES.comments)
      .insert({ site_id: siteId, user_id: currentUser.id, content: trimmed })
      .select('id, created_at')
      .single()

    if (error || !data) {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      setText(trimmed)
      toast.error("No se pudo publicar el comentario", { description: error?.message })
    } else {
      setComments((prev) => prev.map((c) => c.id === optimistic.id ? { ...c, id: data.id, created_at: data.created_at } : c))
    }
    setSubmitting(false)
  }

  const deleteComment = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from(TABLES.comments).delete().eq('id', id)
    if (error) {
      toast.error("No se pudo eliminar el comentario", { description: error.message })
      return
    }
    setComments(prev => prev.filter(c => c.id !== id))
  }

  const remaining = comments.length - visible

  return (
    <section aria-label="Comentarios" className="space-y-4">
      <div className="flex items-start gap-3">
        <Avatar className="size-6 mt-1.5 shrink-0">
          <AvatarImage src={currentUser?.avatarUrl || undefined} />
          <AvatarFallback className="text-xs">{currentUser?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Deja un recuerdo…"
            aria-label="Recuerdo"
            className="paper-note min-h-24 -rotate-[0.6deg] resize-none rounded-none border-0 px-4 py-2 text-sm shadow-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="road-sign road-sign-text road-sign-action inline-flex rotate-1 items-center gap-2 px-3 py-1.5 disabled:opacity-60"
            >
              {submitting && <Spinner />}
              {submitting ? 'Dejando…' : 'Dejar recuerdo'}
            </button>
          </div>
        </div>
      </div>

      {!loading && comments.length > 0 && (
        <div className="space-y-2">
          {comments.slice(0, visible).map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwn={!!currentUser && currentUser.id === comment.user_id}
              onDelete={deleteComment}
            />
          ))}

          {remaining > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-text-weak"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              {remaining === 1 ? 'Ver 1 comentario más' : `Ver ${Math.min(remaining, PAGE_SIZE)} comentarios más`}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
