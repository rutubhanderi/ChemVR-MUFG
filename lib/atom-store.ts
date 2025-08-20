import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

// Atom colors based on chemistry standards
export const ATOM_COLORS = {
  H: "#ffffff", // White
  O: "#ff0000", // Red
  C: "#000000", // Black
  N: "#0000ff", // Blue
  S: "#ffff00", // Yellow
  P: "#ffa500", // Orange
  F: "#00ff99", // Light green
  Cl: "#00ff00", // Green
  Br: "#a52a2a", // Brown
} as const

// Atom valence rules for bond formation
export const ATOM_VALENCE = {
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

export type AtomType = keyof typeof ATOM_COLORS

export interface AtomData {
  id: string
  element: AtomType
  position: [number, number, number]
  isSelected: boolean
  isDragging: boolean
  bondCount: number
}

export interface BondData {
  id: string
  atomA: string
  atomB: string
  order: "single" | "double" | "triple"
  length: number
  strength: number
  createdAt: number
}



export interface MoleculeValidation {
  isValid: boolean
  formula: string
  hints: string[]
  errors: string[]
}

interface AtomStore {
  // State
  atoms: AtomData[]
  bonds: BondData[]
  selectedAtomId: string | null
  draggedAtomId: string | null
  validation: MoleculeValidation
  isValidating: boolean
  useServerValidation: boolean
  lastCreatedBondId: string | null
  bondCreationMode: boolean
  firstAtomForBond: string | null

  // Actions
  addAtom: (element: AtomType, position?: [number, number, number]) => void
  removeAtom: (id: string) => void
  updateAtomPosition: (id: string, position: [number, number, number]) => void
  selectAtom: (id: string | null) => void
  setDraggedAtom: (id: string | null) => void
  addBond: (atomAId: string, atomBId: string, order?: "single" | "double" | "triple") => void
  removeBond: (id: string) => void
  cycleBondOrder: (bondId: string) => void
  breakBondsForAtom: (atomId: string) => void
  clearAll: () => void
  validateMolecule: () => void
  validateMoleculeWithAPI: () => Promise<void>
  toggleServerValidation: () => void
  clearLastCreatedBond: () => void
  enterBondCreationMode: () => void
  exitBondCreationMode: () => void
  selectAtomForBond: (atomId: string) => void

  // Computed
  getAtomById: (id: string) => AtomData | undefined
  getBondsForAtom: (atomId: string) => BondData[]
  canFormBond: (atomAId: string, atomBId: string) => boolean
  calculateDistance: (atomAId: string, atomBId: string) => number
  calculateBondAngle: (atomAId: string, centralAtomId: string, atomCId: string) => number
  suggestBondOrder: (atomAId: string, atomBId: string) => "single" | "double" | "triple"
}

const initialValidation: MoleculeValidation = {
  isValid: false,
  formula: "",
  hints: ["Add atoms to start building a molecule"],
  errors: [],
}

export const useAtomStore = create<AtomStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    atoms: [],
    bonds: [],
    selectedAtomId: null,
    draggedAtomId: null,
    validation: initialValidation,
    isValidating: false,
    useServerValidation: false,
    lastCreatedBondId: null,
    bondCreationMode: false,
    firstAtomForBond: null,

    // Actions
    addAtom: (element: AtomType, position?: [number, number, number]) => {
      const newAtom: AtomData = {
        id: `atom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        element,
        position: position || [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6],
        isSelected: false,
        isDragging: false,
        bondCount: 0,
      }

      set((state) => ({
        atoms: [...state.atoms, newAtom],
      }))

      // Trigger validation after adding atom
      setTimeout(() => get().validateMolecule(), 0)
    },

    removeAtom: (id: string) => {
      set((state) => {
        // Remove all bonds connected to this atom
        const filteredBonds = state.bonds.filter((bond) => bond.atomA !== id && bond.atomB !== id)

        // Remove the atom
        const filteredAtoms = state.atoms.filter((atom) => atom.id !== id)

        // Update bond counts for remaining atoms
        const updatedAtoms = filteredAtoms.map((atom) => ({
          ...atom,
          bondCount: filteredBonds
            .filter((bond) => bond.atomA === atom.id || bond.atomB === atom.id)
            .reduce((sum, bond) => sum + bond.strength, 0),
        }))

        return {
          atoms: updatedAtoms,
          bonds: filteredBonds,
          selectedAtomId: state.selectedAtomId === id ? null : state.selectedAtomId,
        }
      })

      setTimeout(() => get().validateMolecule(), 0)
    },

    updateAtomPosition: (id: string, position: [number, number, number]) => {
      // Constrain Z-axis movement to prevent atoms from going too far forward/backward
      const currentAtom = get().atoms.find(atom => atom.id === id)
      if (currentAtom) {
        const [originalX, originalY, originalZ] = currentAtom.position
        const [newX, newY, newZ] = position
        
        // Allow full X and Y movement, but heavily constrain Z movement
        const zConstraint = 0.3 // Maximum Z-axis movement allowed
        const constrainedZ = Math.max(
          originalZ - zConstraint,
          Math.min(originalZ + zConstraint, newZ)
        )
        
        const constrainedPosition: [number, number, number] = [newX, newY, constrainedZ]
        
        set((state) => ({
          atoms: state.atoms.map((atom) => (atom.id === id ? { ...atom, position: constrainedPosition } : atom)),
        }))
      }
    },

    selectAtom: (id: string | null) => {
      set((state) => ({
        selectedAtomId: id,
        atoms: state.atoms.map((atom) => ({
          ...atom,
          isSelected: atom.id === id,
        })),
      }))
    },

    setDraggedAtom: (id: string | null) => {
      set((state) => ({
        draggedAtomId: id,
        atoms: state.atoms.map((atom) => ({
          ...atom,
          isDragging: atom.id === id,
        })),
      }))
    },

    addBond: (atomAId: string, atomBId: string, order: "single" | "double" | "triple" = "single") => {
      const { atoms, bonds } = get()

      // Check if bond already exists
      const bondExists = bonds.some(
        (bond) =>
          (bond.atomA === atomAId && bond.atomB === atomBId) || (bond.atomA === atomBId && bond.atomB === atomAId),
      )

      if (bondExists || !get().canFormBond(atomAId, atomBId)) return

      const distance = get().calculateDistance(atomAId, atomBId)
      const strength = order === "single" ? 1 : order === "double" ? 2 : 3

      const newBond: BondData = {
        id: `bond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        atomA: atomAId,
        atomB: atomBId,
        order,
        length: distance,
        strength,
        createdAt: Date.now(),
      }

      set((state) => {
        // Update bond counts for both atoms
        const updatedAtoms = state.atoms.map((atom) => {
          if (atom.id === atomAId || atom.id === atomBId) {
            return { ...atom, bondCount: atom.bondCount + strength }
          }
          return atom
        })

        return {
          atoms: updatedAtoms,
          bonds: [...state.bonds, newBond],
          lastCreatedBondId: newBond.id,
        }
      })

      setTimeout(() => get().validateMolecule(), 0)
    },

    removeBond: (id: string) => {
      set((state) => {
        const bondToRemove = state.bonds.find((bond) => bond.id === id)
        if (!bondToRemove) return state

        const updatedAtoms = state.atoms.map((atom) => {
          if (atom.id === bondToRemove.atomA || atom.id === bondToRemove.atomB) {
            return { ...atom, bondCount: Math.max(0, atom.bondCount - bondToRemove.strength) }
          }
          return atom
        })

        return {
          atoms: updatedAtoms,
          bonds: state.bonds.filter((bond) => bond.id !== id),
        }
      })

      setTimeout(() => get().validateMolecule(), 0)
    },



    cycleBondOrder: (bondId: string) => {
      set((state) => {
        const bond = state.bonds.find((b) => b.id === bondId)
        if (!bond) return state

        const orderCycle = { single: "double", double: "triple", triple: "single" } as const
        const newOrder = orderCycle[bond.order]
        const oldStrength = bond.strength
        const newStrength = newOrder === "single" ? 1 : newOrder === "double" ? 2 : 3

        const atomA = state.atoms.find((a) => a.id === bond.atomA)
        const atomB = state.atoms.find((a) => a.id === bond.atomB)

        if (!atomA || !atomB) return state

        const atomAAvailableBonds = ATOM_VALENCE[atomA.element] - atomA.bondCount + oldStrength
        const atomBAvailableBonds = ATOM_VALENCE[atomB.element] - atomB.bondCount + oldStrength

        if (atomAAvailableBonds < newStrength || atomBAvailableBonds < newStrength) {
          return state // Cannot upgrade bond order
        }

        const updatedBonds = state.bonds.map((b) =>
          b.id === bondId ? { ...b, order: newOrder, strength: newStrength } : b,
        )

        const updatedAtoms = state.atoms.map((atom) => {
          if (atom.id === bond.atomA || atom.id === bond.atomB) {
            return { ...atom, bondCount: atom.bondCount - oldStrength + newStrength }
          }
          return atom
        })

        return {
          atoms: updatedAtoms,
          bonds: updatedBonds,
        }
      })

      setTimeout(() => get().validateMolecule(), 0)
    },

    breakBondsForAtom: (atomId: string) => {
      const bondsToBreak = get().getBondsForAtom(atomId)
      bondsToBreak.forEach((bond) => get().removeBond(bond.id))
    },



    clearAll: () => {
      set({
        atoms: [],
        bonds: [],
        selectedAtomId: null,
        draggedAtomId: null,
        validation: initialValidation,
        isValidating: false,
        useServerValidation: false,
      })
    },

    validateMolecule: () => {
      const { useServerValidation } = get()

      if (useServerValidation) {
        get().validateMoleculeWithAPI()
        return
      }

      const { atoms, bonds } = get()

      if (atoms.length === 0) {
        set({
          validation: {
            isValid: false,
            formula: "",
            hints: ["Add atoms to start building a molecule"],
            errors: [],
          },
        })
        return
      }

      const elementCounts = atoms.reduce(
        (acc, atom) => {
          acc[atom.element] = (acc[atom.element] || 0) + 1
          return acc
        },
        {} as Record<AtomType, number>,
      )

      const formula = Object.entries(elementCounts)
        .sort(([a], [b]) => {
          if (a === "C") return -1
          if (b === "C") return 1
          if (a === "H") return -1
          if (b === "H") return 1
          return a.localeCompare(b)
        })
        .map(([element, count]) => (count > 1 ? `${element}${count}` : element))
        .join("")

      const errors: string[] = []
      const hints: string[] = []

      atoms.forEach((atom) => {
        const maxBonds = ATOM_VALENCE[atom.element]
        if (atom.bondCount > maxBonds) {
          errors.push(`${atom.element} atom has ${atom.bondCount} bonds but can only have ${maxBonds}`)
        } else if (atom.bondCount < maxBonds) {
          hints.push(`${atom.element} atom needs ${maxBonds - atom.bondCount} more bond(s)`)
        }
      })

      const isValid = errors.length === 0 && atoms.every((atom) => atom.bondCount === ATOM_VALENCE[atom.element])

      if (isValid) {
        switch (formula) {
          case "H2O":
            hints.push("Perfect! You've built Water (H₂O)")
            break
          case "CO2":
            hints.push("Excellent! You've built Carbon Dioxide (CO₂)")
            break
          case "NH3":
            hints.push("Great! You've built Ammonia (NH₃)")
            break
          case "CH4":
            hints.push("Wonderful! You've built Methane (CH₄)")
            break
          default:
            hints.push("Valid molecule structure!")
        }
      } else if (atoms.length >= 2 && bonds.length === 0) {
        hints.push("Drag atoms close together to form bonds")
      }

      set({
        validation: {
          isValid,
          formula,
          hints: hints.length > 0 ? hints : ["Continue building your molecule"],
          errors,
        },
      })
    },

    validateMoleculeWithAPI: async () => {
      const { atoms, bonds } = get()

      set({ isValidating: true })

      try {
        const requestBody = {
          atoms: atoms.map((atom) => ({
            id: atom.id,
            element: atom.element,
          })),
          bonds: bonds.map((bond) => ({
            a: bond.atomA,
            b: bond.atomB,
            order: bond.order,
          })),
        }

        const response = await fetch("/api/validate", {
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

        set({
          validation: {
            isValid: result.ok,
            formula: result.formula,
            hints: result.hints || [],
            errors: result.errors || [],
          },
          isValidating: false,
        })
      } catch (error) {
        console.error("API validation failed:", error)
        // Fall back to client-side validation
        set({ isValidating: false, useServerValidation: false })
        get().validateMolecule()
      }
    },

    toggleServerValidation: () => {
      set((state) => ({ useServerValidation: !state.useServerValidation }))
      // Re-validate with new method
      setTimeout(() => get().validateMolecule(), 0)
    },

    clearLastCreatedBond: () => {
      set({ lastCreatedBondId: null })
    },

    enterBondCreationMode: () => {
      set({ 
        bondCreationMode: true, 
        firstAtomForBond: null,
        selectedAtomId: null 
      })
    },

    exitBondCreationMode: () => {
      set({ 
        bondCreationMode: false, 
        firstAtomForBond: null,
        selectedAtomId: null 
      })
    },

    selectAtomForBond: (atomId: string) => {
      const { bondCreationMode, firstAtomForBond, atoms } = get()
      
      if (!bondCreationMode) return

      if (!firstAtomForBond) {
        // First atom selection
        set({ 
          firstAtomForBond: atomId,
          selectedAtomId: atomId,
          atoms: atoms.map((atom) => ({
            ...atom,
            isSelected: atom.id === atomId,
          }))
        })
      } else if (firstAtomForBond !== atomId) {
        // Second atom selection - create the bond
        const suggestedOrder = get().suggestBondOrder(firstAtomForBond, atomId)
        get().addBond(firstAtomForBond, atomId, suggestedOrder)
        
        // Exit bond creation mode and clear selection
        set({ 
          bondCreationMode: false,
          firstAtomForBond: null,
          selectedAtomId: null,
          atoms: atoms.map((atom) => ({
            ...atom,
            isSelected: false,
          }))
        })
      }
    },

    // Computed functions
    getAtomById: (id: string) => {
      return get().atoms.find((atom) => atom.id === id)
    },

    getBondsForAtom: (atomId: string) => {
      return get().bonds.filter((bond) => bond.atomA === atomId || bond.atomB === atomId)
    },

    canFormBond: (atomAId: string, atomBId: string) => {
      const { atoms } = get()
      const atomA = atoms.find((a) => a.id === atomAId)
      const atomB = atoms.find((a) => a.id === atomBId)

      if (!atomA || !atomB) return false

      const maxBondsA = ATOM_VALENCE[atomA.element]
      const maxBondsB = ATOM_VALENCE[atomB.element]

      return atomA.bondCount < maxBondsA && atomB.bondCount < maxBondsB
    },

    calculateDistance: (atomAId: string, atomBId: string) => {
      const { atoms } = get()
      const atomA = atoms.find((a) => a.id === atomAId)
      const atomB = atoms.find((a) => a.id === atomBId)

      if (!atomA || !atomB) return Number.POSITIVE_INFINITY

      const [x1, y1, z1] = atomA.position
      const [x2, y2, z2] = atomB.position

      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)
    },

    calculateBondAngle: (atomAId: string, centralAtomId: string, atomCId: string) => {
      const { atoms } = get()
      const atomA = atoms.find((a) => a.id === atomAId)
      const central = atoms.find((a) => a.id === centralAtomId)
      const atomC = atoms.find((a) => a.id === atomCId)

      if (!atomA || !central || !atomC) return 0

      const [x1, y1, z1] = atomA.position
      const [x2, y2, z2] = central.position
      const [x3, y3, z3] = atomC.position

      const vec1 = [x1 - x2, y1 - y2, z1 - z2]
      const vec2 = [x3 - x2, y3 - y2, z3 - z2]

      const dotProduct = vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2]
      const mag1 = Math.sqrt(vec1[0] ** 2 + vec1[1] ** 2 + vec1[2] ** 2)
      const mag2 = Math.sqrt(vec2[0] ** 2 + vec2[1] ** 2 + vec2[2] ** 2)

      const cosAngle = dotProduct / (mag1 * mag2)
      return (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI
    },

    suggestBondOrder: (atomAId: string, atomBId: string): "single" | "double" | "triple" => {
      const { atoms } = get()
      const atomA = atoms.find((a) => a.id === atomAId)
      const atomB = atoms.find((a) => a.id === atomBId)

      if (!atomA || !atomB) return "single"

      const availableA = ATOM_VALENCE[atomA.element] - atomA.bondCount
      const availableB = ATOM_VALENCE[atomB.element] - atomB.bondCount

      if (atomA.element === "C" && atomB.element === "C") {
        if (availableA >= 3 && availableB >= 3) return "triple"
        if (availableA >= 2 && availableB >= 2) return "double"
        return "single"
      }

      if ((atomA.element === "C" && atomB.element === "O") || (atomA.element === "O" && atomB.element === "C")) {
        if (availableA >= 2 && availableB >= 2) return "double"
        return "single"
      }

      if (atomA.element === "N" && atomB.element === "N") {
        if (availableA >= 3 && availableB >= 3) return "triple"
        if (availableA >= 2 && availableB >= 2) return "double"
        return "single"
      }

      return "single"
    },
  })),
)


