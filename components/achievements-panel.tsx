"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useGamificationStore } from "@/lib/gamification-store"
import { Trophy, Award, Zap, Target, Compass, Crown } from "lucide-react"

function AchievementCard({ achievement }: { achievement: any }) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "builder":
        return <Trophy className="h-4 w-4" />
      case "speed":
        return <Zap className="h-4 w-4" />
      case "accuracy":
        return <Target className="h-4 w-4" />
      case "explorer":
        return <Compass className="h-4 w-4" />
      case "master":
        return <Crown className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "builder":
        return "text-blue-500"
      case "speed":
        return "text-yellow-500"
      case "accuracy":
        return "text-green-500"
      case "explorer":
        return "text-purple-500"
      case "master":
        return "text-orange-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div
      className={`p-3 rounded-lg border ${
        achievement.unlocked
          ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800"
          : "bg-muted/50 border-muted"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{achievement.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
              {achievement.title}
            </h4>
            <div className={`${getCategoryColor(achievement.category)}`}>{getCategoryIcon(achievement.category)}</div>
          </div>
          <p className={`text-sm ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
            {achievement.description}
          </p>
          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {achievement.unlocked && <Badge variant="secondary">Unlocked</Badge>}
      </div>
    </div>
  )
}

export function AchievementsPanel() {
  const { achievements, playerStats, calculateLevel, getNextLevelExperience } = useGamificationStore()

  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const nextLevelExp = getNextLevelExperience(playerStats.level)
  const currentLevelExp = playerStats.level > 1 ? getNextLevelExperience(playerStats.level - 1) : 0
  const progressToNextLevel = ((playerStats.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Award className="h-5 w-5" />
          Progress & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Level */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Level {playerStats.level}</span>
            <span className="text-xs text-muted-foreground">
              {playerStats.experience} / {nextLevelExp} XP
            </span>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-mono font-bold text-lg">{playerStats.totalChallengesCompleted}</div>
            <div className="text-muted-foreground text-xs">Challenges</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-mono font-bold text-lg">{playerStats.totalScore}</div>
            <div className="text-muted-foreground text-xs">Total Score</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-mono font-bold text-lg">{playerStats.currentStreak}</div>
            <div className="text-muted-foreground text-xs">Current Streak</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-mono font-bold text-lg">
              {playerStats.fastestBuild > 0 ? `${playerStats.fastestBuild.toFixed(1)}s` : "N/A"}
            </div>
            <div className="text-muted-foreground text-xs">Fastest Build</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Achievements</h4>
            <Badge variant="outline">
              {unlockedAchievements.length} / {achievements.length}
            </Badge>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
