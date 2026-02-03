"use client";

import * as React from "react";
import * as THREE from "three";

type LightPillarProps = {
  topColor?: string;
  bottomColor?: string;
  intensity?: number;
  rotationSpeed?: number;
  interactive?: boolean;
  className?: string;
  glowAmount?: number;
  pillarWidth?: number;
  pillarHeight?: number;
  noiseIntensity?: number;
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  pillarRotation?: number;
};

export default function LightPillar({
  topColor = "#4F46E5",
  bottomColor = "#22D3EE",
  intensity = 1.15,
  rotationSpeed = 0.3,
  interactive = false,
  className = "",
  glowAmount = 0.006,
  pillarWidth = 3.0,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  mixBlendMode = "screen",
  pillarRotation = 0,
}: LightPillarProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = React.useRef<THREE.ShaderMaterial | null>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const cameraRef = React.useRef<THREE.OrthographicCamera | null>(null);
  const geometryRef = React.useRef<THREE.PlaneGeometry | null>(null);

  const mouseRef = React.useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const timeRef = React.useRef<number>(0);

  const rafRef = React.useRef<number | null>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const [webGLSupported, setWebGLSupported] = React.useState(true);
  const [isRunning, setIsRunning] = React.useState(true);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const onVis = () => setIsRunning(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  React.useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) setWebGLSupported(false);
  }, []);

  React.useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => setIsVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.1 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  // ✅ Init WebGL SOLO una vez (cuando entra al viewport)
  React.useEffect(() => {
    if (!containerRef.current || !webGLSupported || !isVisible) return;

    if (rendererRef.current || materialRef.current || sceneRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        precision: "lowp",
        stencil: false,
        depth: false,
      });
    } catch {
      setWebGLSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const parseColor = (hex: string) => {
      const c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform float uIntensity;
      uniform bool uInteractive;
      uniform float uGlowAmount;
      uniform float uPillarWidth;
      uniform float uPillarHeight;
      uniform float uNoiseIntensity;
      uniform float uPillarRotation;
      varying vec2 vUv;

      const float PI = 3.141592653589793;
      const float EPSILON = 0.001;
      const float E = 2.71828182845904523536;
      const float HALF = 0.5;

      mat2 rot(float a){
        float s = sin(a);
        float c = cos(a);
        return mat2(c,-s,s,c);
      }

      float noise(vec2 coord) {
        float G = E;
        vec2 r = (G * sin(G * coord));
        return fract(r.x * r.y * (1.0 + coord.x));
      }

      vec3 applyWaveDeformation(vec3 pos, float t) {
        float f = 1.0;
        float a = 1.0;
        vec3 d = pos;
        for(float i = 0.0; i < 4.0; i++) {
          d.xz *= rot(0.4);
          float phase = t * i * 2.0;
          vec3 osc = cos(d.zxy * f - phase);
          d += osc * a;
          f *= 2.0;
          a *= HALF;
        }
        return d;
      }

      float blendMin(float a, float b, float k) {
        float sk = k * 4.0;
        float h = max(sk - abs(a - b), 0.0);
        return min(a, b) - h*h * 0.25 / sk;
      }

      float blendMax(float a, float b, float k) { return -blendMin(-a, -b, k); }

      void main() {
        vec2 fragCoord = vUv * uResolution;
        vec2 uv = (fragCoord * 2.0 - uResolution) / uResolution.y;

        float rotAngle = uPillarRotation * PI / 180.0;
        uv *= rot(rotAngle);

        vec3 origin = vec3(0.0, 0.0, -10.0);
        vec3 dir = normalize(vec3(uv, 1.0));

        float maxDepth = 50.0;
        float depth = 0.1;

        mat2 rotX = rot(uTime * 0.3);
        if (uInteractive && length(uMouse) > 0.0) {
          rotX = rot(uMouse.x * PI * 2.0);
        }

        vec3 color = vec3(0.0);

        for(float i = 0.0; i < 100.0; i++) {
          vec3 pos = origin + dir * depth;
          pos.xz *= rotX;

          vec3 def = pos;
          def.y *= uPillarHeight;
          def = applyWaveDeformation(def + vec3(0.0, uTime, 0.0), uTime);

          vec2 cosinePair = cos(def.xz);
          float fd = length(cosinePair) - 0.2;

          float radial = length(pos.xz) - uPillarWidth;
          fd = blendMax(radial, fd, 1.0);
          fd = abs(fd) * 0.15 + 0.01;

          vec3 grad = mix(uBottomColor, uTopColor, smoothstep(15.0, -15.0, pos.y));
          color += grad * pow(1.0 / fd, 1.0);

          if (fd < EPSILON || depth > maxDepth) break;
          depth += fd;
        }

        float norm = uPillarWidth / 3.0;
        color = tanh(color * uGlowAmount / norm);

        float rnd = noise(gl_FragCoord.xy);
        color -= rnd / 15.0 * uNoiseIntensity;

        gl_FragColor = vec4(color * uIntensity, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: mouseRef.current },
        uTopColor: { value: parseColor(topColor) },
        uBottomColor: { value: parseColor(bottomColor) },
        uIntensity: { value: intensity },
        uInteractive: { value: interactive },
        uGlowAmount: { value: glowAmount },
        uPillarWidth: { value: pillarWidth },
        uPillarHeight: { value: pillarHeight },
        uNoiseIntensity: { value: noiseIntensity },
        uPillarRotation: { value: pillarRotation },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    geometryRef.current = geometry;

    scene.add(new THREE.Mesh(geometry, material));

    // mouse (si interactive)
    let mouseMoveTimeout: number | null = null;
    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      if (mouseMoveTimeout) return;

      mouseMoveTimeout = window.setTimeout(() => (mouseMoveTimeout = null), 16);

      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y2 = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(x, y2);
    };

    if (interactive) container.addEventListener("mousemove", handleMouseMove, { passive: true });

    // resize
    let resizeTimeout: number | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (!rendererRef.current || !materialRef.current || !containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        rendererRef.current.setSize(w, h);
        materialRef.current.uniforms.uResolution.value.set(w, h);
      }, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (interactive) container.removeEventListener("mousemove", handleMouseMove);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }

      materialRef.current?.dispose();
      geometryRef.current?.dispose();

      rendererRef.current = null;
      materialRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      geometryRef.current = null;
      rafRef.current = null;
    };
  }, [webGLSupported, isVisible]);

  // ✅ Actualiza uniforms sin recrear WebGL
  React.useEffect(() => {
    if (!materialRef.current) return;

    const parseColor = (hex: string) => {
      const c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    };

    const u = materialRef.current.uniforms;

    u.uTopColor.value = parseColor(topColor);
    u.uBottomColor.value = parseColor(bottomColor);
    u.uIntensity.value = intensity;
    u.uInteractive.value = interactive;
    u.uGlowAmount.value = glowAmount;
    u.uPillarWidth.value = pillarWidth;
    u.uPillarHeight.value = pillarHeight;
    u.uNoiseIntensity.value = noiseIntensity;
    u.uPillarRotation.value = pillarRotation;
  }, [topColor, bottomColor, intensity, interactive, glowAmount, pillarWidth, pillarHeight, noiseIntensity, pillarRotation]);

  // Loop (igual, con pausa por visibilidad)
  React.useEffect(() => {
    if (!isVisible || !isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const fps = 30;
    const frameTime = 1000 / fps;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (!materialRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      const delta = currentTime - lastTime;
      if (delta >= frameTime) {
        timeRef.current += 0.016 * rotationSpeed;
        materialRef.current.uniforms.uTime.value = timeRef.current;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        lastTime = currentTime - (delta % frameTime);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isVisible, isRunning, rotationSpeed]);

  if (!webGLSupported) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center text-white/50 ${className}`}
        style={{ mixBlendMode }}
      >
        WebGL no soportado
      </div>
    );
  }

  return <div ref={containerRef} className={`absolute inset-0 ${className}`} style={{ mixBlendMode }} />;
}
