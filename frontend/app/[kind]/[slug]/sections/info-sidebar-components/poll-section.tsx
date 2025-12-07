"use client"

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

type PollOption = {
  id: string
  label: string
  votes: number
}

const POLL_OPTIONS: PollOption[] = [
  { id: "correct", label: "Es correcta", votes: 10 },
  { id: "incomplete", label: "Está incompleta", votes: 5 },
  { id: "errors", label: "Contiene errores", votes: 2 },
]

export function PollSection() {
  const [hasVoted, setHasVoted] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null)

  // Calculate total votes for percentages
  // If user votes, we increment the count for visual feedback
  const totalVotes = POLL_OPTIONS.reduce((acc, curr) => acc + curr.votes, 0) + (hasVoted ? 1 : 0)

  const handleVote = (optionId: string) => {
    setSelectedOption(optionId)
    setHasVoted(true)
    setShowResults(true)
  }

  const toggleResults = () => {
    setShowResults((prev) => !prev)
  }

  return (
    <Card className="!py-0 gap-0 shadow-none">
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-medium">¿Qué te parece esta información?</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-2">
        {POLL_OPTIONS.map((option) => {
          const isSelected = selectedOption === option.id

          // Calculate percentage
          // We add 1 to the specific option if the user voted for it
          const currentVotes = option.votes + (isSelected ? 1 : 0)
          const percentage = totalVotes > 0 ? Math.round((currentVotes / totalVotes) * 100) : 0

          if (showResults) {
            return (
              <div
                key={option.id}
                className="relative px-4 h-9 w-full rounded-md overflow-hidden flex items-center"
              >
                {/* Progress Bar Background */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-secondary transition-all duration-150 ease-out rounded-md"
                  style={{ width: `${percentage}%` }}
                />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between w-full text-sm">
                  <span className="flex items-center gap-2 text-black font-medium truncate mr-2">
                    {option.label}
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </span>

                  <div className="text-xs flex items-center gap-2 text-muted-foreground shrink-0">
                    <span className="font-normal">{currentVotes} votos</span>
                    <span className="font-normal text-right">{percentage}%</span>

                    {/* Mock Avatar for visual fidelity to design */}
                    {(option.votes > 0 && hasVoted) && (
                      <Avatar className="w-6 h-6 border border-background">
                        <AvatarImage src="/pype.png" alt="@pype" />
                        <AvatarFallback>FM</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <Button
              key={option.id}
              onClick={() => handleVote(option.id)}
              variant="secondary"
              className="w-full h-9 active:scale-100 shadow-none"
            >
              {option.label}
            </Button>
          )
        })}
      </CardContent>

      <CardFooter className="px-4 py-2 !pt-2 border-t border-border-weak font-medium">
        {hasVoted ? (
          <div className="h-9 w-full text-sm text-muted-foreground text-center flex items-center justify-center">
            {totalVotes} votos
          </div>
        ) : (
          <Button
            onClick={toggleResults}
            variant="ghost"
            className="w-full"
          >
            {showResults ? "Volver a votar" : "Ver resultados"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
