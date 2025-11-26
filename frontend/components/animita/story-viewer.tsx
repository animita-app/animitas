import React, { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { X, Heart, Send, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FAKE_USERS } from '@/constants/seedData'
import type { Story } from './story-item'

interface StoryViewerProps {
  animitaId: string
  stories: Story[]
  initialStoryId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ChatMessage {
  id: string
  user: {
    username: string
    avatar: string
  }
  text: string
  isUser?: boolean
}

const FAKE_MESSAGES = [
  "🙏 Amén",
  "Gracias por tanto ❤️",
  "Hermosa animita",
  "Que descanse en paz 🕊️",
  "Siempre en nuestros corazones",
  "🌹🌹🌹",
  "🕯️",
  "❤️",
  "Bendiciones",
  "Gracias por el favor concedido",
  "🙌",
  "✨",
]

function ChatList({ messages }: { messages: ChatMessage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="absolute bottom-20 max-h-[40svh] h-full left-4 right-4 flex flex-col justify-end pointer-events-none mask-t-from-80% mask-t-to-100%">
      <div ref={scrollRef} className="flex flex-col gap-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <Avatar className="w-6 h-6 border border-white/20">
              <AvatarImage src={msg.user.avatar} />
              <AvatarFallback>{msg.user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium leading-none mb-0.5 shadow-black/50 drop-shadow-sm">
                {msg.user.username}
              </span>
              <span className="text-sm text-white font-normal normal-case shadow-black/50 drop-shadow-md">
                {msg.text}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressBar({ active, duration, finished }: { active: boolean, duration: number, finished: boolean }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (finished) {
      setWidth(100)
    } else if (active) {
      setWidth(0)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWidth(100)
        })
      })
    } else {
      setWidth(0)
    }
  }, [active, finished, duration])

  return (
    <div className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
      <div
        className="h-full bg-white"
        style={{
          width: `${width}%`,
          transition: active ? `width ${duration}ms linear` : 'none'
        }}
      />
    </div>
  )
}

export function StoryViewer({ animitaId, stories, initialStoryId, open, onOpenChange }: StoryViewerProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [viewerCount, setViewerCount] = useState(0)
  // We don't need chatHistoryRef anymore as we use a single global chat for the session
  // const chatHistoryRef = useRef<Record<string, ChatMessage[]>>({})

  // Initialize carousel to the clicked story
  useEffect(() => {
    if (api && open) {
      const index = stories.findIndex(s => s.id === initialStoryId)
      if (index !== -1) {
        api.scrollTo(index, true)
        setCurrentStoryIndex(index)
      }
    }
  }, [api, open, initialStoryId, stories])

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrentStoryIndex(api.selectedScrollSnap())
    }

    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  const currentStory = stories[currentStoryIndex]

  // Initialize viewer count
  useEffect(() => {
    if (open) {
      setViewerCount(Math.floor(Math.random() * 3800) + 1200)
    }
  }, [open, currentStoryIndex])

  // Increment viewer count
  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5))
    }, 2000)
    return () => clearInterval(interval)
  }, [open])

  // Load messages for the animita (global chat)
  useEffect(() => {
    if (open) {
      const storedMessages = JSON.parse(localStorage.getItem(`animita-chat-${animitaId}`) || '[]')

      // If no stored messages, pre-populate with 3-4 random messages
      if (storedMessages.length === 0) {
        const initialMessages = Array.from({ length: Math.floor(Math.random() * 2) + 3 }).map(() => {
          const userKeys = Object.keys(FAKE_USERS).filter(k => k !== 'current-user')
          const randomUserKey = userKeys[Math.floor(Math.random() * userKeys.length)]
          return {
            id: Math.random().toString(36).substring(7),
            user: FAKE_USERS[randomUserKey],
            text: FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)]
          }
        })
        setMessages(initialMessages)
        localStorage.setItem(`animita-chat-${animitaId}`, JSON.stringify(initialMessages))
      } else {
        setMessages(storedMessages)
      }
    }
  }, [open, animitaId])

  // Generate fake messages continuously
  useEffect(() => {
    if (!open) return

    const generateMessage = () => {
      const userKeys = Object.keys(FAKE_USERS).filter(k => k !== 'current-user')
      const randomUserKey = userKeys[Math.floor(Math.random() * userKeys.length)]
      const randomUser = FAKE_USERS[randomUserKey]
      const randomText = FAKE_MESSAGES[Math.floor(Math.random() * FAKE_MESSAGES.length)]

      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        user: randomUser,
        text: randomText
      }

      setMessages(prev => {
        const newMessages = [...prev.slice(-20), newMessage]
        return newMessages
      })
    }

    let timeoutId: NodeJS.Timeout

    const scheduleNextMessage = () => {
      const delay = Math.random() * 4000 + 1000 // 1s to 5s
      timeoutId = setTimeout(() => {
        generateMessage()
        scheduleNextMessage()
      }, delay)
    }

    scheduleNextMessage()

    return () => clearTimeout(timeoutId)
  }, [open, currentStory])

  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentStory) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: FAKE_USERS['current-user'],
      text: inputValue,
      isUser: true
    }

    setMessages(prev => {
      const newMessages = [...prev, newMessage]
      return newMessages
    })

    // Save to local storage (global for animita)
    const storedMessages = JSON.parse(localStorage.getItem(`animita-chat-${animitaId}`) || '[]')
    localStorage.setItem(`animita-chat-${animitaId}`, JSON.stringify([...storedMessages, newMessage]))

    setInputValue("")
  }

  // Auto-advance logic
  useEffect(() => {
    if (!open || !currentStory || currentStory.isLive) return

    const duration = currentStory.type === 'image' ? 5000 : 10000

    const timer = setTimeout(() => {
      if (api?.canScrollNext()) {
        api.scrollNext()
      } else {
        onOpenChange(false)
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [currentStory, open, api, onOpenChange])

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore clicks on controls or inputs
    if ((e.target as HTMLElement).closest('button, input')) return

    const { clientX, currentTarget } = e
    const { left, width } = currentTarget.getBoundingClientRect()
    const x = clientX - left

    if (x < width / 2) {
      if (api?.canScrollPrev()) {
        api.scrollPrev()
      }
    } else {
      if (api?.canScrollNext()) {
        api.scrollNext()
      } else {
        onOpenChange(false)
      }
    }
  }

  if (!currentStory) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&_svg:not(.w-7)]:hidden max-w-md w-full h-[100dvh] p-0 border-none bg-black text-white gap-0 !rounded-none sm:!rounded-xl overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Historias</DialogTitle>
          <DialogDescription>Viendo historia de {currentStory.user.username}</DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-full bg-black flex flex-col" onClick={handleTap}>
          {/* Progress Bar */}
          <div className="absolute top-2 left-2 right-2 z-50 flex gap-1 pointer-events-none">
            {stories.map((story, idx) => (
              <ProgressBar
                key={story.id}
                active={idx === currentStoryIndex}
                finished={idx < currentStoryIndex}
                duration={story.type === 'image' ? 5000 : 10000}
              />
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-4 right-2 z-50 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <Avatar className="w-8 h-8 border border-white/20">
                <AvatarImage src={currentStory.user.avatar} />
                <AvatarFallback>{currentStory.user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white">
                  {currentStory.user.username}
                </span>
                <span className="text-xs text-white/70">
                  {currentStory.isLive ? 'En vivo ahora' : 'Hace 2h'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
              {currentStory.isLive && (
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                  {/* <Eye className="text-white size-3" /> */}
                  <span className="text-xs font-normal text-white">
                    {(viewerCount / 1000).toFixed(1)}k
                  </span>
                </div>
              )}

              {currentStory.isLive && (
                <Badge className="bg-red-500 text-white border-none px-2 py-0.5 text-xs font-normal">
                  Vivo
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-8 w-8 [&_svg]:!size-6 [&_svg]:!stroke-[1.5px]"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-7 h-7" />
              </Button>
            </div>
          </div>

          {/* Carousel */}
          <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent className="!h-svh ml-0">
              {stories.map((story) => (
                <CarouselItem key={story.id} className="pl-0 h-full relative">
                  <div className="w-full h-full bg-red-400 flex items-center justify-center bg-zinc-900 relative">
                    {story.type === 'image' ? (
                      <Image
                        src={story.src}
                        alt="Story"
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <video
                        src={story.src}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        loop
                        muted={false} // Allow sound if user wants, but maybe start muted? No, stories usually sound on.
                      />
                    )}

                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Chat Overlay */}
          <ChatList messages={messages} />

          {/* Footer / Input */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-50 flex items-center gap-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex-1">
              <Input
                placeholder="Enviar mensaje..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-transparent border-white/30 text-white placeholder:text-white/60 rounded-full pr-10 h-11 focus-visible:ring-white/50"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSendMessage}
                className="absolute right-3 [&_svg]:!block [&_svg]:!size-5 underline text-white top-1/2 -translate-y-1/2 rounded-full"
              >
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
