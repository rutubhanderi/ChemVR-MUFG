"use client"

import { useRef, useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Text, OrbitControls } from "@react-three/drei"
import { useAtomStore, ATOM_COLORS, type AtomData, type BondData } from "@/lib/atom-store"
import * as THREE from "three"

// 3D Atom Component with enhanced interaction
function AtomSphere({ atom }: { atom: AtomData }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  const { 
    updateAtomPosition, 
    selectAtom, 
    setDraggedAtom, 
    removeAtom, 
    selectedAtomId,
    bondCreationMode,
    firstAtomForBond,
    selectAtomForBond
  } = useAtomStore()

  // Handle mouse interactions
  const handlePointerDown = (event: any) => {
    event.stopPropagation()
    selectAtom(atom.id)
    setDraggedAtom(atom.id)
    document.body.style.cursor = "grabbing"
  }

  const handlePointerUp = (event: any) => {
    event.stopPropagation()
    setDraggedAtom(null)
    document.body.style.cursor = "default"
  }

  const handlePointerMove = (event: any) => {
    if (atom.isDragging && event.point) {
      const newPosition: [number, number, number] = [event.point.x, event.point.y, event.point.z]
      updateAtomPosition(atom.id, newPosition)
    }
  }

  const handleClick = (event: any) => {
    event.stopPropagation()
    
    if (bondCreationMode) {
      // In bond creation mode, use the new workflow
      selectAtomForBond(atom.id)
    } else {
      // Only allow atom selection when not in bond creation mode
      selectAtom(atom.id)
    }
  }

  // Double-click to delete atom
  const handleDoubleClick = (event: any) => {
    event.stopPropagation()
    removeAtom(atom.id)
  }

  // Animate selected atoms
  useFrame((state) => {
    if (meshRef.current && atom.isSelected) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1)
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1)
    }
  })

  const atomColor = ATOM_COLORS[atom.element]
  const emissiveColor = atom.isDragging ? "#444444" : atom.isSelected ? "#222222" : "#000000"

  return (
    <group position={atom.position}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerEnter={() => (document.body.style.cursor = "grab")}
        onPointerLeave={() => (document.body.style.cursor = "default")}
      >
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={atomColor} emissive={emissiveColor} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Atom label */}
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.3}
        color={atom.element === "C" ? "#ffffff" : "#000000"}
        anchorX="center"
        anchorY="middle"
      >
        {atom.element}
      </Text>

      {/* Selection indicator */}
      {atom.isSelected && (
        <mesh>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial 
            color={bondCreationMode && firstAtomForBond === atom.id ? "#ffff00" : "#00ff00"} 
            transparent 
            opacity={0.6} 
          />
        </mesh>
      )}
      
      {/* First atom selection indicator for bond creation */}
      {bondCreationMode && firstAtomForBond === atom.id && (
        <mesh>
          <ringGeometry args={[0.7, 0.8, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  )
}

// 3D Bond Component with click interaction
function BondCylinder({ bond, atoms }: { bond: BondData; atoms: AtomData[] }) {
  const atomA = atoms.find((a) => a.id === bond.atomA)
  const atomB = atoms.find((a) => a.id === bond.atomB)
  const { cycleBondOrder, removeBond } = useAtomStore()

  if (!atomA || !atomB) return null

  const start = new THREE.Vector3(...atomA.position)
  const end = new THREE.Vector3(...atomB.position)
  const direction = end.clone().sub(start)
  const length = direction.length()
  const center = start.clone().add(end).multiplyScalar(0.5)

  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize())

  const bondWidth = bond.order === "single" ? 0.06 : bond.order === "double" ? 0.08 : 0.12
  const bondColor = "#666666"

  const handleClick = (event: any) => {
    event.stopPropagation()
    cycleBondOrder(bond.id)
  }

  const handleDoubleClick = (event: any) => {
    event.stopPropagation()
    removeBond(bond.id)
  }

  return (
    <group position={center.toArray()} quaternion={quaternion.toArray()}>
      <mesh
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerEnter={() => (document.body.style.cursor = "pointer")}
        onPointerLeave={() => (document.body.style.cursor = "default")}
      >
        <cylinderGeometry args={[bondWidth, bondWidth, length, 8]} />
        <meshStandardMaterial color={bondColor} />
      </mesh>

      {/* Double/Triple bond indicators */}
      {bond.order === "double" && (
        <mesh position={[0.15, 0, 0]} onClick={handleClick} onDoubleClick={handleDoubleClick}>
          <cylinderGeometry args={[bondWidth * 0.7, bondWidth * 0.7, length, 8]} />
          <meshStandardMaterial color={bondColor} />
        </mesh>
      )}

      {bond.order === "triple" && (
        <>
          <mesh position={[0.15, 0, 0]} onClick={handleClick} onDoubleClick={handleDoubleClick}>
            <cylinderGeometry args={[bondWidth * 0.6, bondWidth * 0.6, length, 8]} />
            <meshStandardMaterial color={bondColor} />
          </mesh>
          <mesh position={[-0.15, 0, 0]} onClick={handleClick} onDoubleClick={handleDoubleClick}>
            <cylinderGeometry args={[bondWidth * 0.6, bondWidth * 0.6, length, 8]} />
            <meshStandardMaterial color={bondColor} />
          </mesh>
        </>
      )}

      {/* Bond order label */}
      <Text position={[0, 0, 0.4]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">
        {bond.order === "single" ? "1" : bond.order === "double" ? "2" : "3"}
      </Text>
    </group>
  )
}



// Main 3D Scene Component
export function MolecularScene() {
  const { 
    atoms, 
    bonds, 
    draggedAtomId, 
    setDraggedAtom, 
    lastCreatedBondId, 
    clearLastCreatedBond,
    bondCreationMode,
    firstAtomForBond,
    exitBondCreationMode
  } = useAtomStore()
  const { camera, controls } = useThree() as any

  // Handle global pointer events for dragging
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (draggedAtomId) {
        setDraggedAtom(null)
        document.body.style.cursor = "default"
      }
    }

    document.addEventListener("pointerup", handleGlobalPointerUp)
    return () => document.removeEventListener("pointerup", handleGlobalPointerUp)
  }, [draggedAtomId, setDraggedAtom])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && bondCreationMode) {
        exitBondCreationMode()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [bondCreationMode, exitBondCreationMode])

  // Smoothly move camera to look at the last created bond
  useEffect(() => {
    if (!lastCreatedBondId) return
    const bond = bonds.find((b) => b.id === lastCreatedBondId)
    if (!bond) {
      clearLastCreatedBond()
      return
    }

    const atomA = atoms.find((a) => a.id === bond.atomA)
    const atomB = atoms.find((a) => a.id === bond.atomB)
    if (!atomA || !atomB) {
      clearLastCreatedBond()
      return
    }

    const startPosition = camera.position.clone()
    const targetCenter = new THREE.Vector3(
      (atomA.position[0] + atomB.position[0]) / 2,
      (atomA.position[1] + atomB.position[1]) / 2,
      (atomA.position[2] + atomB.position[2]) / 2,
    )

    // Position camera at an offset from the bond center
    const offset = new THREE.Vector3(2, 2, 2)
    const endPosition = targetCenter.clone().add(offset)

    const durationMs = 800
    const startTime = performance.now()

    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      camera.position.lerpVectors(startPosition, endPosition, ease)
      camera.lookAt(targetCenter)
      if (controls) controls.update()
      if (t < 1) requestAnimationFrame(animate)
      else clearLastCreatedBond()
    }

    requestAnimationFrame(animate)
  }, [lastCreatedBondId, atoms, bonds, camera, controls, clearLastCreatedBond])

  return (
    <>
      <OrbitControls makeDefault enableDamping dampingFactor={0.1} rotateSpeed={0.6} />
      
      {/* Bond Creation Mode Indicator */}
      {bondCreationMode && (
        <>
          <Text
            position={[0, 4, 0]}
            fontSize={0.5}
            color="#ffff00"
            anchorX="center"
            anchorY="middle"
          >
            BOND CREATION MODE
          </Text>
          <Text
            position={[0, 3.5, 0]}
            fontSize={0.3}
            color="#ffff00"
            anchorX="center"
            anchorY="middle"
          >
            {firstAtomForBond ? "Click second atom" : "Click first atom"}
          </Text>
        </>
      )}
      
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />

      {/* Render atoms */}
      {atoms.map((atom) => (
        <AtomSphere key={atom.id} atom={atom} />
      ))}

      {/* Render bonds */}
      {bonds.map((bond) => (
        <BondCylinder key={bond.id} bond={bond} atoms={atoms} />
      ))}



      {/* Reference grid */}
      <gridHelper args={[12, 12, "#333333", "#111111"]} />

      {/* Coordinate axes helper */}
      <axesHelper args={[2]} />
    </>
  )
}
