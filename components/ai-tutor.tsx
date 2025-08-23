"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAtomStore } from "@/lib/atom-store"
import { 
  Brain, 
  Lightbulb, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare,
  Loader2,
  Sparkles,
  Key
} from "lucide-react"

interface AITutorResponse {
  success: boolean
  message: string
  suggestions?: string[]
  validation?: {
    isValid: boolean
    issues: string[]
    recommendations: string[]
  }
  educationalInfo?: {
    name: string
    description: string
    properties: string[]
    applications: string[]
    funFacts: string[]
  }
  hints?: string[]
}

type TutorMode = "suggestion" | "validation" | "education" | "hint"

export function AITutor() {
  const { atoms, bonds } = useAtomStore()
  const [mode, setMode] = useState<TutorMode>("suggestion")
  const [question, setQuestion] = useState("")
  const [context, setContext] = useState("")
  const [response, setResponse] = useState<AITutorResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAskAI = async () => {
    setIsLoading(true)
    setResponse(null)

    try {
      const requestBody = {
        type: mode,
        molecule: mode !== "education" ? {
          atoms: atoms.map((atom) => ({
            element: atom.element,
            position: atom.position,
          })),
          bonds: bonds.map((bond) => ({
            atomA: atoms.findIndex((a) => a.id === bond.atomA).toString(),
            atomB: atoms.findIndex((a) => a.id === bond.atomB).toString(),
            order: bond.order,
          })),
        } : undefined,
        question: mode === "education" ? question : undefined,
        context: context || undefined,
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

      const result = await response.json()
      setResponse(result)
    } catch (error) {
      console.error("AI Tutor error:", error)
      setResponse({
        success: false,
        message: "Sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getModeIcon = (mode: TutorMode) => {
    switch (mode) {
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />
      case "validation":
        return <CheckCircle className="h-4 w-4" />
      case "education":
        return <BookOpen className="h-4 w-4" />
      case "hint":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getModeDescription = (mode: TutorMode) => {
    switch (mode) {
      case "suggestion":
        return "Get AI suggestions for building molecules"
      case "validation":
        return "Validate your molecule structure"
      case "education":
        return "Learn about chemistry concepts"
      case "hint":
        return "Get helpful hints without spoilers"
      default:
        return "AI-powered chemistry tutor"
    }
  }

  return (
    <Card className="bg-slate-900/90 backdrop-blur-md border-slate-700/70">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm font-sans flex items-center gap-2 text-slate-100">
          <Brain className="h-4 w-4" />
          AI Chemistry Tutor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pb-3">
        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">What would you like help with?</label>
          <div className="grid grid-cols-2 gap-2">
            {(["suggestion", "validation", "education", "hint"] as TutorMode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => setMode(m)}
                className={`justify-start h-8 ${
                  mode === m 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800/60 hover:border-slate-500"
                }`}
              >
                {getModeIcon(m)}
                <span className="ml-2 capitalize">{m}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-slate-400">{getModeDescription(mode)}</p>
        </div>

        <Separator className="bg-slate-600" />

        {/* Context Input */}
        {mode !== "education" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Context</label>
            <Textarea
              placeholder="e.g., Building water molecule, Working on organic chemistry..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              className="bg-slate-800/60 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
        )}

        {/* Question Input for Education Mode */}
        {mode === "education" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">What would you like to learn about?</label>
            <Textarea
              placeholder="e.g., What is a covalent bond? How do molecules form? Tell me about carbon..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="bg-slate-800/60 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
        )}

        {/* Current Molecule Info */}
        {mode !== "education" && atoms.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Current Molecule</label>
            <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-slate-700/80 text-slate-200">{atoms.length} atoms</Badge>
                <Badge variant="secondary" className="bg-slate-700/80 text-slate-200">{bonds.length} bonds</Badge>
              </div>
              <div className="text-xs text-slate-400">
                Elements: {atoms.map(a => a.element).join(", ")}
              </div>
            </div>
          </div>
        )}

        {/* Ask AI Button */}
        <Button
          onClick={handleAskAI}
          disabled={isLoading || (mode === "education" && !question.trim())}
          className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Ask AI Tutor
            </>
          )}
        </Button>

        {/* AI Response */}
        {response && (
          <div className="space-y-3 p-3 bg-slate-800/40 border border-slate-700/70 rounded-lg">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-cyan-400" />
              <span className="font-medium text-slate-200">AI Response</span>
            </div>

            {/* Main Message */}
            <div className="text-sm whitespace-pre-wrap text-slate-200">{response.message}</div>

            {/* Validation Results */}
            {response.validation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {response.validation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="font-medium text-slate-200">
                    {response.validation.isValid ? "Structure Valid" : "Issues Found"}
                  </span>
                </div>

                {response.validation.issues.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-red-400">Issues:</span>
                    {response.validation.issues.map((issue, i) => (
                      <div key={i} className="text-xs text-red-400">• {issue}</div>
                    ))}
                  </div>
                )}

                {response.validation.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-blue-400">Recommendations:</span>
                    {response.validation.recommendations.map((rec, i) => (
                      <div key={i} className="text-xs text-blue-400">• {rec}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Suggestions */}
            {response.suggestions && response.suggestions.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-green-400">Suggestions:</span>
                {response.suggestions.map((suggestion, i) => (
                  <div key={i} className="text-xs text-green-400">• {suggestion}</div>
                ))}
              </div>
            )}

            {/* Hints */}
            {response.hints && response.hints.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-purple-400">Hints:</span>
                {response.hints.map((hint, i) => (
                  <div key={i} className="text-xs text-purple-400">• {hint}</div>
                ))}
              </div>
            )}

            {/* Educational Info */}
            {response.educationalInfo && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-200">{response.educationalInfo.name}</div>
                <div className="text-xs text-slate-300">{response.educationalInfo.description}</div>
                
                {response.educationalInfo.properties.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-blue-400">Properties:</span>
                    {response.educationalInfo.properties.map((prop, i) => (
                      <div key={i} className="text-xs text-blue-400">• {prop}</div>
                    ))}
                  </div>
                )}

                {response.educationalInfo.applications.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-green-400">Applications:</span>
                    {response.educationalInfo.applications.map((app, i) => (
                      <div key={i} className="text-xs text-green-400">• {app}</div>
                    ))}
                  </div>
                )}

                {response.educationalInfo.funFacts.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-purple-400">Fun Facts:</span>
                    {response.educationalInfo.funFacts.map((fact, i) => (
                      <div key={i} className="text-xs text-purple-400">• {fact}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        
      </CardContent>
    </Card>
  )
}
