"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useGamificationStore } from "@/lib/gamification-store"
import { Trophy, Award } from "lucide-react"

export function ChallengeCompleteModal() {
  const { showChallengeComplete, dismissChallengeComplete, playerStats } = useGamificationStore()

  return (
    <Dialog open={showChallengeComplete} onOpenChange={dismissChallengeComplete}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Challenge Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>

          <div className="space-y-2">
            <p className="text-lg font-medium">Congratulations!</p>
            <p className="text-muted-foreground">You've successfully completed the challenge!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="font-mono font-bold text-lg">{playerStats.totalScore}</div>
              <div className="text-muted-foreground">Total Score</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="font-mono font-bold text-lg">Level {playerStats.level}</div>
              <div className="text-muted-foreground">Current Level</div>
            </div>
          </div>

          <Button onClick={dismissChallengeComplete} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AchievementUnlockModal() {
  const { showAchievementUnlock, dismissAchievementUnlock } = useGamificationStore()

  if (!showAchievementUnlock) return null

  return (
    <Dialog open={!!showAchievementUnlock} onOpenChange={dismissAchievementUnlock}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Award className="h-6 w-6 text-yellow-500" />
            Achievement Unlocked!
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <div className="text-6xl">{showAchievementUnlock.icon}</div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold">{showAchievementUnlock.title}</h3>
            <p className="text-muted-foreground">{showAchievementUnlock.description}</p>
          </div>

          <Badge variant="secondary" className="text-sm">
            {showAchievementUnlock.category}
          </Badge>

          <Button onClick={dismissAchievementUnlock} className="w-full">
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
