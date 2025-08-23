"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAtomStore } from "@/lib/atom-store"
import { RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react"

export function ValidationControls() {
  const {
    useServerValidation,
    isValidating,
    validation,
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
    <div className="space-y-3">
      {/* Manual validation trigger */}
      <Button
        onClick={handleManualValidation}
        variant="outline"
        className="w-full h-8 text-xs font-medium bg-blue-900/30 border-blue-500/50 text-blue-300 hover:bg-blue-900/50 hover:border-blue-500/70 transition-all duration-200"
        disabled={isValidating}
      >
        {isValidating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
        {isValidating ? "Validating..." : "Validate Now"}
      </Button>

      {/* Validation result display */}
      <div className="p-3 rounded-lg border border-slate-600/50 bg-slate-800/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-slate-100">
            {validation.isValid ? "Valid Structure" : "Invalid Structure"}
          </div>
          <div className="flex items-center gap-2">
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <Badge 
              variant={validation.isValid ? "default" : "secondary"} 
              className={`text-xs px-2 py-1 rounded font-mono ${
                validation.isValid 
                  ? "bg-emerald-900/30 border-emerald-500/50 text-emerald-300" 
                  : "bg-red-900/30 border-red-500/50 text-red-300"
              }`}
            >
              {validation.isValid ? "Valid" : "Invalid"}
            </Badge>
          </div>
        </div>
        
        {validation.formula && (
          <div className="text-xs text-slate-300 mb-2">
            Formula: <span className="font-mono text-slate-200">{validation.formula}</span>
          </div>
        )}
        
        {validation.hints && validation.hints.length > 0 && (
          <div className="text-xs text-slate-300 leading-relaxed mb-2">
            {validation.hints[0]}
          </div>
        )}
        
        {validation.errors && validation.errors.length > 0 && (
          <div className="text-xs text-red-400 leading-relaxed">
            {validation.errors[0]}
          </div>
        )}
      </div>
    </div>
  )
}
