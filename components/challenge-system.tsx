"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useGamificationStore, type Challenge } from "@/lib/gamification-store"
import { useAtomStore } from "@/lib/atom-store"
import { Trophy, Clock, Target, Star, Play, X, Lightbulb, CheckCircle } from "lucide-react"

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { startChallenge } = useGamificationStore()
  const { clearAll } = useAtomStore()

  const handleStartChallenge = () => {
    clearAll()
    startChallenge(challenge.id)
  }

  const getDifficultyColor = (difficulty: Challenge["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500"
      case "intermediate":
        return "bg-yellow-500"
      case "advanced":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDifficultyStars = (difficulty: Challenge["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return 1
      case "intermediate":
        return 2
      case "advanced":
        return 3
      default:
        return 1
    }
  }

  return (
    <Card className={`${challenge.unlocked ? "" : "opacity-50"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              {isClient && challenge.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
              {challenge.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
          </div>
          <Badge variant="secondary" className="ml-2">
            {challenge.targetMolecule.formula}
          </Badge>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < getDifficultyStars(challenge.difficulty) ? "text-yellow-500 fill-current" : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1 capitalize">{challenge.difficulty}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="h-3 w-3" />
            {challenge.maxScore} pts
          </div>

          {challenge.timeLimit && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {challenge.timeLimit}s
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {challenge.completed && challenge.bestScore && (
          <div className="mb-3 p-2 bg-green-50 dark:bg-green-950 rounded border-l-2 border-green-500">
            <div className="flex justify-between text-sm">
              <span>Best Score:</span>
              <span className="font-mono font-bold">{challenge.bestScore}</span>
            </div>
            {challenge.bestTime && (
              <div className="flex justify-between text-sm">
                <span>Best Time:</span>
                <span className="font-mono">{challenge.bestTime.toFixed(1)}s</span>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleStartChallenge}
          disabled={!challenge.unlocked}
          className="w-full"
          variant={challenge.completed ? "outline" : "default"}
        >
          <Play className="h-4 w-4 mr-2" />
          {challenge.completed ? "Play Again" : "Start Challenge"}
        </Button>
      </CardContent>
    </Card>
  )
}

function ActiveChallenge() {
  const { currentChallenge, challengeStartTime, abandonChallenge, completeChallenge } = useGamificationStore()
  const { validation, atoms, bonds } = useAtomStore()
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!challengeStartTime || !isClient) return

    const interval = setInterval(() => {
      setTimeElapsed((Date.now() - challengeStartTime) / 1000)
    }, 100)

    return () => clearInterval(interval)
  }, [challengeStartTime, isClient])

  useEffect(() => {
    if (!currentChallenge || !validation.isValid) return

    // Check if the built molecule matches the challenge target
    if (validation.formula === currentChallenge.targetMolecule.formula) {
      const timeSpent = timeElapsed
      const accuracy = 100 // Perfect match
      let score = currentChallenge.maxScore

      // Time bonus
      if (currentChallenge.timeLimit) {
        const timeBonus = Math.max(0, (currentChallenge.timeLimit - timeSpent) / currentChallenge.timeLimit) * 50
        score += Math.floor(timeBonus)
      }

      completeChallenge(score, accuracy, timeSpent)
    }
  }, [validation, currentChallenge, timeElapsed, completeChallenge])

  if (!currentChallenge) return null

  const timeRemaining = currentChallenge.timeLimit ? Math.max(0, currentChallenge.timeLimit - timeElapsed) : null
  const isTimeUp = timeRemaining !== null && timeRemaining <= 0

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {currentChallenge.title}
          </CardTitle>
          <Button onClick={abandonChallenge} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">{currentChallenge.description}</div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-lg font-mono">
            Target: {currentChallenge.targetMolecule.formula}
          </Badge>
          <Badge variant={validation.formula === currentChallenge.targetMolecule.formula ? "default" : "outline"}>
            Current: {validation.formula || "None"}
          </Badge>
        </div>

        {timeRemaining !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time Remaining:</span>
              <span className={`font-mono ${isTimeUp ? "text-red-500" : ""}`}>
                {Math.max(0, timeRemaining).toFixed(1)}s
              </span>
            </div>
            <Progress value={(timeRemaining / currentChallenge.timeLimit!) * 100} className="h-2" />
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>Time Elapsed:</span>
          <span className="font-mono">{timeElapsed.toFixed(1)}s</span>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button onClick={() => setShowHints(!showHints)} variant="outline" size="sm" className="w-full">
            <Lightbulb className="h-4 w-4 mr-2" />
            {showHints ? "Hide Hints" : "Show Hints"}
          </Button>

          {showHints && (
            <div className="space-y-1">
              {currentChallenge.hints.map((hint, index) => (
                <p key={index} className="text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded border-l-2 border-blue-500">
                  {hint}
                </p>
              ))}
            </div>
          )}
        </div>

        {isTimeUp && (
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">Time's up! Try again to improve your score.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ChallengeSystem() {
  const { challenges, currentChallenge, getUnlockedChallenges } = useGamificationStore()

  if (currentChallenge) {
    return <ActiveChallenge />
  }

  const unlockedChallenges = getUnlockedChallenges()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unlockedChallenges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Complete molecules to unlock challenges!</p>
        ) : (
          <div className="space-y-3">
            {unlockedChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}

        <Separator />

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Progress:</p>
          <p>
            {challenges.filter((c) => c.completed).length} / {challenges.length} challenges completed
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
