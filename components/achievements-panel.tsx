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
        return "text-blue-400"
      case "speed":
        return "text-yellow-400"
      case "accuracy":
        return "text-green-400"
      case "explorer":
        return "text-purple-400"
      case "master":
        return "text-orange-400"
      default:
        return "text-slate-400"
    }
  }

  return (
    <div
      className={`p-2.5 rounded-lg border transition-all duration-200 ${
        achievement.unlocked
          ? "bg-slate-800/60 border-slate-600/50 hover:bg-slate-800/80"
          : "bg-slate-800/40 border-slate-700/30 opacity-60"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`text-xl ${achievement.unlocked ? "opacity-100" : "opacity-40"}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={`font-medium text-sm ${
              achievement.unlocked ? "text-slate-100" : "text-slate-400"
            }`}>
              {achievement.title}
            </h4>
            <div className={`${getCategoryColor(achievement.category)}`}>
              {getCategoryIcon(achievement.category)}
            </div>
          </div>
          <p className={`text-xs ${
            achievement.unlocked ? "text-slate-300" : "text-slate-500"
          }`}>
            {achievement.description}
          </p>
          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-xs text-slate-400 mt-0.5">
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {achievement.unlocked && (
          <Badge className="bg-emerald-900/30 border-emerald-500/50 text-emerald-300 text-xs">
            ✓ Unlocked
          </Badge>
        )}
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
    <div className="space-y-3">
      {/* Player Level */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-100">Level {playerStats.level}</span>
          <span className="text-xs text-slate-400">
            {playerStats.experience} / {nextLevelExp} XP
          </span>
        </div>
        <Progress value={progressToNextLevel} className="h-2 bg-slate-700" />
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-center p-1.5 bg-slate-800/60 border border-slate-600/50 rounded">
          <div className="font-mono font-bold text-base text-slate-100">{playerStats.totalChallengesCompleted}</div>
          <div className="text-slate-400 text-xs">Challenges</div>
        </div>
        <div className="text-center p-1.5 bg-slate-800/60 border border-slate-600/50 rounded">
          <div className="font-mono font-bold text-base text-slate-100">{playerStats.totalScore}</div>
          <div className="text-slate-400 text-xs">Total Score</div>
        </div>
        <div className="text-center p-1.5 bg-slate-800/60 border border-slate-600/50 rounded">
          <div className="font-mono font-bold text-base text-slate-100">{playerStats.currentStreak}</div>
          <div className="text-slate-400 text-xs">Current Streak</div>
        </div>
        <div className="text-center p-1.5 bg-slate-800/60 border border-slate-600/50 rounded">
          <div className="font-mono font-bold text-base text-slate-100">
            {playerStats.fastestBuild > 0 ? `${playerStats.fastestBuild.toFixed(1)}s` : "N/A"}
          </div>
          <div className="text-slate-400 text-xs">Fastest Build</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-slate-100">Achievements</h4>
          <Badge className="bg-slate-700/80 text-slate-200 border-slate-600">
            {unlockedAchievements.length} / {achievements.length}
          </Badge>
        </div>

        <div className="space-y-1.5">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </div>
  )
}
