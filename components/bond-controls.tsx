"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAtomStore } from "@/lib/atom-store"
import { Link, Zap } from "lucide-react"

export function BondControls() {
  const {
    selectedAtomId,
    breakBondsForAtom,
    bondCreationMode,
    enterBondCreationMode,
    exitBondCreationMode,
  } = useAtomStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Link className="h-5 w-5" />
          Bond Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Manual bond controls */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Manual Controls</Label>
          
          {/* Bond Creation Mode Toggle */}
          <div className="space-y-2">
            <Button
              onClick={bondCreationMode ? exitBondCreationMode : enterBondCreationMode}
              variant={bondCreationMode ? "destructive" : "default"}
              size="sm"
              className="w-full"
            >
              {bondCreationMode ? "Exit Bond Mode" : "Enter Bond Mode"}
            </Button>
            {bondCreationMode && (
              <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border">
                💡 Click first atom, then click second atom to create bond
              </div>
            )}
            
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
              🔒 Bonds can only be created in bond creation mode
            </div>
          </div>

          <div className="text-xs text-muted-foreground mb-2">Bond creation mode is the only way to create bonds between atoms</div>

          {selectedAtomId && (
            <Button
              onClick={() => breakBondsForAtom(selectedAtomId)}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Zap className="h-4 w-4 mr-2" />
              Break All Bonds
            </Button>
          )}
        </div>

        <Separator />

        {/* Bond interaction help */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Bond Interactions:</strong>
          </p>
          <p>• Click bond to cycle order (1→2→3)</p>
          <p>• Double-click bond to delete</p>
          <p>• Drag atoms apart to break bonds</p>
        </div>
      </CardContent>
    </Card>
  )
}
