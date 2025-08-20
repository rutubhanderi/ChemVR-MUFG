import { type NextRequest, NextResponse } from "next/server"

// Atom valence rules for validation
const ATOM_VALENCE = {
  H: 1, // Hydrogen can form 1 bond
  O: 2, // Oxygen can form 2 bonds
  C: 4, // Carbon can form 4 bonds
  N: 3, // Nitrogen can form 3 bonds
  S: 2, // Sulfur commonly forms 2 bonds (simplified)
  P: 3, // Phosphorus commonly forms 3 bonds (simplified)
  F: 1, // Fluorine forms 1 bond
  Cl: 1, // Chlorine forms 1 bond
  Br: 1, // Bromine forms 1 bond
} as const

type AtomType = keyof typeof ATOM_VALENCE

interface AtomInput {
  id: string
  element: AtomType
}

interface BondInput {
  a: string
  b: string
  order: "single" | "double" | "triple"
}

interface ValidationRequest {
  atoms: AtomInput[]
  bonds: BondInput[]
}

interface ValidationResponse {
  ok: boolean
  hints: string[]
  formula: string
  errors?: string[]
  moleculeName?: string
  properties?: {
    totalAtoms: number
    totalBonds: number
    bondTypes: Record<string, number>
    elementCounts: Record<string, number>
  }
}

// Known molecule database for recognition
const KNOWN_MOLECULES: Record<string, { name: string; description: string }> = {
  H2O: { name: "Water", description: "Essential for life, polar molecule" },
  CO2: { name: "Carbon Dioxide", description: "Greenhouse gas, linear molecule" },
  CH4: { name: "Methane", description: "Natural gas component, tetrahedral geometry" },
  NH3: { name: "Ammonia", description: "Common base, pyramidal geometry" },
  C2H6: { name: "Ethane", description: "Simple alkane hydrocarbon" },
  C2H4: { name: "Ethene", description: "Alkene with double bond" },
  C2H2: { name: "Ethyne", description: "Alkyne with triple bond" },
  H2: { name: "Hydrogen Gas", description: "Diatomic molecule" },
  O2: { name: "Oxygen Gas", description: "Essential for respiration" },
  N2: { name: "Nitrogen Gas", description: "Most abundant gas in atmosphere" },
  HCl: { name: "Hydrogen Chloride", description: "Strong acid when dissolved" },
  H2SO4: { name: "Sulfuric Acid", description: "Strong mineral acid" },
  C6H6: { name: "Benzene", description: "Aromatic hydrocarbon ring" },
}

function calculateMolecularFormula(atoms: AtomInput[]): string {
  const elementCounts = atoms.reduce(
    (acc, atom) => {
      acc[atom.element] = (acc[atom.element] || 0) + 1
      return acc
    },
    {} as Record<AtomType, number>,
  )

  // Standard order: C, H, then alphabetical
  return Object.entries(elementCounts)
    .sort(([a], [b]) => {
      if (a === "C") return -1
      if (b === "C") return 1
      if (a === "H") return -1
      if (b === "H") return 1
      return a.localeCompare(b)
    })
    .map(([element, count]) => (count > 1 ? `${element}${count}` : element))
    .join("")
}

function validateBonding(
  atoms: AtomInput[],
  bonds: BondInput[],
): { isValid: boolean; errors: string[]; hints: string[] } {
  const errors: string[] = []
  const hints: string[] = []

  // Calculate bond counts for each atom
  const atomBondCounts = new Map<string, number>()

  // Initialize bond counts
  atoms.forEach((atom) => {
    atomBondCounts.set(atom.id, 0)
  })

  // Count bonds for each atom
  bonds.forEach((bond) => {
    const bondStrength = bond.order === "single" ? 1 : bond.order === "double" ? 2 : 3

    const currentA = atomBondCounts.get(bond.a) || 0
    const currentB = atomBondCounts.get(bond.b) || 0

    atomBondCounts.set(bond.a, currentA + bondStrength)
    atomBondCounts.set(bond.b, currentB + bondStrength)
  })

  // Validate each atom's bonding
  atoms.forEach((atom) => {
    const maxBonds = ATOM_VALENCE[atom.element]
    const currentBonds = atomBondCounts.get(atom.id) || 0

    if (currentBonds > maxBonds) {
      errors.push(`${atom.element} atom (${atom.id}) has ${currentBonds} bonds but can only have ${maxBonds}`)
    } else if (currentBonds < maxBonds) {
      const needed = maxBonds - currentBonds
      hints.push(`${atom.element} atom needs ${needed} more bond${needed > 1 ? "s" : ""}`)
    }
  })

  // Check for isolated atoms
  const isolatedAtoms = atoms.filter((atom) => (atomBondCounts.get(atom.id) || 0) === 0)
  if (isolatedAtoms.length > 0 && atoms.length > 1) {
    hints.push(`${isolatedAtoms.length} atom${isolatedAtoms.length > 1 ? "s are" : " is"} not bonded`)
  }

  const isValid =
    errors.length === 0 && atoms.every((atom) => atomBondCounts.get(atom.id) === ATOM_VALENCE[atom.element])

  return { isValid, errors, hints }
}

function generateAdvancedHints(atoms: AtomInput[], bonds: BondInput[], formula: string): string[] {
  const hints: string[] = []

  // Recognize common molecules
  const knownMolecule = KNOWN_MOLECULES[formula]
  if (knownMolecule) {
    hints.push(`Perfect! You've built ${knownMolecule.name} (${formula})`)
    hints.push(knownMolecule.description)
  }

  // Suggest molecular geometry
  if (formula === "CH4") {
    hints.push("This molecule has tetrahedral geometry with 109.5° bond angles")
  } else if (formula === "H2O") {
    hints.push("This molecule is bent with approximately 104.5° bond angle")
  } else if (formula === "NH3") {
    hints.push("This molecule has pyramidal geometry due to the lone pair on nitrogen")
  } else if (formula === "CO2") {
    hints.push("This molecule is linear with 180° bond angles")
  }

  // Check for common functional groups
  const carbonCount = atoms.filter((a) => a.element === "C").length
  const oxygenCount = atoms.filter((a) => a.element === "O").length
  const nitrogenCount = atoms.filter((a) => a.element === "N").length

  if (carbonCount > 0 && oxygenCount > 0) {
    const doubleBonds = bonds.filter((b) => b.order === "double").length
    if (doubleBonds > 0) {
      hints.push("Contains C=O double bond (carbonyl group)")
    }
  }

  if (carbonCount > 1) {
    const tripleBonds = bonds.filter((b) => b.order === "triple").length
    if (tripleBonds > 0) {
      hints.push("Contains triple bond (alkyne functional group)")
    }
  }

  return hints
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json()

    // Validate input structure
    if (!body.atoms || !Array.isArray(body.atoms)) {
      return NextResponse.json({ ok: false, hints: [], formula: "", errors: ["Invalid atoms data"] }, { status: 400 })
    }

    if (!body.bonds || !Array.isArray(body.bonds)) {
      return NextResponse.json({ ok: false, hints: [], formula: "", errors: ["Invalid bonds data"] }, { status: 400 })
    }

    // Validate atom elements
    const validElements = Object.keys(ATOM_VALENCE) as AtomType[]
    const invalidAtoms = body.atoms.filter((atom) => !validElements.includes(atom.element))
    if (invalidAtoms.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          hints: [],
          formula: "",
          errors: [`Unsupported elements: ${invalidAtoms.map((a) => a.element).join(", ")}`],
        },
        { status: 400 },
      )
    }

    // Calculate molecular formula
    const formula = calculateMolecularFormula(body.atoms)

    // Validate bonding
    const { isValid, errors, hints: bondingHints } = validateBonding(body.atoms, body.bonds)

    // Generate advanced hints
    const advancedHints = generateAdvancedHints(body.atoms, body.bonds, formula)

    // Combine all hints
    const allHints = [...bondingHints, ...advancedHints]

    // Calculate properties
    const elementCounts = body.atoms.reduce(
      (acc, atom) => {
        acc[atom.element] = (acc[atom.element] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const bondTypes = body.bonds.reduce(
      (acc, bond) => {
        acc[bond.order] = (acc[bond.order] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const response: ValidationResponse = {
      ok: isValid,
      hints: allHints.length > 0 ? allHints : ["Continue building your molecule"],
      formula,
      errors: errors.length > 0 ? errors : undefined,
      moleculeName: KNOWN_MOLECULES[formula]?.name,
      properties: {
        totalAtoms: body.atoms.length,
        totalBonds: body.bonds.length,
        bondTypes,
        elementCounts,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Validation API error:", error)
    return NextResponse.json({ ok: false, hints: [], formula: "", errors: ["Internal server error"] }, { status: 500 })
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
