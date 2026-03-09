"use client"

import { useRouter } from "next/navigation"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { toast } from "sonner"

type PollOption = {
  id: string
  label: string
  votes: number
}

const OPTION_DEFINITIONS = [
  { id: "correct", label: "Es correcta" },
  { id: "incomplete", label: "Está incompleta" },
  { id: "errors", label: "Contiene errores" },
]

interface PollSectionProps {
  siteId: string
}

export function PollSection({ siteId }: PollSectionProps) {
  const router = useRouter()
  const { currentUser, isAuthenticated } = useUser()
  const [hasVoted, setHasVoted] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null)
  const [animateWidth, setAnimateWidth] = React.useState(false)
  const [voteCounts, setVoteCounts] = React.useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = React.useState(true)

  // Fetch existing votes and user's vote on mount
  React.useEffect(() => {
    async function fetchVotes() {
      const supabase = createClient()

      // Get vote counts grouped by option
      const { data: votes } = await supabase
        .from('heritage_site_votes')
        .select('option')
        .eq('site_id', siteId)

      if (votes) {
        const counts: Record<string, number> = {}
        votes.forEach((v: { option: string }) => {
          counts[v.option] = (counts[v.option] || 0) + 1
        })
        setVoteCounts(counts)
      }

      // Check if current user has already voted
      if (currentUser) {
        const { data: userVote } = await supabase
          .from('heritage_site_votes')
          .select('option')
          .eq('site_id', siteId)
          .eq('user_id', currentUser.id)
          .maybeSingle()

        if (userVote) {
          setSelectedOption(userVote.option)
          setHasVoted(true)
          setShowResults(true)
        }
      }

      setIsLoading(false)
    }

    fetchVotes()
  }, [siteId, currentUser])

  React.useEffect(() => {
    if (showResults) {
      const timer = setTimeout(() => setAnimateWidth(true), 50)
      return () => clearTimeout(timer)
    } else {
      setAnimateWidth(false)
    }
  }, [showResults])

  // Build options with real vote counts
  const options: PollOption[] = OPTION_DEFINITIONS.map((def) => ({
    ...def,
    votes: voteCounts[def.id] || 0,
  }))

  const totalVotes = options.reduce((acc, curr) => acc + curr.votes, 0)

  const handleVote = async (optionId: string) => {
    if (!isAuthenticated || !currentUser) {
      router.push("/auth")
      return
    }

    // Optimistic update
    setSelectedOption(optionId)
    setHasVoted(true)
    setShowResults(true)
    setVoteCounts((prev) => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1,
    }))

    const supabase = createClient()
    const { error } = await supabase
      .from('heritage_site_votes')
      .upsert(
        {
          site_id: siteId,
          user_id: currentUser.id,
          option: optionId,
        },
        { onConflict: 'site_id,user_id' }
      )

    if (error) {
      // Rollback optimistic update
      toast.error("Error al votar")
      setSelectedOption(null)
      setHasVoted(false)
      setShowResults(false)
      setVoteCounts((prev) => ({
        ...prev,
        [optionId]: Math.max((prev[optionId] || 0) - 1, 0),
      }))
    }
  }

  const toggleResults = () => {
    setShowResults((prev) => !prev)
  }

  if (isLoading) {
    return (
      <Card className="!py-0 gap-0 shadow-none">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">¿Qué te parece esta información?</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-full rounded-md bg-background-weaker animate-pulse" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="!py-0 gap-0 shadow-none">
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-medium">¿Qué te parece esta información?</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-2">
        {options.map((option) => {
          const isSelected = selectedOption === option.id
          const currentVotes = option.votes
          const percentage = totalVotes > 0 ? Math.round((currentVotes / totalVotes) * 100) : 0

          return (
            <div key={option.id} className="-ml-1.5 -mr-1 min-h-9">
              {showResults ? (
                <div
                  className="relative pl-3 pr-2 h-9 w-full rounded-md overflow-hidden flex items-center animate-in fade-in slide-in-from-bottom-1 duration-150"
                >
                  {/* Progress Bar Background */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-secondary rounded-md transition-all duration-300 ease-out"
                    style={{ width: animateWidth ? `${percentage}%` : '0%' }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between w-full text-sm">
                    <span className="flex items-center gap-2 text-text-strong font-medium truncate mr-2">
                      {option.label}
                      {isSelected && <CheckCircle2 className="text-text-strong" />}
                    </span>

                    <div className="text-xs flex items-center gap-2 text-text-weak shrink-0">
                      <span className="font-normal">{currentVotes} {currentVotes === 1 ? "voto" : "votos"}</span>
                      <span className="font-normal text-right">{percentage}%</span>

                      {isSelected && hasVoted && currentUser && (
                        <Avatar className="w-6 h-6 border border-background animate-in fade-in zoom-in-50 duration-150">
                          <AvatarImage src={currentUser.avatarUrl || "/pype.png"} alt={currentUser.name} />
                          <AvatarFallback>{currentUser.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-150">
                  <Button
                    onClick={() => handleVote(option.id)}
                    variant="secondary"
                    className="w-full h-9 active:scale-100 shadow-none"
                  >
                    {option.label}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>

      <CardFooter className="px-4 py-2 !pt-2 border-t border-border-weak font-medium">
        <div className="w-full animate-in fade-in duration-500">
            <div className="h-9 w-full text-sm text-text-weak text-center flex items-center justify-center">
              {totalVotes} {totalVotes === 1 ? "voto" : "votos"}
              {/* {showResults && (
                <Button
                  onClick={toggleResults}
                  variant="link"
                  className="w-fit !p-0 ml-1.5 text-text-weak underline text-sm"
                >
                  {showResults ? "Volver a votar" : "Ver resultados"}
                </Button>
              )} */}
            </div>
        </div>
      </CardFooter>
    </Card>
  )
}
