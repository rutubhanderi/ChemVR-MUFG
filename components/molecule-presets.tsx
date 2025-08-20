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
    name: "Water",
    formula: "H₂O",
    description: "Essential for life",
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
    name: "Carbon Dioxide",
    formula: "CO₂",
    description: "Greenhouse gas",
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
    name: "Methane",
    formula: "CH₄",
    description: "Natural gas component",
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
    name: "Ammonia",
    formula: "NH₃",
    description: "Common base",
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
    name: "Ethanol",
    formula: "C₂H₆O",
    description: "Common alcohol",
    icon: <Beaker className="h-4 w-4" />,
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
  {
    name: "Glucose (simple)",
    formula: "C₆H₁₂O₆",
    description: "Basic sugar skeleton",
    icon: <Beaker className="h-4 w-4" />,
    atoms: [
      { element: "C", position: [-2, 0, 0] },
      { element: "C", position: [-1, 0, 0] },
      { element: "C", position: [0, 0, 0] },
      { element: "C", position: [1, 0, 0] },
      { element: "C", position: [2, 0, 0] },
      { element: "C", position: [3, 0, 0] },
      { element: "O", position: [-2, 1.2, 0] },
      { element: "O", position: [-1, 1.2, 0] },
      { element: "O", position: [0, 1.2, 0] },
      { element: "O", position: [1, 1.2, 0] },
      { element: "O", position: [2, 1.2, 0] },
      { element: "O", position: [3, 1.2, 0] },
      { element: "H", position: [-2, -1.2, 0] },
      { element: "H", position: [-1, -1.2, 0] },
      { element: "H", position: [0, -1.2, 0] },
      { element: "H", position: [1, -1.2, 0] },
      { element: "H", position: [2, -1.2, 0] },
      { element: "H", position: [3, -1.2, 0] },
    ],
    bonds: [
      { atomA: 0, atomB: 1, order: "single" },
      { atomA: 1, atomB: 2, order: "single" },
      { atomA: 2, atomB: 3, order: "single" },
      { atomA: 3, atomB: 4, order: "single" },
      { atomA: 4, atomB: 5, order: "single" },
      { atomA: 0, atomB: 6, order: "single" },
      { atomA: 1, atomB: 7, order: "single" },
      { atomA: 2, atomB: 8, order: "single" },
      { atomA: 3, atomB: 9, order: "single" },
      { atomA: 4, atomB: 10, order: "single" },
      { atomA: 5, atomB: 11, order: "single" },
      { atomA: 0, atomB: 12, order: "single" },
      { atomA: 1, atomB: 13, order: "single" },
      { atomA: 2, atomB: 14, order: "single" },
      { atomA: 3, atomB: 15, order: "single" },
      { atomA: 4, atomB: 16, order: "single" },
      { atomA: 5, atomB: 17, order: "single" },
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
    const atomIds: string[] = []
    preset.atoms.forEach((atomData, index) => {
      const atomId = isClient ? `preset_atom_${index}_${Date.now()}` : `preset_atom_${index}`
      atomIds.push(atomId)

      // We need to manually create the atom with the specific ID
      setTimeout(() => {
        addAtom(atomData.element, atomData.position)
      }, index * 50)
    })

    // Add bonds after atoms are created
    setTimeout(
      () => {
        const { atoms } = useAtomStore.getState()
        preset.bonds.forEach((bondData) => {
          if (atoms[bondData.atomA] && atoms[bondData.atomB]) {
            addBond(atoms[bondData.atomA].id, atoms[bondData.atomB].id, bondData.order)
          }
        })
      },
      preset.atoms.length * 50 + 100,
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Molecule Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {MOLECULE_PRESETS.map((preset) => (
          <Button
            key={preset.name}
            onClick={() => loadPreset(preset)}
            variant="outline"
            className="w-full justify-start h-auto p-3"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="text-primary">{preset.icon}</div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{preset.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {preset.formula}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{preset.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
