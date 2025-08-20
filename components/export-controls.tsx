"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAtomStore } from "@/lib/atom-store"
import { Download, Upload, Copy, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ExportControls() {
  const { atoms, bonds, clearAll, addAtom, addBond } = useAtomStore()
  const { toast } = useToast()
  const [importData, setImportData] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const exportMolecule = () => {
    const moleculeData = {
      atoms: atoms.map((atom) => ({
        element: atom.element,
        position: atom.position,
      })),
      bonds: bonds.map((bond) => ({
        atomA: atoms.findIndex((a) => a.id === bond.atomA),
        atomB: atoms.findIndex((a) => a.id === bond.atomB),
        order: bond.order,
      })),
      timestamp: isClient ? new Date().toISOString() : "",
    }

    const jsonString = JSON.stringify(moleculeData, null, 2)

    // Copy to clipboard
    navigator.clipboard.writeText(jsonString).then(() => {
      toast({
        title: "Exported!",
        description: "Molecule data copied to clipboard",
      })
    })

    // Also trigger download
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = isClient ? `molecule_${Date.now()}.json` : "molecule.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importMolecule = () => {
    try {
      const moleculeData = JSON.parse(importData)

      if (!moleculeData.atoms || !Array.isArray(moleculeData.atoms)) {
        throw new Error("Invalid molecule data format")
      }

      clearAll()

      // Add atoms first
      const atomIds: string[] = []
      moleculeData.atoms.forEach((atomData: any, index: number) => {
        setTimeout(() => {
          addAtom(atomData.element, atomData.position)
        }, index * 50)
      })

      // Add bonds after atoms are created
      setTimeout(
        () => {
          const { atoms: currentAtoms } = useAtomStore.getState()
          if (moleculeData.bonds && Array.isArray(moleculeData.bonds)) {
            moleculeData.bonds.forEach((bondData: any) => {
              if (currentAtoms[bondData.atomA] && currentAtoms[bondData.atomB]) {
                addBond(currentAtoms[bondData.atomA].id, currentAtoms[bondData.atomB].id, bondData.order)
              }
            })
          }
        },
        moleculeData.atoms.length * 50 + 100,
      )

      setImportData("")
      toast({
        title: "Imported!",
        description: "Molecule loaded successfully",
      })
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Invalid molecule data format",
        variant: "destructive",
      })
    }
  }

  const generateReport = () => {
    const { validation } = useAtomStore.getState()

    const report = `
MOLECULAR ANALYSIS REPORT
========================

Formula: ${validation.formula || "N/A"}
Valid Structure: ${validation.isValid ? "Yes" : "No"}

Atom Count: ${atoms.length}
Bond Count: ${bonds.length}

Atoms:
${atoms.map((atom, i) => `  ${i + 1}. ${atom.element} at (${atom.position.map((p) => p.toFixed(2)).join(", ")})`).join("\n")}

Bonds:
${bonds
  .map((bond, i) => {
    const atomAIndex = atoms.findIndex((a) => a.id === bond.atomA) + 1
    const atomBIndex = atoms.findIndex((a) => a.id === bond.atomB) + 1
    return `  ${i + 1}. Atom ${atomAIndex} - Atom ${atomBIndex} (${bond.order})`
  })
  .join("\n")}

Validation:
${validation.hints.length > 0 ? validation.hints.map((hint) => `  • ${hint}`).join("\n") : "  No hints"}
${validation.errors.length > 0 ? validation.errors.map((error) => `  ⚠ ${error}`).join("\n") : ""}

Generated: ${isClient ? new Date().toLocaleString() : ""}
    `.trim()

    navigator.clipboard.writeText(report).then(() => {
      toast({
        title: "Report Generated!",
        description: "Analysis report copied to clipboard",
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export & Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export controls */}
        <div className="space-y-2">
          <Button
            onClick={exportMolecule}
            variant="outline"
            className="w-full bg-transparent"
            disabled={atoms.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Molecule
          </Button>

          <Button
            onClick={generateReport}
            variant="outline"
            className="w-full bg-transparent"
            disabled={atoms.length === 0}
          >
            <Copy className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Import controls */}
        <div className="space-y-2">
          <Textarea
            placeholder="Paste molecule JSON data here..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={4}
            className="text-xs font-mono"
          />

          <Button
            onClick={importMolecule}
            variant="outline"
            className="w-full bg-transparent"
            disabled={!importData.trim()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Molecule
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Export saves your molecule as JSON. Import accepts the same format.
        </div>
      </CardContent>
    </Card>
  )
}
