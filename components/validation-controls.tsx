"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAtomStore } from "@/lib/atom-store"
import { Server, Cpu, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react"

export function ValidationControls() {
  const {
    useServerValidation,
    isValidating,
    validation,
    toggleServerValidation,
    validateMolecule,
    validateMoleculeWithAPI,
  } = useAtomStore()

  const handleManualValidation = () => {
    if (useServerValidation) {
      validateMoleculeWithAPI()
    } else {
      validateMolecule()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          {useServerValidation ? <Server className="h-5 w-5" /> : <Cpu className="h-5 w-5" />}
          Validation Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation method toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="server-validation" className="text-sm font-medium">
            Server-side Validation
          </Label>
          <Switch
            id="server-validation"
            checked={useServerValidation}
            onCheckedChange={toggleServerValidation}
            disabled={isValidating}
          />
        </div>

        <div className="text-xs text-muted-foreground">
          {useServerValidation
            ? "Using advanced server-side chemistry validation with molecular recognition"
            : "Using client-side validation for real-time feedback"}
        </div>

        <Separator />

        {/* Manual validation trigger */}
        <Button
          onClick={handleManualValidation}
          variant="outline"
          className="w-full bg-transparent"
          disabled={isValidating}
        >
          {isValidating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {isValidating ? "Validating..." : "Validate Now"}
        </Button>

        <Separator />

        {/* Validation status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Status</Label>
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={validation.isValid ? "default" : "secondary"}>
              {validation.isValid ? "Valid Structure" : "Invalid Structure"}
            </Badge>
          </div>
        </div>

        {/* API Features */}
        {useServerValidation && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Server Features:</strong>
              </p>
              <p>• Advanced molecular recognition</p>
              <p>• Geometry analysis</p>
              <p>• Functional group detection</p>
              <p>• Educational hints & descriptions</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
