"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

// CSS variable token and color parsing (hex/rgba/var())
const cssVariableRegex = /var\s*\(\s*(--[\w-]+)(?:\s*,\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*))?\s*\)/;

function extractDefaultValue(cssVar: string): string {
  if (!cssVar || !cssVar.startsWith("var(")) return cssVar;
  const match = cssVariableRegex.exec(cssVar);
  if (!match) return cssVar;
  const fallback = (match[2] || "").trim();
  if (fallback.startsWith("var(")) return extractDefaultValue(fallback);
  return fallback || cssVar;
}

function resolveTokenColor(input: string | undefined): string {
  if (typeof input !== "string") return "";
  if (!input.startsWith("var(")) return input;
  return extractDefaultValue(input);
}

function parseColorToRgba(input: string): { r: number; g: number; b: number; a: number } {
  if (!input) return { r: 0, g: 0, b: 0, a: 0 };
  const str = input.trim();
  const rgbaMatch = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (rgbaMatch) {
    const r = Math.max(0, Math.min(255, parseFloat(rgbaMatch[1]))) / 255;
    const g = Math.max(0, Math.min(255, parseFloat(rgbaMatch[2]))) / 255;
    const b = Math.max(0, Math.min(255, parseFloat(rgbaMatch[3]))) / 255;
    const a = rgbaMatch[4] !== undefined ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4]))) : 1;
    return { r, g, b, a };
  }
  const hex = str.replace(/^#/, "");
  if (hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: parseInt(hex.slice(6, 8), 16) / 255,
    };
  }
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: 1,
    };
  }
  if (hex.length === 4) {
    return {
      r: parseInt(hex[0] + hex[0], 16) / 255,
      g: parseInt(hex[1] + hex[1], 16) / 255,
      b: parseInt(hex[2] + hex[2], 16) / 255,
      a: parseInt(hex[3] + hex[3], 16) / 255,
    };
  }
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16) / 255,
      g: parseInt(hex[1] + hex[1], 16) / 255,
      b: parseInt(hex[2] + hex[2], 16) / 255,
      a: 1,
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

// UI → shader mapping helpers for better property control UX
function mapLinear(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

// Speed: UI [0.1..1] → internal [0.1..5]
function mapSpeedUiToInternal(ui: number): number {
  return mapLinear(ui, 0.1, 1, 0.1, 5);
}

// Thickness: UI [0.1..1] → internal [0.01..0.2]
function mapThicknessUiToInternal(ui: number): number {
  return mapLinear(ui, 0.1, 1, 0.01, 0.2);
}

// Distortion: UI [0..1] → internal [0..0.2]
function mapDistortionUiToInternal(ui: number): number {
  return mapLinear(ui, 0, 1, 0, 0.2);
}

// Frequency: UI [0.1..1] → internal [0.1..3]
function mapFrequencyUiToInternal(ui: number): number {
  return mapLinear(ui, 0.1, 1, 0.1, 3);
}

// Amplitude: UI [0.1..1] → internal [0.1..2]
function mapAmplitudeUiToInternal(ui: number): number {
  return mapLinear(ui, 0.1, 1, 0.1, 2);
}

type Props = {
  speed?: number;
  beamThickness?: number;
  distortion?: number;
  xScale?: number; // frequency
  yScale?: number; // amplitude
  glow?: number;
  backgroundColor?: string;
  className?: string;
};

export default function WavePrism({
  speed = 0.2,
  beamThickness = 0.5,
  distortion = 0.25,
  xScale = 0.5,
  yScale = 0.3,
  glow = 1,
  backgroundColor,
  className = "",
}: Props) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: any;
    camera: any;
    renderer: any;
    mesh: any;
    uniforms: any;
    animationId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  });
  const speedRef = useRef(mapSpeedUiToInternal(speed));
  
  // Adjust effect intensity based on theme (much more visible in light mode)
  const themeOpacity = theme === 'dark' ? 0.5 : 1.0;
  const themeGlow = theme === 'dark' ? glow * 0.9 : glow * 10.5;
  const themeBeamThickness = theme === 'dark' ? beamThickness : beamThickness * 1.5;

  useEffect(() => {
    // Dynamically import Three.js
    let cleanupFn: (() => void) | null = null;
    let mounted = true;
    
    const initThree = async () => {
      if (!mounted) return;
      try {
        const THREE = await import("three");
        
        if (!canvasRef.current || !containerRef.current) {
          console.warn("WavePrism: Canvas or container ref not available");
          return;
        }
      
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      // Ensure canvas fills the component bounds
      const containerWidth = container.clientWidth || window.innerWidth;
      const containerHeight = container.clientHeight || window.innerHeight;
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.zIndex = "0";

      const { current: refs } = sceneRef;

      const vertexShader = `
        attribute vec3 position;
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        uniform float xScale;
        uniform float yScale;
        uniform float yOffset;
        uniform float distortion;
        uniform float beamThickness;
        uniform float glow;

        void main() {
          vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
          
          float d = length(p) * distortion;
          
          float rx = p.x * (1.0 + d);
          float gx = p.x;
          float bx = p.x * (1.0 - d);
          
          float r = beamThickness / abs((p.y + yOffset) + sin((rx + time) * xScale) * yScale);
          float g = beamThickness / abs((p.y + yOffset) + sin((gx + time) * xScale) * yScale);
          float b = beamThickness / abs((p.y + yOffset) + sin((bx + time) * xScale) * yScale);
          
          vec3 wave = vec3(r, g, b);
          float haloCap = 2.0;
          vec3 halo = min(wave, vec3(haloCap));
          vec3 core = wave - halo;
          vec3 col = clamp(core + halo * glow, 0.0, 1.0);
          
          // Increase alpha for better visibility, especially in light mode
          float outAlpha = clamp(max(max(col.r, col.g), col.b) / 1.1, 0.0, 1.0);
          gl_FragColor = vec4(col, outAlpha);
        }
      `;

      const initScene = () => {
        refs.scene = new THREE.Scene();
        refs.renderer = new THREE.WebGLRenderer({
          canvas,
          preserveDrawingBuffer: true,
          antialias: false,
          alpha: true,
        });
        refs.renderer.setPixelRatio(window.devicePixelRatio);
        refs.renderer.setClearColor(new THREE.Color(0, 0, 0), 0);
        refs.renderer.setScissorTest(false);

        refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

        refs.uniforms = {
          resolution: { value: [1, 1] },
          time: { value: 0 },
          xScale: { value: mapFrequencyUiToInternal(xScale) },
          yScale: { value: mapAmplitudeUiToInternal(yScale) },
          distortion: { value: mapDistortionUiToInternal(distortion) },
          yOffset: { value: -0.3 },
          beamThickness: { value: mapThicknessUiToInternal(themeBeamThickness) },
          glow: { value: themeGlow },
        };

        const position = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
        const positions = new THREE.BufferAttribute(new Float32Array(position), 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", positions);

        const material = new THREE.RawShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: refs.uniforms,
          side: THREE.DoubleSide,
        });

        refs.mesh = new THREE.Mesh(geometry, material);
        refs.scene.add(refs.mesh);

        handleResize();
      };

      const handleResize = () => {
        if (!refs.renderer || !refs.uniforms || !container || !canvas) return;
        
        const cw = container.clientWidth || window.innerWidth || 1;
        const ch = container.clientHeight || window.innerHeight || 1;
        
        canvas.width = cw;
        canvas.height = ch;
        refs.renderer.setSize(cw, ch, false);
        refs.uniforms.resolution.value = [cw, ch];
        refs.uniforms.yOffset.value = -0.3;
        
        if (refs.scene && refs.camera) {
          refs.renderer.render(refs.scene, refs.camera);
        }
      };

      initScene();
      window.addEventListener("resize", handleResize);

      // Animation loop
      const animate = () => {
        if (!mounted) return;
        if (refs.uniforms) {
          refs.uniforms.time.value += 0.01 * speedRef.current;
        }
        if (refs.renderer && refs.scene && refs.camera) {
          refs.renderer.render(refs.scene, refs.camera);
        }
        refs.animationId = requestAnimationFrame(animate);
      };
      animate();
      
      console.log("WavePrism: Initialized successfully");

      cleanupFn = () => {
        if (refs.animationId) {
          cancelAnimationFrame(refs.animationId);
          refs.animationId = null;
        }
        window.removeEventListener("resize", handleResize);
        if (refs.mesh) {
          refs.scene?.remove(refs.mesh);
          refs.mesh.geometry.dispose();
          if (refs.mesh.material instanceof THREE.Material) {
            refs.mesh.material.dispose();
          }
        }
        refs.renderer?.dispose();
      };
      } catch (error) {
        console.error("WavePrism: Error initializing", error);
      }
    };

    initThree();
    
    return () => {
      mounted = false;
      if (cleanupFn) cleanupFn();
      const { current: refs } = sceneRef;
      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
        refs.animationId = null;
      }
    };
  }, []);

  // Update uniforms when props or theme change
  useEffect(() => {
    const { current: refs } = sceneRef;
    if (refs.uniforms) {
      // Recalculate theme-dependent values
      const currentThemeGlow = theme === 'dark' ? glow * 0.9 : glow * 10.5;
      const currentThemeBeamThickness = theme === 'dark' ? beamThickness : beamThickness * 1.5;
      
      refs.uniforms.xScale.value = mapFrequencyUiToInternal(xScale);
      refs.uniforms.yScale.value = mapAmplitudeUiToInternal(yScale);
      refs.uniforms.distortion.value = mapDistortionUiToInternal(distortion);
      refs.uniforms.yOffset.value = -0.3;
      refs.uniforms.beamThickness.value = mapThicknessUiToInternal(currentThemeBeamThickness);
      refs.uniforms.glow.value = currentThemeGlow;
    }
  }, [speed, beamThickness, distortion, xScale, yScale, glow, theme]);
  
  // Separate effect to update container opacity when theme changes
  useEffect(() => {
    if (containerRef.current) {
      const currentOpacity = theme === 'dark' ? 0.5 : 1.0;
      containerRef.current.style.opacity = currentOpacity.toString();
    }
  }, [theme]);

  // Update speed ref when speed prop changes
  useEffect(() => {
    speedRef.current = mapSpeedUiToInternal(speed);
  }, [speed]);

  const resolvedBackgroundColor = typeof backgroundColor === "string" ? resolveTokenColor(backgroundColor) : "";

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden pointer-events-none ${className}`}
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        display: "block",
        margin: 0,
        padding: 0,
        background: resolvedBackgroundColor || "transparent",
        zIndex: -10,
        opacity: themeOpacity,
        transition: "opacity 0.3s ease",
      }}
      aria-hidden
    >
      <canvas 
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
