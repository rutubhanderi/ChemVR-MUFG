"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useAuthActions } from "@/lib/auth-hooks"
import Loading from "@/components/auth/loading"
import { Canvas } from "@react-three/fiber"

import { useAtomStore } from "../lib/atom-store"
import { useGamificationStore } from "../lib/gamification-store"
import { ChallengeCompleteModal, AchievementUnlockModal } from "../components/gamification-modals"
import { MolecularScene } from "../components/molecular-scene"
import { ValidationControls } from "../components/validation-controls"
import { AchievementsPanel } from "../components/achievements-panel"
import { AITutor } from "../components/ai-tutor"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

// Main application component with authentication routing
export default function ChemVRWeb() {
  const { user, loading } = useAuth()

  // Show loading screen while authentication state is being determined
  if (loading) {
    return <Loading />
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <LoginRedirect />
  }

  // If user is authenticated, show the main application
  return <MainApplication />
}

// Component to redirect unauthenticated users to login
function LoginRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/login')
  }, [router])
  
  return <Loading />
}

// Main application component (the original ChemVR Web interface)
function MainApplication() {
  const { addAtom, clearAll, validation } = useAtomStore()
  const { currentChallenge, challenges, playerStats, startChallenge, abandonChallenge, challengeStartTime, completeChallenge } = useGamificationStore()
  const { logout, loading: logoutLoading } = useAuthActions()
  const { user } = useAuth()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  const handleLogout = async () => {
    await logout()
  }

  // Enhanced element data with better organization
  const elements = [
    { symbol: "H", name: "Hydrogen", color: "#ffffff", category: "common" },
    { symbol: "C", name: "Carbon", color: "#404040", category: "common" },
    { symbol: "N", name: "Nitrogen", color: "#3050f8", category: "common" },
    { symbol: "O", name: "Oxygen", color: "#ff0d0d", category: "common" },
    { symbol: "S", name: "Sulfur", color: "#ffff00", category: "secondary" },
    { symbol: "P", name: "Phosphorus", color: "#ffa500", category: "secondary" },
    { symbol: "F", name: "Fluorine", color: "#00ff99", category: "halogen" },
    { symbol: "Cl", name: "Chlorine", color: "#00ff00", category: "halogen" },
    { symbol: "Br", name: "Bromine", color: "#a52a2a", category: "halogen" },
  ]

  const commonElements = elements.filter(el => el.category === "common")
  const secondaryElements = elements.filter(el => el.category === "secondary")
  const halogens = elements.filter(el => el.category === "halogen")

  // Challenge timer (starts when challengeStartTime is set, stops on completion)
  useEffect(() => {
    if (!challengeStartTime || !currentChallenge) {
      setTimeElapsed(0)
      return
    }
    let raf: number
    const tick = () => {
      setTimeElapsed((Date.now() - challengeStartTime) / 1000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [challengeStartTime, currentChallenge])

  // Auto-accept: complete challenge as soon as target molecule is correctly built
  useEffect(() => {
    if (!currentChallenge) return
    if (!validation.isValid) return
    if (validation.formula !== currentChallenge.targetMolecule.formula) return
    const timeSpent = timeElapsed
    const accuracy = 100
    let score = currentChallenge.maxScore
    // Optional time bonus if timeLimit exists
    if (currentChallenge.timeLimit) {
      const bonus = Math.max(0, (currentChallenge.timeLimit - timeSpent) / currentChallenge.timeLimit) * 50
      score += Math.floor(bonus)
    }
    completeChallenge(score, accuracy, timeSpent)
    setTimeElapsed(0)
  }, [validation, currentChallenge, timeElapsed, completeChallenge])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Game Modals */}
      <ChallengeCompleteModal />
      <AchievementUnlockModal />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-sans bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              ChemVR Web
            </h1>
            <p className="text-sm text-slate-300 font-serif">Interactive Molecular Builder & Simulator</p>
          </div>
          <div>
            <Button
              onClick={handleLogout}
              variant="outline"
              disabled={logoutLoading}
              className="flex items-center gap-2 text-slate-200 border-slate-600 hover:bg-slate-800/80 hover:border-slate-500 transition-all duration-200 bg-slate-800/40 backdrop-blur-sm"
            >
              <span className="text-sm font-medium text-slate-200">{user?.email}</span>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <span className="font-medium text-slate-200">{logoutLoading ? 'Signing Out...' : 'Sign Out'}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-6">
        {/* Main Scene */}
        <section className="relative w-full h-[70vh] rounded-lg overflow-hidden border border-slate-600 bg-slate-900/50 shadow-2xl">
          <Canvas className="absolute inset-0">
            <MolecularScene />
          </Canvas>

          {/* Overlays - top right */}
          <div className="absolute top-4 right-4 w-64 space-y-3 max-h-[calc(70vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
            {/* Compact Atom Generator Card */}
            <Card className="bg-slate-900/90 backdrop-blur-md border-slate-600 shadow-xl">
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-sm font-sans flex items-center gap-2 text-slate-100">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Elements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3">
                {/* Common Elements - Most Used */}
                <div>
                  <div className="text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
                    Essential
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {commonElements.map((element) => (
                      <Button
                        key={element.symbol}
                        onClick={() => addAtom(element.symbol as any, [0, 0, 0])}
                        className="h-8 w-8 p-0 text-xs font-bold relative group transition-all duration-200 hover:scale-110 border-2"
                        style={{ 
                          backgroundColor: element.color + "25", 
                          borderColor: element.color + "80",
                          color: element.color === "#ffffff" ? "#1e293b" : "#fff",
                          boxShadow: `0 0 8px ${element.color}30`
                        }}
                        title={element.name}
                      >
                        {element.symbol}
                        <div 
                          className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-40 transition-all duration-200"
                          style={{ 
                            backgroundColor: element.color,
                            boxShadow: `0 0 12px ${element.color}60`
                          }}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Secondary & Halogens Combined - More Compact */}
                <div>
                  <div className="text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wide">
                    Extended
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[...secondaryElements, ...halogens].map((element) => (
                      <Button
                        key={element.symbol}
                        onClick={() => addAtom(element.symbol as any, [0, 0, 0])}
                        className="h-7 w-7 p-0 text-xs font-bold relative group transition-all duration-200 hover:scale-110 border-2"
                        style={{ 
                          backgroundColor: element.color + "25", 
                          borderColor: element.color + "80",
                          color: "#fff",
                          boxShadow: `0 0 6px ${element.color}25`
                        }}
                        title={element.name}
                      >
                        {element.symbol}
                        <div 
                          className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-40 transition-all duration-200"
                          style={{ 
                            backgroundColor: element.color,
                            boxShadow: `0 0 10px ${element.color}50`
                          }}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Clear All Button - More Compact */}
                <Button 
                  onClick={clearAll} 
                  variant="destructive" 
                  className="w-full h-7 text-xs font-medium bg-red-900/30 border-red-400/60 text-red-300 hover:bg-red-900/50 hover:border-red-400/80 transition-all duration-200 hover:shadow-lg"
                  style={{ boxShadow: '0 0 8px #ef444430' }}
                >
                  Clear All
                </Button>
              </CardContent>
            </Card>

            {/* Current Challenge Overlay (with timer and stop) */}
            <Card className="bg-slate-900/90 backdrop-blur-md border-slate-600 shadow-xl">
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-sm font-sans flex items-center gap-2 text-slate-100">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  Challenge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm px-3 pb-3">
                {currentChallenge ? (
                  <>
                    <div className="font-semibold text-slate-100 text-sm bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      {currentChallenge.title}
                    </div>
                    <div className="text-slate-200 leading-relaxed text-xs line-clamp-2">
                      {currentChallenge.description}
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-300">Target</span>
                      <span className="font-mono text-emerald-300">{currentChallenge.targetMolecule.formula}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Current</span>
                      <span className={`font-mono ${validation.formula === currentChallenge.targetMolecule.formula ? "text-emerald-300" : "text-slate-300"}`}>
                        {validation.formula || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Time</span>
                      <span className="font-mono text-cyan-300">{timeElapsed.toFixed(1)}s</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-600/50">
                      <span className="text-slate-300 text-xs">Score</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                        <span className="text-cyan-400 font-bold text-sm">{playerStats.totalScore}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => { clearAll(); abandonChallenge() }}
                      className="w-full h-7 text-xs font-medium mt-2 bg-red-900/30 border-red-500/50 text-red-300 hover:bg-red-900/50 hover:border-red-500/70"
                      variant="outline"
                    >
                      Stop Challenge
                    </Button>
                  </>
                ) : (
                  <div className="text-slate-200 text-center py-3">
                    <div className="text-slate-300 mb-1 text-lg opacity-60">⚗️</div>
                    <div className="text-xs font-medium text-slate-200">No Active Challenge</div>
                    <div className="text-xs text-slate-400 mt-0.5">Select one below to start</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Content Row: Challenges, Validation, Achievements */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenges */}
          <div className="max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
            <Card className="bg-slate-900/80 backdrop-blur-md border-slate-600 shadow-xl">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="font-serif text-lg flex items-center gap-2 text-slate-100">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="p-3 rounded-lg border border-slate-600/50 bg-slate-800/60 backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-200 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {challenge.title}
                      </div>
                      <div className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded font-mono">
                        {challenge.targetMolecule.formula}
                      </div>
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed mb-3">
                      {challenge.description}
                    </div>
                    <Button
                      onClick={() => { clearAll(); startChallenge(challenge.id) }}
                      disabled={!challenge.unlocked}
                      className={`w-full h-8 text-xs font-medium transition-all duration-200 ${
                        challenge.completed 
                          ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-500/70" 
                          : "bg-blue-900/30 border-blue-500/50 text-blue-300 hover:bg-blue-900/50 hover:border-blue-500/70"
                      }`}
                      variant="outline"
                    >
                      {challenge.completed ? "✓ Play Again" : "Start Challenge"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Validation Engine */}
          <Card className="bg-slate-900/80 backdrop-blur-md border-slate-600 shadow-xl h-fit">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-lg font-serif flex items-center gap-2 text-slate-100">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Validation Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ValidationControls />
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-slate-900/80 backdrop-blur-md border-slate-600 shadow-xl h-fit">
            <CardHeader className="px-4 py-4 border-b border-slate-600/50">
              <CardTitle className="text-lg font-serif flex items-center gap-2 text-slate-100">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Achievements & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <AchievementsPanel />
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Floating Chatbot Launcher */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <Button
          onClick={() => setIsChatOpen((v) => !v)}
          className="rounded-full h-12 w-12 p-0 bg-orange-500/80 hover:bg-orange-500 text-white shadow-xl border border-orange-400/60"
        >
          💬
        </Button>
      </div>

      {/* Chatbot Overlay Column */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-[100] w-[20rem] max-w-[90vw]">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[68vh]">
            <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-700/70">
              <div className="text-xs font-medium text-slate-200">AI Chat</div>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-slate-300" onClick={() => setIsChatOpen(false)}>✕</Button>
            </div>
            <div className="p-2 overflow-y-auto">
              <AITutor />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}