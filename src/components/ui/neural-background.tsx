"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface NeuralBackgroundProps {
  particleCount?: number;
  color?: string;
  accentColor?: string;
  interactive?: boolean;
}

export function NeuralBackground({
  particleCount = 120,
  color = "#6366f1",
  accentColor = "#a78bfa",
  interactive = true,
}: NeuralBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Particles
    const positions: number[] = [];
    const velocities: THREE.Vector3[] = [];
    const particleData: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 4;
      positions.push(x, y, z);
      particleData.push({ x, y, z });
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.002
        )
      );
    }

    const geometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(positions);
    geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.035,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Lines geometry (connections between nearby particles)
    const lineGeometry = new THREE.BufferGeometry();
    const maxConnections = particleCount * 4;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    lineGeometry.setDrawRange(0, 0);
    lineGeometry.computeBoundingSphere();

    const lineMaterial = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(lineMaterial);

    // Mouse interaction
    const mouse = new THREE.Vector2(9999, 9999);
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    const primaryColor = new THREE.Color(color);
    const accentCol = new THREE.Color(accentColor);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const positions3 = geometry.attributes.position.array as Float32Array;
      let lineVertexCount = 0;

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;

        // Update position
        particleData[i].x += velocities[i].x;
        particleData[i].y += velocities[i].y;
        particleData[i].z += velocities[i].z;

        // Bounce off walls
        if (Math.abs(particleData[i].x) > 6) velocities[i].x *= -1;
        if (Math.abs(particleData[i].y) > 4) velocities[i].y *= -1;
        if (Math.abs(particleData[i].z) > 2) velocities[i].z *= -1;

        // Mouse repulsion
        if (interactive) {
          const dx = particleData[i].x / 6 - mouse.x;
          const dy = particleData[i].y / 4 - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.3) {
            particleData[i].x += dx * 0.03;
            particleData[i].y += dy * 0.03;
          }
        }

        positions3[ix] = particleData[i].x;
        positions3[ix + 1] = particleData[i].y;
        positions3[ix + 2] = particleData[i].z;

        // Draw connections
        for (let j = i + 1; j < particleCount; j++) {
          const jx = j * 3;
          const dx = particleData[i].x - particleData[j].x;
          const dy = particleData[i].y - particleData[j].y;
          const dz = particleData[i].z - particleData[j].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 2.2 && lineVertexCount < maxConnections) {
            const alpha = 1 - dist / 2.2;
            const col = alpha > 0.5 ? primaryColor : accentCol;

            linePositions[lineVertexCount * 6] = particleData[i].x;
            linePositions[lineVertexCount * 6 + 1] = particleData[i].y;
            linePositions[lineVertexCount * 6 + 2] = particleData[i].z;
            linePositions[lineVertexCount * 6 + 3] = particleData[j].x;
            linePositions[lineVertexCount * 6 + 4] = particleData[j].y;
            linePositions[lineVertexCount * 6 + 5] = particleData[j].z;

            lineColors[lineVertexCount * 6] = col.r * alpha;
            lineColors[lineVertexCount * 6 + 1] = col.g * alpha;
            lineColors[lineVertexCount * 6 + 2] = col.b * alpha;
            lineColors[lineVertexCount * 6 + 3] = col.r * alpha;
            lineColors[lineVertexCount * 6 + 4] = col.g * alpha;
            lineColors[lineVertexCount * 6 + 5] = col.b * alpha;

            lineVertexCount++;
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineVertexCount * 2);

      // Slow rotation
      particles.rotation.y += 0.0003;
      lineMaterial.rotation.y += 0.0003;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [particleCount, color, accentColor, interactive]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
