"use client"

import React from "react"
import { Canvas } from "@react-three/fiber"

import { useAtomStore } from "../lib/atom-store"
import { useGamificationStore } from "../lib/gamification-store"
import { ChallengeCompleteModal, AchievementUnlockModal } from "../components/gamification-modals"
import { MolecularScene } from "../components/molecular-scene"
import { ChallengeSystem } from "../components/challenge-system"
import { ValidationControls } from "../components/validation-controls"
import { MoleculePresets } from "../components/molecule-presets"
import { BondControls } from "../components/bond-controls"
import { ExportControls } from "../components/export-controls"
import { AchievementsPanel } from "../components/achievements-panel"
import { AITutor } from "../components/ai-tutor"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"

export default function ChemVRWeb() {
  const { addAtom, clearAll } = useAtomStore()

  const { currentChallenge, achievements, playerStats } = useGamificationStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Game Modals */}
      <ChallengeCompleteModal />
      <AchievementUnlockModal />

      <div className="container mx-auto p-6">
        {/* Enhanced Header with Gamification Info */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold font-sans mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            ChemVR Web
          </h1>
          <p className="text-lg text-slate-300 font-serif">Interactive Molecular Builder & Simulator</p>
          <div className="flex justify-center items-center gap-6 mt-4">
            <div className="text-sm text-cyan-400">
              Score: <span className="font-bold">{playerStats.totalScore}</span>
            </div>
            <div className="text-sm text-green-400">
              Achievements: <span className="font-bold">{achievements.filter((a) => a.unlocked).length}</span>
            </div>
            {currentChallenge && (
              <div className="text-sm text-yellow-400">
                Challenge: <span className="font-bold">{currentChallenge.title}</span>
              </div>
            )}
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 3D Canvas */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <Canvas className="w-full h-full">
                  <MolecularScene />
                </Canvas>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Challenge System */}
            <ChallengeSystem />

            {/* AI Tutor */}
            <AITutor />

            <Tabs defaultValue="build" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                <TabsTrigger value="build">Build</TabsTrigger>
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="build" className="space-y-4">
                {/* Atom Controls */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg font-sans">Add Atoms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { symbol: "H", name: "Hydrogen", color: "#ffffff" },
                        { symbol: "C", name: "Carbon", color: "#404040" },
                        { symbol: "N", name: "Nitrogen", color: "#3050f8" },
                        { symbol: "O", name: "Oxygen", color: "#ff0d0d" },
                        { symbol: "S", name: "Sulfur", color: "#ffff00" },
                        { symbol: "P", name: "Phosphorus", color: "#ffa500" },
                        { symbol: "F", name: "Fluorine", color: "#00ff99" },
                        { symbol: "Cl", name: "Chlorine", color: "#00ff00" },
                        { symbol: "Br", name: "Bromine", color: "#a52a2a" },
                      ].map((element) => (
                        <Button
                          key={element.symbol}
                          onClick={() => addAtom(element.symbol as any, [0, 0, 0])}
                          className="h-12 text-sm font-medium"
                          style={{ backgroundColor: element.color + "20", borderColor: element.color }}
                        >
                          {element.symbol}
                          <span className="ml-1 text-xs opacity-75">{element.name}</span>
                        </Button>
                      ))}
                    </div>

                    <Button onClick={clearAll} variant="destructive" className="w-full">
                      Clear All
                    </Button>
                  </CardContent>
                </Card>

                {/* Validation Controls */}
                <ValidationControls />
              </TabsContent>

              <TabsContent value="presets">
                <MoleculePresets />
              </TabsContent>

              <TabsContent value="settings">
                <BondControls />
              </TabsContent>

              <TabsContent value="export">
                <ExportControls />
              </TabsContent>
            </Tabs>

            {/* Achievements Panel */}
            <AchievementsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
