import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  targetMolecule: {
    formula: string
    name: string
    atoms: Array<{ element: "H" | "O" | "C" | "N"; position: [number, number, number] }>
    bonds: Array<{ atomA: number; atomB: number; order: "single" | "double" | "triple" }>
  }
  hints: string[]
  timeLimit?: number // in seconds
  maxScore: number
  unlocked: boolean
  completed: boolean
  bestScore?: number
  bestTime?: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
  category: "builder" | "speed" | "accuracy" | "explorer" | "master"
}

export interface PlayerStats {
  totalMoleculesBuilt: number
  totalChallengesCompleted: number
  totalScore: number
  averageAccuracy: number
  fastestBuild: number
  currentStreak: number
  longestStreak: number
  timeSpent: number // in seconds
  level: number
  experience: number
}

interface GamificationStore {
  // State
  challenges: Challenge[]
  achievements: Achievement[]
  playerStats: PlayerStats
  currentChallenge: Challenge | null
  challengeStartTime: number | null
  showChallengeComplete: boolean
  showAchievementUnlock: Achievement | null

  // Actions
  initializeChallenges: () => void
  startChallenge: (challengeId: string) => void
  completeChallenge: (score: number, accuracy: number, timeSpent: number) => void
  abandonChallenge: () => void
  unlockAchievement: (achievementId: string) => void
  updatePlayerStats: (stats: Partial<PlayerStats>) => void
  calculateLevel: (experience: number) => number
  getNextLevelExperience: (level: number) => number
  dismissChallengeComplete: () => void
  dismissAchievementUnlock: () => void

  // Computed
  getUnlockedChallenges: () => Challenge[]
  getCompletedChallenges: () => Challenge[]
  getUnlockedAchievements: () => Achievement[]
  getChallengeById: (id: string) => Challenge | undefined
  checkAchievements: (score: number, accuracy: number, timeSpent: number, stats: PlayerStats) => void
}

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "water-basic",
    title: "Build Water",
    description: "Create the most essential molecule for life - H₂O",
    difficulty: "beginner",
    targetMolecule: {
      formula: "H2O",
      name: "Water",
      atoms: [
        { element: "O", position: [0, 0, 0] },
        { element: "H", position: [-1.2, 0.8, 0] },
        { element: "H", position: [1.2, 0.8, 0] },
      ],
      bonds: [
        { atomA: 0, atomB: 1, order: "single" },
        { atomA: 0, atomB: 2, order: "single" },
      ],
    },
    hints: [
      "Oxygen needs 2 bonds to be stable",
      "Hydrogen can only form 1 bond",
      "Water has a bent molecular geometry",
    ],
    maxScore: 100,
    unlocked: true,
    completed: false,
  },
  {
    id: "methane-basic",
    title: "Build Methane",
    description: "Construct the simplest hydrocarbon - CH₄",
    difficulty: "beginner",
    targetMolecule: {
      formula: "CH4",
      name: "Methane",
      atoms: [
        { element: "C", position: [0, 0, 0] },
        { element: "H", position: [1, 1, 1] },
        { element: "H", position: [-1, -1, 1] },
        { element: "H", position: [-1, 1, -1] },
        { element: "H", position: [1, -1, -1] },
      ],
      bonds: [
        { atomA: 0, atomB: 1, order: "single" },
        { atomA: 0, atomB: 2, order: "single" },
        { atomA: 0, atomB: 3, order: "single" },
        { atomA: 0, atomB: 4, order: "single" },
      ],
    },
    hints: [
      "Carbon needs 4 bonds to be stable",
      "Each hydrogen forms exactly 1 bond",
      "Methane has tetrahedral geometry",
    ],
    maxScore: 150,
    unlocked: false,
    completed: false,
  },
  {
    id: "ammonia-intermediate",
    title: "Build Ammonia",
    description: "Create the important base molecule - NH₃",
    difficulty: "intermediate",
    targetMolecule: {
      formula: "NH3",
      name: "Ammonia",
      atoms: [
        { element: "N", position: [0, 0, 0] },
        { element: "H", position: [1, 0.8, 0] },
        { element: "H", position: [-0.5, 0.8, 0.9] },
        { element: "H", position: [-0.5, 0.8, -0.9] },
      ],
      bonds: [
        { atomA: 0, atomB: 1, order: "single" },
        { atomA: 0, atomB: 2, order: "single" },
        { atomA: 0, atomB: 3, order: "single" },
      ],
    },
    hints: [
      "Nitrogen needs 3 bonds to be stable",
      "Ammonia has a pyramidal shape",
      "The lone pair on nitrogen affects the geometry",
    ],
    maxScore: 200,
    unlocked: false,
    completed: false,
  },
  {
    id: "co2-intermediate",
    title: "Build Carbon Dioxide",
    description: "Construct the greenhouse gas - CO₂",
    difficulty: "intermediate",
    targetMolecule: {
      formula: "CO2",
      name: "Carbon Dioxide",
      atoms: [
        { element: "C", position: [0, 0, 0] },
        { element: "O", position: [-1.5, 0, 0] },
        { element: "O", position: [1.5, 0, 0] },
      ],
      bonds: [
        { atomA: 0, atomB: 1, order: "double" },
        { atomA: 0, atomB: 2, order: "double" },
      ],
    },
    hints: [
      "Carbon forms double bonds with each oxygen",
      "CO₂ is a linear molecule",
      "Each oxygen needs 2 bonds total",
    ],
    timeLimit: 120,
    maxScore: 250,
    unlocked: false,
    completed: false,
  },
  {
    id: "ethane-advanced",
    title: "Build Ethane",
    description: "Create your first multi-carbon molecule - C₂H₆",
    difficulty: "advanced",
    targetMolecule: {
      formula: "C2H6",
      name: "Ethane",
      atoms: [
        { element: "C", position: [-0.8, 0, 0] },
        { element: "C", position: [0.8, 0, 0] },
        { element: "H", position: [-1.3, 1, 0.5] },
        { element: "H", position: [-1.3, -1, 0.5] },
        { element: "H", position: [-1.3, 0, -1] },
        { element: "H", position: [1.3, 1, 0.5] },
        { element: "H", position: [1.3, -1, 0.5] },
        { element: "H", position: [1.3, 0, -1] },
      ],
      bonds: [
        { atomA: 0, atomB: 1, order: "single" },
        { atomA: 0, atomB: 2, order: "single" },
        { atomA: 0, atomB: 3, order: "single" },
        { atomA: 0, atomB: 4, order: "single" },
        { atomA: 1, atomB: 5, order: "single" },
        { atomA: 1, atomB: 6, order: "single" },
        { atomA: 1, atomB: 7, order: "single" },
      ],
    },
    hints: [
      "Two carbon atoms connected by a single bond",
      "Each carbon needs 4 bonds total",
      "This is the simplest alkane with 2 carbons",
    ],
    timeLimit: 180,
    maxScore: 300,
    unlocked: false,
    completed: false,
  },
  {
    id: "ethanol-intermediate",
    title: "Build Ethanol",
    description: "Create a common alcohol - C₂H₆O",
    difficulty: "intermediate",
    targetMolecule: {
      formula: "C2H6O",
      name: "Ethanol",
      atoms: [
        { element: "C", position: [-0.8, 0, 0] },
        { element: "C", position: [0.8, 0, 0] },
        { element: "O", position: [1.8, 0.5, 0] },
        { element: "H", position: [-1.5, 1, 0.5] },
        { element: "H", position: [-1.5, -1, 0.5] },
        { element: "H", position: [-1.5, 0, -1] },
        { element: "H", position: [1.5, 1, 0.5] },
        { element: "H", position: [1.5, -1, 0.5] },
        { element: "H", position: [1.8, 1.3, 0.6] },
      ],
      bonds: [
        { atomA: 0, atomB: 1, order: "single" },
        { atomA: 1, atomB: 2, order: "single" },
        { atomA: 0, atomB: 3, order: "single" },
        { atomA: 0, atomB: 4, order: "single" },
        { atomA: 0, atomB: 5, order: "single" },
        { atomA: 1, atomB: 6, order: "single" },
        { atomA: 1, atomB: 7, order: "single" },
        { atomA: 2, atomB: 8, order: "single" },
      ],
    },
    hints: [
      "Two carbons connected by a single bond",
      "Hydroxyl group (O-H) attached to the second carbon",
      "Satisfy valences for all atoms",
    ],
    timeLimit: 150,
    maxScore: 260,
    unlocked: false,
    completed: false,
  },
]

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-molecule",
    title: "First Steps",
    description: "Build your first molecule",
    icon: "🧪",
    unlocked: false,
    category: "builder",
  },
  {
    id: "water-master",
    title: "Water Master",
    description: "Successfully build water (H₂O)",
    icon: "💧",
    unlocked: false,
    category: "builder",
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    description: "Complete a challenge in under 30 seconds",
    icon: "⚡",
    unlocked: false,
    category: "speed",
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Complete a challenge with 100% accuracy",
    icon: "🎯",
    unlocked: false,
    category: "accuracy",
  },
  {
    id: "challenge-streak",
    title: "On Fire",
    description: "Complete 5 challenges in a row",
    icon: "🔥",
    unlocked: false,
    category: "master",
  },
  {
    id: "molecule-explorer",
    title: "Molecule Explorer",
    description: "Build 10 different molecules",
    icon: "🔬",
    unlocked: false,
    category: "explorer",
  },
  {
    id: "chemistry-master",
    title: "Chemistry Master",
    description: "Complete all available challenges",
    icon: "👑",
    unlocked: false,
    category: "master",
  },
]

const INITIAL_PLAYER_STATS: PlayerStats = {
  totalMoleculesBuilt: 0,
  totalChallengesCompleted: 0,
  totalScore: 0,
  averageAccuracy: 0,
  fastestBuild: 0,
  currentStreak: 0,
  longestStreak: 0,
  timeSpent: 0,
  level: 1,
  experience: 0,
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      challenges: INITIAL_CHALLENGES,
      achievements: INITIAL_ACHIEVEMENTS,
      playerStats: INITIAL_PLAYER_STATS,
      currentChallenge: null,
      challengeStartTime: null,
      showChallengeComplete: false,
      showAchievementUnlock: null,

      // Actions
      initializeChallenges: () => {
        set({ challenges: INITIAL_CHALLENGES })
      },

      startChallenge: (challengeId: string) => {
        const challenge = get().getChallengeById(challengeId)
        if (challenge && challenge.unlocked) {
          set({
            currentChallenge: challenge,
            challengeStartTime: Date.now(),
          })
        }
      },

      completeChallenge: (score: number, accuracy: number, timeSpent: number) => {
        const { currentChallenge, challenges, playerStats } = get()
        if (!currentChallenge) return

        const updatedChallenges = challenges.map((challenge) => {
          if (challenge.id === currentChallenge.id) {
            const isNewBest = !challenge.bestScore || score > challenge.bestScore
            return {
              ...challenge,
              completed: true,
              bestScore: Math.max(challenge.bestScore || 0, score),
              bestTime: challenge.bestTime ? Math.min(challenge.bestTime, timeSpent) : timeSpent,
            }
          }
          return challenge
        })

        // Unlock next challenges
        const currentIndex = challenges.findIndex((c) => c.id === currentChallenge.id)
        if (currentIndex !== -1 && currentIndex + 1 < updatedChallenges.length) {
          updatedChallenges[currentIndex + 1].unlocked = true
        }

        // Update player stats
        const newStats = {
          ...playerStats,
          totalChallengesCompleted: playerStats.totalChallengesCompleted + 1,
          totalScore: playerStats.totalScore + score,
          currentStreak: playerStats.currentStreak + 1,
          longestStreak: Math.max(playerStats.longestStreak, playerStats.currentStreak + 1),
          timeSpent: playerStats.timeSpent + timeSpent,
          experience: playerStats.experience + score,
        }

        newStats.level = get().calculateLevel(newStats.experience)
        newStats.averageAccuracy =
          (playerStats.averageAccuracy * playerStats.totalChallengesCompleted + accuracy) /
          newStats.totalChallengesCompleted

        if (playerStats.fastestBuild === 0 || timeSpent < playerStats.fastestBuild) {
          newStats.fastestBuild = timeSpent
        }

        set({
          challenges: updatedChallenges,
          playerStats: newStats,
          currentChallenge: null,
          challengeStartTime: null,
          showChallengeComplete: true,
        })

        // Check for achievements
        get().checkAchievements(score, accuracy, timeSpent, newStats)
      },

      abandonChallenge: () => {
        set({
          currentChallenge: null,
          challengeStartTime: null,
        })
      },

      unlockAchievement: (achievementId: string) => {
        const { achievements } = get()
        const updatedAchievements = achievements.map((achievement) => {
          if (achievement.id === achievementId && !achievement.unlocked) {
            const unlockedAchievement = {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date(),
            }
            set({ showAchievementUnlock: unlockedAchievement })
            return unlockedAchievement
          }
          return achievement
        })

        set({ achievements: updatedAchievements })
      },

      updatePlayerStats: (stats: Partial<PlayerStats>) => {
        set((state) => ({
          playerStats: { ...state.playerStats, ...stats },
        }))
      },

      calculateLevel: (experience: number) => {
        return Math.floor(experience / 500) + 1
      },

      getNextLevelExperience: (level: number) => {
        return level * 500
      },

      dismissChallengeComplete: () => {
        set({ showChallengeComplete: false })
      },

      dismissAchievementUnlock: () => {
        set({ showAchievementUnlock: null })
      },

      // Computed functions
      getUnlockedChallenges: () => {
        return get().challenges.filter((challenge) => challenge.unlocked)
      },

      getCompletedChallenges: () => {
        return get().challenges.filter((challenge) => challenge.completed)
      },

      getUnlockedAchievements: () => {
        return get().achievements.filter((achievement) => achievement.unlocked)
      },

      getChallengeById: (id: string) => {
        return get().challenges.find((challenge) => challenge.id === id)
      },

      // Helper function to check achievements
      checkAchievements: (score: number, accuracy: number, timeSpent: number, stats: PlayerStats) => {
        const { unlockAchievement } = get()

        // First molecule
        if (stats.totalChallengesCompleted === 1) {
          unlockAchievement("first-molecule")
        }

        // Speed demon
        if (timeSpent < 30) {
          unlockAchievement("speed-demon")
        }

        // Perfectionist
        if (accuracy >= 100) {
          unlockAchievement("perfectionist")
        }

        // Challenge streak
        if (stats.currentStreak >= 5) {
          unlockAchievement("challenge-streak")
        }

        // Molecule explorer
        if (stats.totalMoleculesBuilt >= 10) {
          unlockAchievement("molecule-explorer")
        }

        // Chemistry master
        const completedChallenges = get().getCompletedChallenges()
        if (completedChallenges.length === get().challenges.length) {
          unlockAchievement("chemistry-master")
        }
      },
    }),
    {
      name: "chemvr-gamification",
      version: 1,
    },
  ),
)
