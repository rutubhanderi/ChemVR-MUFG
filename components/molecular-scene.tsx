"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Text, OrbitControls } from "@react-three/drei"
import { useAtomStore, ATOM_COLORS, type AtomData, type BondData, type BondPreview } from "@/lib/atom-store"
import * as THREE from "three"

// 3D Atom Component with enhanced interaction
function AtomSphere({ atom }: { atom: AtomData }) {
	const meshRef = useRef<THREE.Mesh>(null)
	const { camera } = useThree()
	const { updateAtomPosition, selectAtom, removeAtom } = useAtomStore()

	// Handle click to select atom
	const handleClick = (event: any) => {
		event.stopPropagation()
		selectAtom(atom.id)
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
	const emissiveColor = atom.isSelected ? "#222222" : "#000000"

	return (
		<group position={atom.position}>
			<mesh
				ref={meshRef}
				onClick={handleClick}
				onDoubleClick={handleDoubleClick}
				onPointerEnter={() => (document.body.style.cursor = "pointer")}
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
					<meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
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

// Bond Preview Component for visual feedback
function BondPreviewLine({ preview, atoms }: { preview: BondPreview; atoms: AtomData[] }) {
	const atomA = atoms.find((a) => a.id === preview.atomA)
	const atomB = atoms.find((a) => a.id === preview.atomB)

	if (!atomA || !atomB) return null

	const start = new THREE.Vector3(...atomA.position)
	const end = new THREE.Vector3(...atomB.position)
	const direction = end.clone().sub(start)
	const length = direction.length()
	const center = start.clone().add(end).multiplyScalar(0.5)

	const up = new THREE.Vector3(0, 1, 0)
	const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.normalize())

	// Color based on whether bond can form
	const color = preview.canForm ? "#00ff00" : "#ff6600"
	const opacity = preview.canForm ? 0.6 : 0.3

	return (
		<group position={center.toArray()} quaternion={quaternion.toArray()}>
			<mesh>
				<cylinderGeometry args={[0.02, 0.02, length, 8]} />
				<meshBasicMaterial color={color} transparent opacity={opacity} />
			</mesh>

			{/* Bond order indicator */}
			{preview.canForm && preview.suggestedOrder !== "single" && (
				<Text position={[0, 0, 0.3]} fontSize={0.2} color={color} anchorX="center" anchorY="middle">
					{preview.suggestedOrder === "double" ? "=" : "≡"}
				</Text>
			)}
		</group>
	)
}

// Main 3D Scene Component
export function MolecularScene() {
	const {
		atoms,
		bonds,
		bondPreviews,
		selectedAtomId,
		getAtomById,
		updateAtomPosition,
		selectAtom,
	} = useAtomStore()
	const { camera, controls } = useThree() as any

	// Keyboard movement for selected atom (WASD)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!selectedAtomId) return
			const atom = getAtomById(selectedAtomId)
			if (!atom) return
			const step = 0.2
			let [x, y, z] = atom.position
			if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") y += step
			else if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") y -= step
			else if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") x -= step
			else if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") x += step
			else return
			updateAtomPosition(selectedAtomId, [x, y, z])
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [selectedAtomId, getAtomById, updateAtomPosition])

	return (
		<group onPointerMissed={() => selectAtom(null)}>
			<OrbitControls makeDefault enableDamping dampingFactor={0.1} rotateSpeed={0.6} />
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

			{bondPreviews.map((preview, index) => (
				<BondPreviewLine key={`preview-${index}`} preview={preview} atoms={atoms} />
			))}

			{/* Reference grid */}
			<gridHelper args={[12, 12, "#333333", "#111111"]} />

			{/* Coordinate axes helper */}
			<axesHelper args={[2]} />
		</group>
	)
}
