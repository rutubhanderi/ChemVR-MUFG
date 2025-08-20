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
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Chemistry Tutor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">What would you like help with?</label>
          <div className="grid grid-cols-2 gap-2">
            {(["suggestion", "validation", "education", "hint"] as TutorMode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => setMode(m)}
                className="justify-start"
              >
                {getModeIcon(m)}
                <span className="ml-2 capitalize">{m}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{getModeDescription(mode)}</p>
        </div>

        <Separator />

        {/* Context Input */}
        {mode !== "education" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Context (optional)</label>
            <Textarea
              placeholder="e.g., Building water molecule, Working on organic chemistry..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {/* Question Input for Education Mode */}
        {mode === "education" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">What would you like to learn about?</label>
            <Textarea
              placeholder="e.g., What is a covalent bond? How do molecules form? Tell me about carbon..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Current Molecule Info */}
        {mode !== "education" && atoms.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Molecule</label>
            <div className="p-3 bg-muted/50 rounded text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{atoms.length} atoms</Badge>
                <Badge variant="secondary">{bonds.length} bonds</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Elements: {atoms.map(a => a.element).join(", ")}
              </div>
            </div>
          </div>
        )}

        {/* Ask AI Button */}
        <Button
          onClick={handleAskAI}
          disabled={isLoading || (mode === "education" && !question.trim())}
          className="w-full"
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
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="font-medium">AI Response</span>
            </div>

            {/* Main Message */}
            <div className="text-sm whitespace-pre-wrap">{response.message}</div>

            {/* Validation Results */}
            {response.validation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {response.validation.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="font-medium">
                    {response.validation.isValid ? "Structure Valid" : "Issues Found"}
                  </span>
                </div>

                {response.validation.issues.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-red-600">Issues:</span>
                    {response.validation.issues.map((issue, i) => (
                      <div key={i} className="text-xs text-red-600">• {issue}</div>
                    ))}
                  </div>
                )}

                {response.validation.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-blue-600">Recommendations:</span>
                    {response.validation.recommendations.map((rec, i) => (
                      <div key={i} className="text-xs text-blue-600">• {rec}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Suggestions */}
            {response.suggestions && response.suggestions.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-green-600">Suggestions:</span>
                {response.suggestions.map((suggestion, i) => (
                  <div key={i} className="text-xs text-green-600">• {suggestion}</div>
                ))}
              </div>
            )}

            {/* Hints */}
            {response.hints && response.hints.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-purple-600">Hints:</span>
                {response.hints.map((hint, i) => (
                  <div key={i} className="text-xs text-purple-600">• {hint}</div>
                ))}
              </div>
            )}

            {/* Educational Info */}
            {response.educationalInfo && (
              <div className="space-y-2">
                <div className="text-sm font-medium">{response.educationalInfo.name}</div>
                <div className="text-xs">{response.educationalInfo.description}</div>
                
                {response.educationalInfo.properties.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-blue-600">Properties:</span>
                    {response.educationalInfo.properties.map((prop, i) => (
                      <div key={i} className="text-xs text-blue-600">• {prop}</div>
                    ))}
                  </div>
                )}

                {response.educationalInfo.applications.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-green-600">Applications:</span>
                    {response.educationalInfo.applications.map((app, i) => (
                      <div key={i} className="text-xs text-green-600">• {app}</div>
                    ))}
                  </div>
                )}

                {response.educationalInfo.funFacts.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-purple-600">Fun Facts:</span>
                    {response.educationalInfo.funFacts.map((fact, i) => (
                      <div key={i} className="text-xs text-purple-600">• {fact}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        {!response && (
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <Key className="h-3 w-3" />
              <span className="font-medium">Powered by ChatGroq</span>
            </div>
            <p>Fast AI responses using open-source models</p>
            <p className="text-xs">
              <strong>Setup:</strong> Add your ChatGroq API key to <code className="bg-muted px-1 rounded">.env.local</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
