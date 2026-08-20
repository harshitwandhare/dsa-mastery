"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Float, RoundedBox, Text } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * The hero's floating objects.
 *
 * Every glyph is something the curriculum actually teaches with — the bracket
 * pairs you match, the comparison that decides a branch, the walrus, the slice.
 * They drift, they respond to the pointer, and they can be dragged and thrown.
 *
 * Everything here is decoration, so it is loaded lazily, skipped entirely under
 * prefers-reduced-motion, and never blocks reading the page.
 */

export type GlyphSpec = {
  text: string;
  /**
   * Where to sit, as a share of the visible area rather than fixed world units.
   * `x` is measured from the centre, so 0.42 means 84% of the way to the edge.
   *
   * The reading column is a fixed 768px in the middle of the hero and paints on
   * top, so anything behind it cannot be picked up. Everything here therefore
   * lives out in the margins, past where the text can reach: at the 1280px
   * minimum the scene runs at, the column covers the middle 60%, so nothing
   * sits closer to the centre than 0.36.
   */
  x: number;
  y: number;
  z: number;
  scale: number;
  tint: "accent" | "ink" | "pass";
};

export const GLYPHS: GlyphSpec[] = [
  // Left margin.
  { text: "</>", x: -0.4, y: 0.2, z: -0.5, scale: 1.15, tint: "accent" },
  { text: "def", x: -0.38, y: -0.26, z: 0.7, scale: 0.62, tint: "ink" },
  { text: ":=", x: -0.45, y: 0.36, z: 0.4, scale: 0.5, tint: "pass" },
  { text: "O(n)", x: -0.36, y: -0.05, z: -1.1, scale: 0.78, tint: "ink" },
  // Right margin.
  { text: "{ }", x: 0.38, y: 0.28, z: -0.9, scale: 1.05, tint: "ink" },
  { text: "[ ]", x: 0.375, y: -0.22, z: 0.5, scale: 0.9, tint: "pass" },
  { text: "[::-1]", x: 0.45, y: 0.02, z: -0.4, scale: 0.52, tint: "ink" },
  { text: "!=", x: 0.42, y: -0.36, z: 0.8, scale: 0.46, tint: "accent" },
];

/** Read the live theme tokens so the scene recolours with the rest of the page. */
function useThemeColours() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return { accent: "#e0a15c", ink: "#b0a494", pass: "#6fc48a" };
    }
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    return {
      accent: read("--accent", "#e0a15c"),
      ink: read("--text-muted", "#b0a494"),
      pass: read("--pass", "#6fc48a"),
    };
  }, []);
}

/**
 * One draggable glyph.
 *
 * Dragging projects the pointer onto the object's own depth plane, so the glyph
 * tracks the cursor exactly rather than drifting as it moves. Releasing hands it
 * back to the float, which eases it home.
 */
function Glyph({
  spec,
  colour,
  position,
}: {
  spec: GlyphSpec;
  colour: string;
  position: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const home = useMemo(() => new THREE.Vector3(...position), [position]);
  const target = useRef(new THREE.Vector3(...position));
  const { camera, size } = useThree();

  const plane = useMemo(() => new THREE.Plane(), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  useFrame((_, delta) => {
    if (!group.current) return;
    // Ease toward wherever the glyph is meant to be: the cursor while dragging,
    // its home position otherwise.
    const goal = dragging ? target.current : home;
    group.current.position.lerp(goal, 1 - Math.pow(0.001, delta));

    const scale = hovered || dragging ? spec.scale * 1.18 : spec.scale;
    const current = group.current.scale.x;
    group.current.scale.setScalar(current + (scale - current) * Math.min(delta * 8, 1));

    if (!dragging) {
      group.current.rotation.y += delta * 0.28;
    }
  });

  function handleMove(event: ThreeEvent<PointerEvent>) {
    if (!dragging || !group.current) return;
    pointer.set(
      (event.clientX / size.width) * 2 - 1,
      -(event.clientY / size.height) * 2 + 1,
    );
    // A plane facing the camera through the glyph's current depth.
    plane.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(new THREE.Vector3()).negate(),
      group.current.position,
    );
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(plane, intersection)) {
      target.current.copy(intersection);
    }
  }

  return (
    <Float
      speed={dragging ? 0 : 1.4}
      rotationIntensity={dragging ? 0 : 0.35}
      floatIntensity={dragging ? 0 : 0.75}
    >
      <group
        ref={group}
        position={position}
        scale={spec.scale}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          (event.target as Element)?.setPointerCapture?.(event.pointerId);
          target.current.copy(group.current!.position);
          setDragging(true);
          document.body.style.cursor = "grabbing";
        }}
        onPointerUp={(event) => {
          (event.target as Element)?.releasePointerCapture?.(event.pointerId);
          setDragging(false);
          document.body.style.cursor = hovered ? "grab" : "";
        }}
        onPointerMove={handleMove}
      >
        {/* An invisible slab gives the glyph a grabbable body, since text alone
            is thin and awkward to hit. */}
        <RoundedBox args={[1.5, 0.9, 0.35]} radius={0.12} visible={false}>
          <meshBasicMaterial />
        </RoundedBox>

        <Text
          font=""
          fontSize={0.72}
          color={colour}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0}
        >
          {spec.text}
        </Text>
      </group>
    </Float>
  );
}

function Scene() {
  const colours = useThemeColours();
  const { viewport } = useThree();

  // Resolve the fractions against however much space there actually is, so the
  // glyphs stay out in the margins on a 1024px laptop and a 2560px monitor
  // alike instead of drifting under the text on one of them.
  const placed = useMemo(
    () =>
      GLYPHS.map((spec) => ({
        spec,
        position: [
          spec.x * viewport.width,
          spec.y * viewport.height,
          spec.z,
        ] as [number, number, number],
      })),
    [viewport.width, viewport.height],
  );

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 5]} intensity={0.7} />
      {placed.map(({ spec, position }) => (
        <Glyph
          key={spec.text}
          spec={spec}
          colour={colours[spec.tint]}
          position={position}
        />
      ))}
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      // Hidden from the accessibility tree, but it must still receive pointer
      // events or the glyphs cannot be picked up at all. The hero copy paints
      // above this on its own layer, so the buttons keep their clicks and the
      // glyphs sit out where the text is not covering them.
      aria-hidden="true"
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <group>
        <Scene />
      </group>
    </Canvas>
  );
}
