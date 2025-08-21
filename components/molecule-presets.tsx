"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAtomStore, type AtomType } from "@/lib/atom-store"
import { Beaker, Droplets, Wind, Flame } from "lucide-react"

interface MoleculePreset {
  name: string
  formula: string
  description: string
  icon: React.ReactNode
  atoms: Array<{ element: AtomType; position: [number, number, number] }>
  bonds: Array<{ atomA: number; atomB: number; order: "single" | "double" | "triple" }>
}

const MOLECULE_PRESETS: MoleculePreset[] = [
  {
    name: "Water (H₂O)",
    formula: "H₂O",
    description: "Simple bent molecule - essential for life",
    icon: <Droplets className="h-4 w-4" />,
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
  {
    name: "Methane (CH₄)",
    formula: "CH₄",
    description: "Tetrahedral molecule - natural gas component",
    icon: <Flame className="h-4 w-4" />,
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
  {
    name: "Ammonia (NH₃)",
    formula: "NH₃",
    description: "Trigonal pyramidal molecule - common base",
    icon: <Beaker className="h-4 w-4" />,
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
  {
    name: "Carbon Dioxide (CO₂)",
    formula: "CO₂",
    description: "Linear molecule with double bonds - greenhouse gas",
    icon: <Wind className="h-4 w-4" />,
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
  {
    name: "Benzene (C₆H₆)",
    formula: "C₆H₆",
    description: "Cyclic molecule with alternating double bonds",
    icon: <Beaker className="h-4 w-4" />,
    atoms: [
      // Carbon ring
      { element: "C", position: [0, 0, 0] },
      { element: "C", position: [1.4, 0, 0] },
      { element: "C", position: [2.1, 1.2, 0] },
      { element: "C", position: [1.4, 2.4, 0] },
      { element: "C", position: [0, 2.4, 0] },
      { element: "C", position: [-0.7, 1.2, 0] },
      // Hydrogen atoms
      { element: "H", position: [0, -1.2, 0] },
      { element: "H", position: [1.4, -1.2, 0] },
      { element: "H", position: [3.1, 1.2, 0] },
      { element: "H", position: [1.4, 3.6, 0] },
      { element: "H", position: [0, 3.6, 0] },
      { element: "H", position: [-1.7, 1.2, 0] },
    ],
    bonds: [
      // Carbon-carbon bonds (alternating single/double)
      { atomA: 0, atomB: 1, order: "double" },
      { atomA: 1, atomB: 2, order: "single" },
      { atomA: 2, atomB: 3, order: "double" },
      { atomA: 3, atomB: 4, order: "single" },
      { atomA: 4, atomB: 5, order: "double" },
      { atomA: 5, atomB: 0, order: "single" },
      // Carbon-hydrogen bonds
      { atomA: 0, atomB: 6, order: "single" },
      { atomA: 1, atomB: 7, order: "single" },
      { atomA: 2, atomB: 8, order: "single" },
      { atomA: 3, atomB: 9, order: "single" },
      { atomA: 4, atomB: 10, order: "single" },
      { atomA: 5, atomB: 11, order: "single" },
    ],
  },
]

export function MoleculePresets() {
  const { clearAll, addAtom, addBond } = useAtomStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const loadPreset = (preset: MoleculePreset) => {
    clearAll()

    // Add atoms first
    preset.atoms.forEach((atomData) => {
      addAtom(atomData.element, atomData.position)
    })

    // Add bonds after a short delay to ensure atoms are created
    setTimeout(() => {
      const { atoms } = useAtomStore.getState()
      preset.bonds.forEach((bondData) => {
        if (atoms[bondData.atomA] && atoms[bondData.atomB]) {
          addBond(atoms[bondData.atomA].id, atoms[bondData.atomB].id, bondData.order)
        }
      })
    }, 100)
  }

  return (
    <div className="space-y-3">
      {MOLECULE_PRESETS.map((preset) => (
        <Button
          key={preset.name}
          onClick={() => loadPreset(preset)}
          variant="outline"
          className="w-full justify-start h-auto p-3 bg-slate-800/60 border-slate-600/50 text-slate-200 hover:bg-slate-800/80 hover:border-slate-500/70 transition-all duration-200"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="text-cyan-400">{preset.icon}</div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{preset.name}</span>
                <Badge variant="secondary" className="text-xs bg-slate-700/80 text-slate-200">
                  {preset.formula}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-tight">{preset.description}</p>
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}
