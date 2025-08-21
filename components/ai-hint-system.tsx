"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAtomStore } from "@/lib/atom-store"
import { useGamificationStore } from "@/lib/gamification-store"
import { Lightbulb, RefreshCw, Loader2, Sparkles } from "lucide-react"

interface AIHintResponse {
  success: boolean
  message: string
  hints?: string[]
}

export function AIHintSystem() {
  const { atoms, bonds, selectedAtomId, getAtomById } = useAtomStore()
  const { currentChallenge } = useGamificationStore()
  const [hint, setHint] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // Generate hint when atoms, bonds, or selection changes
  useEffect(() => {
    const timer = setTimeout(() => {
      generateHint()
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timer)
  }, [atoms.length, bonds.length, selectedAtomId, currentChallenge?.id])

  const generateHint = async () => {
    if (atoms.length === 0) {
      setHint("Start building by adding atoms from the elements panel!")
      return
    }

    setIsLoading(true)
    try {
      const requestBody = {
        type: "hint",
        molecule: {
          atoms: atoms.map((atom) => ({
            element: atom.element,
            position: atom.position,
          })),
          bonds: bonds.map((bond) => ({
            atomA: atoms.findIndex((a) => a.id === bond.atomA).toString(),
            atomB: atoms.findIndex((a) => a.id === bond.atomB).toString(),
            order: bond.order,
          })),
        },
        context: buildContext(),
      }

      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: AIHintResponse = await response.json()
      
      if (result.success && result.message) {
        setHint(result.message)
        setLastUpdate(Date.now())
      } else {
        setHint("Ready to help you build molecules!")
      }
    } catch (error) {
      console.error("AI Hint error:", error)
      setHint("Build freely and experiment with bonds!")
    } finally {
      setIsLoading(false)
    }
  }

  const buildContext = (): string => {
    let context = ""
    
    if (currentChallenge) {
      context += `Challenge: ${currentChallenge.title} (${currentChallenge.targetMolecule.formula}). `
      context += `Target: ${currentChallenge.targetMolecule.name}. `
    } else {
      context += "Free play mode. "
    }

    if (selectedAtomId) {
      const atom = getAtomById(selectedAtomId)
      if (atom) {
        context += `User selected ${atom.element} atom. `
      }
    }

    if (atoms.length > 0) {
      const elementCounts: Record<string, number> = {}
      atoms.forEach(atom => {
        elementCounts[atom.element] = (elementCounts[atom.element] || 0) + 1
      })
      
      const elementList = Object.entries(elementCounts)
        .map(([element, count]) => `${count} ${element}`)
        .join(", ")
      
      context += `Current atoms: ${elementList}. `
    }

    if (bonds.length > 0) {
      context += `${bonds.length} bond${bonds.length === 1 ? '' : 's'} formed. `
    }

    return context
  }

  const getHintIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
    }
    if (currentChallenge) {
      return <Sparkles className="h-4 w-4 text-emerald-400" />
    }
    return <Lightbulb className="h-4 w-4 text-yellow-400" />
  }

  const getHintTitle = () => {
    if (currentChallenge) {
      return currentChallenge.title
    }
    if (selectedAtomId) {
      const atom = getAtomById(selectedAtomId)
      return atom ? `${atom.element} selected` : "Hint"
    }
    return "Hint"
  }

  return (
    <Card className="bg-slate-900/90 backdrop-blur-md border border-slate-600 text-slate-200 shadow-xl px-3 py-2 max-w-xs">
      <div className="flex items-start gap-2">
        {getHintIcon()}
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold">{getHintTitle()}</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={generateHint}
              disabled={isLoading}
              className="h-5 w-5 p-0 text-slate-400 hover:text-yellow-400 hover:bg-slate-800/60"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            {hint || "Analyzing your molecule..."}
          </div>
          {lastUpdate > 0 && (
            <div className="text-xs text-slate-500">
              Updated {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
