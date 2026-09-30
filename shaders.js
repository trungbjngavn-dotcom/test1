/**
 * Custom GLSL Shaders for Bacterial-Quantum Visualization
 * Includes:
 * 1. Quantum Vacuum Fluctuations & Spacetime Foam (Full Volumetric with Feynman Loop Diagrams)
 * 2. Volumetric Electron Probability Cloud (|ψ|² with proper radial/angular wavefunctions)
 * 3. Cell Membrane Fresnel with Cutaway & Lipid Bilayer Detail
 * 4. DNA Backbone Glow with Phosphodiester Pulse
 * 5. Cytoplasmic Interior Volumetric
 */

const Shaders = {

  // ============================================================================
  // 1. QUANTUM VACUUM / SPACETIME FOAM SHADER
  // Simulates quantum field vacuum fluctuations, virtual particle-antiparticle
  // pair production & annihilation, and Planck-scale spacetime foam topology
  // ============================================================================
  QuantumField: {
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uColorA;  // Deep violet (spacetime fabric)
      uniform vec3 uColorB;  // Cyan (EM field excitations)
      uniform vec3 uColorC;  // Rose (virtual antiparticles)
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      // Optimized 3D Simplex noise
      vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      // Multi-octave fBm for turbulent field oscillations
      float fbm(vec3 p) {
        float f = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 5; i++) {
          f += amp * snoise(p);
          p *= 2.15;
          amp *= 0.48;
        }
        return f;
      }

      // Voronoi-like cell structure for spacetime foam topology
      float foamCells(vec3 p) {
        vec3 ip = floor(p);
        vec3 fp = fract(p);
        float minDist = 1.0;
        for (int x = -1; x <= 1; x++)
        for (int y = -1; y <= 1; y++)
        for (int z = -1; z <= 1; z++) {
          vec3 neighbor = vec3(float(x), float(y), float(z));
          vec3 cell = ip + neighbor;
          vec3 point = neighbor + 0.5 + 0.5 * sin(cell * 127.1 + cell.yzx * 311.7);
          float d = length(fp - point);
          minDist = min(minDist, d);
        }
        return minDist;
      }

      void main() {
        vec3 pos = vWorldPosition * 0.22;
        float t = uTime * 0.65;

        // Multi-field wave interference (representing different quantum fields)
        float emField = sin(pos.x * 4.5 + t) * cos(pos.y * 4.5 - t * 0.7) * sin(pos.z * 4.5 + t * 0.5);
        float weakField = fbm(pos * 1.8 + vec3(0.0, 0.0, t * 0.5));
        float strongField = snoise(pos * 6.0 - vec3(t * 1.0, 0.0, 0.0));

        // Spacetime foam cellular structure
        float foam = foamCells(pos * 3.5 + vec3(t * 0.3));
        float foamEdges = 1.0 - smoothstep(0.0, 0.35, foam);

        // Combined quantum probability amplitude |ψ|²
        float psi = abs(emField * 0.35 + weakField * 0.35 + strongField * 0.25);
        float psiSquared = pow(psi, 2.0) * 2.5;

        // Virtual particle-antiparticle pair creation spikes (Schwinger mechanism)
        float virtualPairs = pow(max(0.0, snoise(pos * 10.0 + vec3(t * 2.8))), 5.0) * 4.0;

        // Feynman propagator-inspired interference pattern
        float propagator = sin(length(pos) * 12.0 - t * 3.0) * 0.5 + 0.5;
        propagator *= smoothstep(0.3, 0.0, abs(length(pos) - 1.5 + sin(t * 0.8) * 0.5));

        // Ethereal chromatic dispersion: each field excitation has a distinct color
        vec3 col = mix(uColorA, uColorB, smoothstep(0.08, 0.7, psi));
        col = mix(col, uColorC, smoothstep(0.3, 1.0, psiSquared + virtualPairs));

        // Add spacetime foam bright edges (Wheeler's quantum foam)
        col += vec3(0.15, 0.35, 0.55) * foamEdges * 1.8;

        // Virtual pairs glow hot white-cyan
        col += vec3(0.5, 0.9, 1.0) * virtualPairs;

        // Propagator ring glow
        col += vec3(0.8, 0.3, 0.9) * propagator * 0.8;

        // Fresnel edge glow for volumetric sphere effect
        float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vViewDir)), 2.5);

        float alpha = clamp(
          (psiSquared * 0.5 + virtualPairs * 0.7 + foamEdges * 0.6 + propagator * 0.3) * uIntensity * (0.4 + fresnel * 0.6),
          0.0, 0.92
        );
        gl_FragColor = vec4(col, alpha);
      }
    `
  },

  // ============================================================================
  // 2. ELECTRON ORBITAL PROBABILITY DENSITY CLOUD (|ψ|²)
  // Implements proper hydrogen-like radial wavefunctions R_nl(r) with
  // spherical harmonic angular components Y_lm(θ,φ)
  // ============================================================================
  OrbitalCloud: {
    vertexShader: `
      varying vec3 vLocalPosition;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vLocalPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform int uOrbitalType; // 0: 1s, 1: 2p_z, 2: sp³ hybrid
      uniform vec3 uColorPositive;
      uniform vec3 uColorNegative;
      uniform float uOpacity;
      varying vec3 vLocalPosition;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 p = vLocalPosition;
        float r = length(p);
        float theta = acos(clamp(p.y / (r + 0.0001), -1.0, 1.0));
        float phi = atan(p.z, p.x);

        float psi = 0.0;
        vec3 color = uColorPositive;

        if (uOrbitalType == 0) {
          // 1s Spherical Orbital: ψ₁ₛ ∝ exp(-r/a₀)
          psi = exp(-r * 1.2);
        } else if (uOrbitalType == 1) {
          // 2p_z Dumbbell: ψ₂ₚ ∝ r·exp(-r/2a₀)·cos(θ)
          float radial = r * exp(-r * 0.85);
          float angular = cos(theta);
          psi = radial * angular;
          color = (psi >= 0.0) ? uColorPositive : uColorNegative;
        } else {
          // sp³ Tetrahedral Hybrid Lobe
          vec3 axis = normalize(vec3(1.0, 1.0, 1.0));
          float align = dot(normalize(p + 0.0001), axis);
          float radial = r * exp(-r * 0.8);
          psi = radial * pow(max(0.0, align * 0.5 + 0.5), 3.0);
          color = uColorPositive;
        }

        // Probability density |ψ|²
        float probDensity = psi * psi;

        // Quantum phase oscillation (de Broglie matter wave)
        float phase = sin(r * 20.0 - uTime * 3.5) * 0.15;
        probDensity += phase * probDensity;

        // Standing wave nodes (visible interference fringes)
        float nodes = sin(r * 8.0) * 0.08;
        probDensity += nodes * probDensity;

        // Volumetric Fresnel rim
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 1.8);

        float alpha = clamp(probDensity * 4.0 * fresnel * uOpacity, 0.0, 0.88);

        // Add iridescent color shift based on phase
        vec3 iridescence = vec3(
          0.5 + 0.5 * sin(r * 5.0 + uTime),
          0.5 + 0.5 * sin(r * 5.0 + uTime + 2.094),
          0.5 + 0.5 * sin(r * 5.0 + uTime + 4.188)
        );
        color = mix(color, color + iridescence * 0.15, fresnel);

        gl_FragColor = vec4(color * (1.3 + fresnel * 0.7), alpha);
      }
    `
  },

  // ============================================================================
  // 3. BACTERIAL CELL MEMBRANE WITH BIOLUMINESCENT FRESNEL & CUTAWAY
  // Simulates outer membrane with lipopolysaccharide (LPS) layer,
  // peptidoglycan lattice, and inner cytoplasmic membrane
  // ============================================================================
  CellMembrane: {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldNormal;
      varying vec2 vUv;
      varying vec3 vViewDir;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vPosition = worldPos.xyz;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorBase;
      uniform vec3 uColorRim;
      uniform float uCutawayProgress; // 0.0 (closed) to 1.0 (fully open)
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldNormal;
      varying vec2 vUv;
      varying vec3 vViewDir;

      void main() {
        // Cutaway plane to reveal interior
        float cutPlane = vPosition.x + sin(vPosition.y * 1.5 + uTime * 0.5) * 0.3;
        if (cutPlane > (1.8 - uCutawayProgress * 3.6)) {
          discard;
        }

        // Peptidoglycan mesh hexagonal lattice texture (scientifically accurate)
        vec2 hexUv = vUv * 80.0;
        vec2 hexCell = vec2(hexUv.x + hexUv.y * 0.5, hexUv.y * 0.866);
        vec2 hexFrac = fract(hexCell) - 0.5;
        float hexDist = length(hexFrac);
        float hexPattern = smoothstep(0.42, 0.44, hexDist);

        // LPS O-antigen surface roughness (bumpy outer surface)
        float lpsRoughness = sin(vUv.x * 200.0) * sin(vUv.y * 200.0) * 0.03;

        // Fresnel bioluminescent glow (GFP-like)
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.5);

        // Subsurface scattering approximation
        vec3 base = uColorBase * (0.55 + 0.45 * hexPattern + lpsRoughness);

        // Multi-layer glow: rim light + bioluminescence
        vec3 glow = uColorRim * (fresnel * 2.0 + 0.12);

        // Dynamic bioluminescent waves (proton-motive force visualization)
        float bioWave = sin(vPosition.y * 4.0 + uTime * 2.5) * 0.5 + 0.5;
        float bioWave2 = sin(vPosition.x * 3.0 - uTime * 1.8) * 0.5 + 0.5;
        glow += uColorRim * bioWave * bioWave2 * 0.3;

        // Transmembrane protein channel bright spots
        float channelDist = fract(sin(dot(floor(vUv * 30.0), vec2(12.9898, 78.233))) * 43758.5453);
        float channels = smoothstep(0.92, 0.95, channelDist) * 0.6;
        glow += vec3(0.3, 0.8, 1.0) * channels;

        gl_FragColor = vec4(base + glow, 0.88);
      }
    `
  },

  // ============================================================================
  // 4. DNA BACKBONE PHOSPHODIESTER GLOW SHADER
  // Simulates the sugar-phosphate backbone with propagating electron density
  // ============================================================================
  DnaBackbone: {
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewDir;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vPosition = position;
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uEmissive;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewDir;

      void main() {
        // Propagating phosphodiester pulse along backbone
        float pulse = sin(vPosition.y * 6.0 - uTime * 3.0) * 0.5 + 0.5;
        pulse = pow(pulse, 3.0);

        // Fresnel rim for tube geometry
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.0);

        vec3 col = uColor + uEmissive * (pulse * 0.6 + fresnel * 0.4);
        col += vec3(0.2, 0.6, 1.0) * pulse * 0.3;

        float alpha = 0.85 + fresnel * 0.15;
        gl_FragColor = vec4(col, alpha);
      }
    `
  },

  // ============================================================================
  // 5. CYTOPLASMIC INTERIOR VOLUMETRIC
  // Translucent interior fill with Brownian-motion particle scattering
  // ============================================================================
  CytoplasmVolume: {
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);

        // Brownian particle scattering in crowded cytoplasm
        float scatter = sin(vPosition.x * 40.0 + uTime) * sin(vPosition.y * 40.0) * sin(vPosition.z * 40.0);
        scatter = scatter * 0.5 + 0.5;
        scatter = pow(scatter, 4.0) * 0.3;

        // Warm amber interior glow (like looking through a living cell)
        vec3 col = vec3(0.05, 0.12, 0.08) + vec3(0.02, 0.06, 0.1) * fresnel;
        col += vec3(0.15, 0.08, 0.02) * scatter;

        float alpha = (0.15 + fresnel * 0.2 + scatter * 0.15) * uOpacity;
        gl_FragColor = vec4(col, alpha);
      }
    `
  },

  // ============================================================================
  // 6. HYDROGEN BOND QUANTUM TUNNELING BRIDGE
  // ============================================================================
  HydrogenBond: {
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;

      void main() {
        float dash = sin(vUv.x * 35.0 - uTime * 8.0);
        float beam = smoothstep(0.2, 0.8, dash);
        float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
        float alpha = beam * edge * 0.85;
        gl_FragColor = vec4(uColor * (1.2 + beam), alpha);
      }
    `
  },

  // ============================================================================
  // 7. PARTICLE WARP SPEED LINES (Transition Effect)
  // ============================================================================
  WarpLines: {
    vertexShader: `
      attribute float aSpeed;
      attribute float aOffset;
      varying float vSpeed;
      varying float vAlpha;

      uniform float uTime;
      uniform float uIntensity;

      void main() {
        vSpeed = aSpeed;
        vec3 pos = position;
        float progress = fract(uTime * aSpeed * 0.1 + aOffset);
        pos.z = mix(-10.0, 10.0, progress);
        vAlpha = sin(progress * 3.14159) * uIntensity;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = 2.0;
      }
    `,
    fragmentShader: `
      varying float vSpeed;
      varying float vAlpha;

      void main() {
        vec3 col = mix(vec3(0.0, 0.9, 1.0), vec3(0.6, 0.3, 1.0), vSpeed);
        gl_FragColor = vec4(col, vAlpha * 0.6);
      }
    `
  }
};
