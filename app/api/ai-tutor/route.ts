import { type NextRequest, NextResponse } from "next/server"

interface MoleculeData {
  atoms: Array<{ element: string; position: [number, number, number] }>
  bonds: Array<{ atomA: string; atomB: string; order: "single" | "double" | "triple" }>
}

interface AITutorRequest {
  type: "suggestion" | "validation" | "education" | "hint"
  molecule?: MoleculeData
  question?: string
  context?: string
}

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

// System prompt for the AI tutor
const SYSTEM_PROMPT = `You are an expert chemistry tutor specializing in molecular structures and chemical bonding. Your role is to:

1. Help students understand molecular structures
2. Validate chemical bonds and identify issues
3. Provide educational information about molecules
4. Give helpful hints for building molecules
5. Suggest improvements and corrections

Always be encouraging, educational, and accurate. Use simple language when possible and provide step-by-step guidance.

Key chemistry rules to remember:
- Hydrogen (H) can form 1 bond
- Oxygen (O) can form 2 bonds  
- Carbon (C) can form 4 bonds
- Nitrogen (N) can form 3 bonds
- Sulfur (S) commonly forms 2 bonds
- Phosphorus (P) commonly forms 3 bonds
- Halogens (F, Cl, Br) form 1 bond

Respond in a helpful, educational tone.`

async function queryGemini(prompt: string, model: string = "gemini-1.5-flash"): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nUser question: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.9,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request."
  } catch (error) {
    console.error("Gemini API error:", error)
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return "API key not configured. Please set the GEMINI_API_KEY environment variable."
    }
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later."
  }
}

function generatePrompt(request: AITutorRequest): string {
  const { type, molecule, question, context } = request

  switch (type) {
    case "suggestion":
      return `The student wants suggestions for building molecules. 

Current molecule state:
${molecule ? `Atoms: ${molecule.atoms.map(a => `${a.element} at (${a.position.join(', ')})`).join(', ')}
Bonds: ${molecule.bonds.map(b => `${b.atomA}-${b.atomB} (${b.order})`).join(', ')}` : 'No molecule data provided'}

Context: ${context || 'Building a molecule'}

Please provide:
1. What molecule this could be
2. Suggestions for completing it
3. Any corrections needed
4. Educational insights about the molecule type

Give the answer in a way that is easy to understand and follow. Don't keep the answer too long.

Be encouraging and educational.`

    case "validation":
      return `The student wants validation of their molecule structure.

Molecule to validate:
${molecule ? `Atoms: ${molecule.atoms.map(a => `${a.element} at (${a.position.join(', ')})`).join(', ')}
Bonds: ${molecule.bonds.map(b => `${b.atomA}-${b.atomB} (${b.order})`).join(', ')}` : 'No molecule data provided'}

Please:
1. Check if the structure is chemically valid
2. Identify any bonding issues
3. Suggest corrections
4. Explain why certain bonds are invalid
5. Provide positive feedback on what's correct

Be thorough but encouraging.`

    case "education":
      return `The student wants educational information about molecules.

Question: ${question || 'General molecule information'}
Context: ${context || 'Learning about chemistry'}

Please provide:
1. Clear explanations of molecular concepts
2. Examples and analogies
3. Real-world applications
4. Fun facts to engage interest
5. Related concepts to explore

Make it engaging and educational for a chemistry student.`

    case "hint":
      return `The student needs hints for building a molecule.

Current progress:
${molecule ? `Atoms: ${molecule.atoms.map(a => `${a.element} at (${a.position.join(', ')})`).join(', ')}
Bonds: ${molecule.bonds.map(b => `${b.atomA}-${b.atomB} (${b.order})`).join(', ')}` : 'No molecule data provided'}

Context: ${context || 'Building a molecule'}

Please provide:
1. Gentle hints without giving away the answer
2. Step-by-step guidance
3. Encouragement for progress made
4. Chemistry principles to remember
5. What to try next

Be supportive and guide without spoiling the learning experience.`

    default:
      return `The student has a general chemistry question.

Question: ${question || 'Chemistry help needed'}
Context: ${context || 'Learning chemistry'}

Please provide helpful, educational guidance.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AITutorRequest = await request.json()

    if (!body.type) {
      return NextResponse.json(
        { success: false, message: "Request type is required" },
        { status: 400 }
      )
    }

    // Generate the prompt for the AI
    const prompt = generatePrompt(body)
    
    // Query Gemini
    const aiResponse = await queryGemini(prompt)

    // Parse and structure the AI response based on type
    let response: AITutorResponse = {
      success: true,
      message: aiResponse,
    }

    // Add structured data based on response type
    if (body.type === "validation" && body.molecule) {
      // Extract validation information from AI response
      const validation = {
        isValid: !aiResponse.toLowerCase().includes("invalid") && !aiResponse.toLowerCase().includes("error"),
        issues: aiResponse.split('\n').filter(line => 
          line.toLowerCase().includes("issue") || 
          line.toLowerCase().includes("problem") ||
          line.toLowerCase().includes("invalid")
        ),
        recommendations: aiResponse.split('\n').filter(line => 
          line.toLowerCase().includes("suggest") || 
          line.toLowerCase().includes("recommend") ||
          line.toLowerCase().includes("try")
        ),
      }
      response.validation = validation
    }

    if (body.type === "suggestion") {
      response.suggestions = aiResponse.split('\n').filter(line => 
        line.trim().length > 0 && 
        (line.includes("•") || line.includes("-") || line.includes("1.") || line.includes("2."))
      )
    }

    if (body.type === "hint") {
      response.hints = aiResponse.split('\n').filter(line => 
        line.trim().length > 0 && 
        (line.includes("•") || line.includes("-") || line.includes("Hint") || line.includes("Try"))
      )
    }

    if (body.type === "education") {
      response.educationalInfo = {
        name: "Molecule Information",
        description: aiResponse.split('\n')[0] || aiResponse,
        properties: aiResponse.split('\n').filter(line => 
          line.toLowerCase().includes("property") || 
          line.toLowerCase().includes("characteristic")
        ),
        applications: aiResponse.split('\n').filter(line => 
          line.toLowerCase().includes("use") || 
          line.toLowerCase().includes("application")
        ),
        funFacts: aiResponse.split('\n').filter(line => 
          line.toLowerCase().includes("fact") || 
          line.toLowerCase().includes("interesting")
        ),
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("AI Tutor API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error. Please try again later." 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
