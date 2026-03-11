"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Ellipsis, SmilePlus, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmojiPicker } from "@/components/ui/emoji-picker"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PAGE_SIZE = 5

type SortOrder = "recent" | "popular"

interface CommentReaction {
  emoji: string
  count: number
  hasReacted: boolean
}

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  user: { display_name: string; image: string | null }
  reactions: CommentReaction[]
}

interface CommentsSectionProps {
  siteId: string
}

function groupReactions(
  rows: { emoji: string; user_id: string }[],
  currentUserId?: string
): CommentReaction[] {
  const map: Record<string, { count: number; hasReacted: boolean }> = {}
  for (const { emoji, user_id } of rows) {
    if (!map[emoji]) map[emoji] = { count: 0, hasReacted: false }
    map[emoji].count++
    if (user_id === currentUserId) map[emoji].hasReacted = true
  }
  return Object.entries(map).map(([emoji, d]) => ({ emoji, ...d }))
}

function totalReactions(comment: Comment) {
  return comment.reactions.reduce((sum, r) => sum + r.count, 0)
}

// ─── CommentItem ──────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onDelete: (id: string) => Promise<void>
  onReaction: (commentId: string, emoji: string) => void
}

function CommentItem({ comment, currentUserId, onDelete, onReaction }: CommentItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isOwn = !!currentUserId && currentUserId === comment.user_id

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(comment.id)
    setDeleteOpen(false)
    setDeleting(false)
  }

  return (
    <div className="flex items-start gap-2.5 py-2">
      <Avatar className="size-6 mt-0.5 shrink-0">
        <AvatarImage src={comment.user.image || undefined} />
        <AvatarFallback className="text-[10px]">
          {comment.user.display_name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-2 min-w-0 flex-1">
            <span className="text-sm font-medium text-text-strong truncate">
              {comment.user.display_name}
            </span>
            <span className="text-xs text-text-weak shrink-0">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
            </span>
          </div>

          {isOwn && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs" className="shrink-0 text-text-weak">
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => setDeleteOpen(true)}
                  >
                    <Trash2 />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                      {deleting ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>

        <p className="text-sm text-text leading-relaxed">{comment.content}</p>

        <div className="-ml-1 mt-3 flex items-center gap-1 flex-wrap">
          {comment.reactions.map(reaction => (
            <Badge
              key={reaction.emoji}
              variant="outline"
              onClick={() => onReaction(comment.id, reaction.emoji)}
              className={cn(
                "h-6 font-normal gap-1 cursor-pointer transition-colors text-xs px-1.5",
                reaction.hasReacted && "border-[1.5px] border-text-strong bg-text-strong/5 hover:bg-text-strong/10"
              )}
            >
              <span>{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </Badge>
          ))}
          <EmojiPicker
            onSelect={(emoji) => onReaction(comment.id, emoji)}
            trigger={
              <Button variant="outline" size="icon" className="size-6 flex items-center justify-center rounded-md text-text-weak hover:text-text-strong hover:bg-background-weaker transition-colors">
                <SmilePlus className="size-3.5" />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}

// ─── CommentsSection ──────────────────────────────────────────────────────────

export function CommentsSection({ siteId }: CommentsSectionProps) {
  const router = useRouter()
  const { currentUser, isAuthenticated } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sort, setSort] = useState<SortOrder>("recent")
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    async function fetchComments() {
      const supabase = createClient()
      const { data } = await supabase
        .from('heritage_site_comments')
        .select(`
          id, content, created_at, user_id,
          user_profiles!user_id(display_name, image),
          heritage_comment_reactions(emoji, user_id)
        `)
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })

      if (data) {
        setComments(data.map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          user: {
            display_name: c.user_profiles?.display_name || 'Anónimo',
            image: c.user_profiles?.image || null,
          },
          reactions: groupReactions(c.heritage_comment_reactions ?? [], currentUser?.id),
        })))
      }
      setLoading(false)
    }
    fetchComments()
  }, [siteId, currentUser?.id])

  const sorted = useMemo(() => {
    if (sort === "popular") {
      return [...comments].sort((a, b) => totalReactions(b) - totalReactions(a))
    }
    return [...comments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [comments, sort])

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    if (!isAuthenticated || !currentUser) { router.push('/auth'); return }

    setSubmitting(true)
    const optimistic: Comment = {
      id: crypto.randomUUID(),
      user_id: currentUser.id,
      content: trimmed,
      created_at: new Date().toISOString(),
      user: { display_name: currentUser.name, image: currentUser.avatarUrl || null },
      reactions: [],
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

  const toggleReaction = async (commentId: string, emoji: string) => {
    if (!isAuthenticated || !currentUser) { router.push('/auth'); return }

    const comment = comments.find(c => c.id === commentId)
    const previousReaction = comment?.reactions.find(r => r.hasReacted)
    const isRemoving = previousReaction?.emoji === emoji

    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c
      let reactions = c.reactions.map(r =>
        r.hasReacted ? { ...r, count: r.count - 1, hasReacted: false } : r
      ).filter(r => r.count > 0)
      if (!isRemoving) {
        const found = reactions.find(r => r.emoji === emoji)
        reactions = found
          ? reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r)
          : [...reactions, { emoji, count: 1, hasReacted: true }]
      }
      return { ...c, reactions }
    }))

    const supabase = createClient()
    await supabase.from('heritage_comment_reactions').delete()
      .eq('comment_id', commentId).eq('user_id', currentUser.id)
    if (!isRemoving) {
      await supabase.from('heritage_comment_reactions')
        .insert({ comment_id: commentId, user_id: currentUser.id, emoji })
    }
  }

  const deleteComment = async (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id))
    const supabase = createClient()
    const { error } = await supabase.from('heritage_site_comments').delete().eq('id', id)
    if (error) toast.error("Error al eliminar comentario")
  }

  const remaining = sorted.length - visible

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

      {!loading && comments.length > 0 && (
        <div className="space-y-0 mt-2">
          <div className="flex justify-end">
            <Select value={sort} onValueChange={(v) => { setSort(v as SortOrder); setVisible(PAGE_SIZE) }}>
              <SelectTrigger className="!border-0 !bg-transparent !shadow-none text-text gap-1 pr-0 focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Más recientes</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {sorted.slice(0, visible).map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUser?.id}
                onDelete={deleteComment}
                onReaction={toggleReaction}
              />
            ))}
          </div>

          {remaining > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-text-weak"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              Ver {Math.min(remaining, PAGE_SIZE)} comentarios más
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
