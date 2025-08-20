"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAtomStore } from "@/lib/atom-store"
import { Link, Zap } from "lucide-react"

export function BondControls() {
  const {
    autoBondingEnabled,
    bondFormationDistance,
    bondBreakingDistance,
    toggleAutoBonding,
    setBondFormationDistance,
    selectedAtomId,
    breakBondsForAtom,
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
        {/* Auto-bonding toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-bonding" className="text-sm font-medium">
            Auto-bonding
          </Label>
          <Switch id="auto-bonding" checked={autoBondingEnabled} onCheckedChange={toggleAutoBonding} />
        </div>

        <Separator />

        {/* Bond formation distance */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Bond Formation Distance: {bondFormationDistance.toFixed(1)}</Label>
          <Slider
            value={[bondFormationDistance]}
            onValueChange={([value]) => setBondFormationDistance(value)}
            min={0.5}
            max={3.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Close (0.5)</span>
            <span>Far (3.0)</span>
          </div>
        </div>

        <Separator />

        {/* Manual bond controls */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Manual Controls</Label>
          <div className="text-xs text-muted-foreground mb-2">Select an atom, then click another to create bonds</div>

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
