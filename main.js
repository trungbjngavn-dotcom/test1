/**
 * Main Controller: Bacterial-to-Quantum Zoom Experience
 * Orchestrates 3D rendering, logarithmic scale navigation, cinematic intro,
 * warp speed transition effects, HUD telemetry, and user input interactions.
 */

// Scale Stage Constants
const SCALE_STAGES = [
  {
    id: 0,
    progress: 0.05,
    name: "1. BACTERIUM",
    shortName: "Cell",
    metric: "1.0 × 10⁻⁶ m (1 µm)",
    category: "Cellular Scale • 10⁻⁶ m",
    title: "Bacterial Cell Envelope",
    comparison: "Size of standard rod-shaped bacillus (E. coli)",
    specs: {
      "Length": "4.2 µm",
      "Diameter": "1.1 µm",
      "Envelope": "Peptidoglycan + LPS",
      "Motility": "Peritrichous Flagella"
    },
    equation: "v_d ≈ μ · E  (Proton-Motive Drift)",
    body: "A self-contained biological engine enclosed by a peptidoglycan cell wall and outer lipopolysaccharide membrane. Helical flagella rotate at 20,000 RPM driven by transmembrane proton-motive force, propelling the cell through viscous fluid drag at Reynolds number ~10⁻⁵.",
    scaleColor: "#00f0ff"
  },
  {
    id: 1,
    progress: 0.28,
    name: "2. NUCLEOID",
    shortName: "Nucleoid",
    metric: "1.0 × 10⁻⁷ m (100 nm)",
    category: "Macromolecular Scale • 10⁻⁷ m",
    title: "Cytoplasm & Nucleoid Architecture",
    comparison: "10× magnification into the teeming interior",
    specs: {
      "Crowding": "350 mg/mL",
      "Ribosomes": "70S (50S + 30S)",
      "Chromosome": "Supercoiled DNA",
      "Chaperones": "GroEL / GroES"
    },
    equation: "⟨r²⟩ = 6Dt  (Brownian Diffusion)",
    body: "Dense macromolecular crowding where 30% of cell volume is occupied by 70S ribosomes synthesizing polypeptides from mRNA transcripts. The circular bacterial chromosome forms a phase-separated nucleoid of supercoiled plectonemic loops anchored by HU and H-NS proteins.",
    scaleColor: "#38bdf8"
  },
  {
    id: 2,
    progress: 0.52,
    name: "3. DNA HELIX",
    shortName: "DNA",
    metric: "2.0 × 10⁻⁹ m (2 nm)",
    category: "Nanoscale Genetic Code • 10⁻⁹ m",
    title: "B-DNA Double Helix",
    comparison: "500× magnification into the genetic blueprint",
    specs: {
      "Diameter": "2.0 nm",
      "Pitch": "3.4 nm / turn",
      "Base Pairs": "10.5 bp / turn",
      "H-Bonds": "A-T (2) | G-C (3)"
    },
    equation: "E_hb ≈ 20 kJ/mol  |  ΔG_duplex < 0",
    body: "The blueprint of life: two antiparallel deoxyribose-phosphate backbones intertwined with major (2.2 nm) and minor (1.2 nm) grooves. Purines (Adenine, Guanine) pair with Pyrimidines (Thymine, Cytosine) via quantum hydrogen bonding with remarkable fidelity.",
    scaleColor: "#a855f7"
  },
  {
    id: 3,
    progress: 0.75,
    name: "4. ATOMIC ORBITALS",
    shortName: "Atoms",
    metric: "1.0 × 10⁻¹⁰ m (1 Å = 0.1 nm)",
    category: "Atomic Scale • 10⁻¹⁰ m",
    title: "Atomic Orbitals & Electron Clouds",
    comparison: "10,000× magnification into chemical bonds",
    specs: {
      "Orbitals": "2p_z & sp³ Hybrids",
      "Density": "|ψ(r)|² Probability",
      "Nucleus": "10⁻¹⁴ m Core",
      "Void": "99.9999999% Empty"
    },
    equation: "iℏ(∂ψ/∂t) = Ĥψ  (Schrödinger Wave)",
    body: "Solid matter dissolves into quantum probability density clouds |ψ|². Electrons are not localized billiard balls, but standing de Broglie wave harmonics. At center sits the atomic nucleus, 10,000 times smaller than the atom, held by the strong nuclear force.",
    scaleColor: "#00f5a0"
  },
  {
    id: 4,
    progress: 0.95,
    name: "5. QUANTUM FOAM",
    shortName: "Planck",
    metric: "1.6 × 10⁻³⁵ m (Planck Length)",
    category: "Fundamental Planck Scale • 10⁻³⁵ m",
    title: "Quantum Vacuum & Spacetime Foam",
    comparison: "The foundational bedrock of physical reality",
    specs: {
      "Vacuum": "Zero-Point Energy",
      "Pairs": "Virtual e⁺e⁻ Loops",
      "Planck Time": "5.39 × 10⁻⁴⁴ s",
      "QFT": "Gauge Field Manifold"
    },
    equation: "ΔE · Δt ≥ ℏ/2  |  ℓ_P = √(ℏG/c³)",
    body: "At the Planck threshold, the smooth continuum of spacetime tears into quantum foam. Virtual particle-antiparticle pairs spontaneously boil in and out of the vacuum. All matter — the DNA helix, the bacterial cell — are emergent harmonic ripples in fundamental quantum fields.",
    scaleColor: "#ff0055"
  }
];

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.canvas = document.getElementById('webgl-canvas');

    // Zoom State: progress 0.0 (Cell) to 1.0 (Quantum foam)
    this.currentZoom = 0.05;
    this.targetZoom = 0.05;
    this.isPlayingTour = false; // Start paused (intro overlay first)
    this.tourSpeed = 1.0;
    this.lastTime = performance.now();
    this.introActive = true;
    this.lastStageId = 0;
    this.prevZoomSpeed = 0;

    this._initThree();
    this._initPostProcessing();
    this._initScales();
    this._initHUD();
    this._initAnnotations();
    this._initIntro();
    this._initEventListeners();

    // Start render loop
    this._animate();
  }

  /* =========================================================================
   * CINEMATIC INTRO OVERLAY
   * ========================================================================= */
  _initIntro() {
    this.introOverlay = document.getElementById('intro-overlay');
    const startBtn = document.getElementById('start-btn');
    const particlesContainer = document.getElementById('intro-particles');

    // Create floating particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'intro-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (3 + Math.random() * 5) + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.width = (1 + Math.random() * 2) + 'px';
      particle.style.height = particle.style.width;
      particle.style.opacity = 0.3 + Math.random() * 0.5;
      particlesContainer.appendChild(particle);
    }

    const dismissIntro = () => {
      if (!this.introActive) return;
      this.introActive = false;
      this.introOverlay.classList.add('hidden');

      // Reveal HUD elements with stagger
      setTimeout(() => {
        document.getElementById('hud-header').classList.add('visible');
        document.getElementById('scale-telemetry').classList.add('visible');
        document.getElementById('hud-top-right').classList.add('visible');
      }, 200);
      setTimeout(() => {
        document.getElementById('depth-indicator').classList.add('visible');
        document.getElementById('info-card').classList.add('visible');
        document.getElementById('sci-description').classList.add('visible');
      }, 500);
      setTimeout(() => {
        document.getElementById('bottom-hud').classList.add('visible');
      }, 800);

      // Start tour
      setTimeout(() => {
        this.isPlayingTour = true;
        this._updatePlayButtonState();
        this._showToast('Cinematic Tour Started — Scroll or press Space to control');
      }, 1200);
    };

    startBtn.addEventListener('click', dismissIntro);
    window.addEventListener('keydown', (e) => {
      if (this.introActive) {
        dismissIntro();
        e.preventDefault();
      }
    }, { once: false });
  }

  /* =========================================================================
   * THREE.JS SCENE & CAMERA SETUP
   * ========================================================================= */
  _initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020510);

    // Background star field
    this._createStarField();

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(48, width / height, 0.01, 1000);
    this.camera.position.set(0, 1.2, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Orbit Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enableZoom = false;
    this.controls.maxDistance = 15;
    this.controls.minDistance = 1.2;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.3;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.0);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 2.2);
    dirLight1.position.set(5, 8, 6);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff0077, 1.0);
    dirLight2.position.set(-6, -4, -4);
    this.scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0x7c3aed, 0.8);
    dirLight3.position.set(-2, 6, -5);
    this.scene.add(dirLight3);

    // Hemisphere light for ambient color variation
    const hemiLight = new THREE.HemisphereLight(0x00f0ff, 0x3b0764, 0.4);
    this.scene.add(hemiLight);
  }

  _createStarField() {
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 80 + Math.random() * 120;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;
      starPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      starPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      starPos[i * 3 + 2] = r * Math.cos(theta);

      const brightness = 0.5 + Math.random() * 0.5;
      starColors[i * 3] = brightness;
      starColors[i * 3 + 1] = brightness;
      starColors[i * 3 + 2] = brightness + Math.random() * 0.2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });
    this.starField = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starField);
  }

  /* =========================================================================
   * CINEMATIC BLOOM POST-PROCESSING
   * ========================================================================= */
  _initPostProcessing() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    try {
      this.composer = new THREE.EffectComposer(this.renderer);
      const renderPass = new THREE.RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);

      // Cinematic bloom
      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.9,   // strength
        0.6,   // radius
        0.28   // threshold
      );
      this.composer.addPass(bloomPass);
      this.bloomPass = bloomPass;
    } catch (e) {
      console.warn('Post-processing fallback to direct renderer:', e);
      this.composer = null;
    }
  }

  /* =========================================================================
   * SCIENTIFIC SCALE MODELS
   * ========================================================================= */
  _initScales() {
    this.scaleSystem = new ScaleSystem(this.scene);
  }

  /* =========================================================================
   * HUD & USER CONTROLS INITIALIZATION
   * ========================================================================= */
  _initHUD() {
    this.slider = document.getElementById('zoom-range');
    this.playTourBtn = document.getElementById('play-tour-btn');
    this.audioBtn = document.getElementById('audio-btn');
    this.speedSelect = document.getElementById('tour-speed');
    this.scaleValueEl = document.getElementById('scale-value-text');
    this.scaleComparisonEl = document.getElementById('scale-comparison-text');
    this.toastEl = document.getElementById('toast');
    this.depthMarker = document.getElementById('depth-marker');

    // Info Card Elements
    this.cardCatEl = document.getElementById('card-category');
    this.cardTitleEl = document.getElementById('card-title');
    this.cardMetricEl = document.getElementById('card-metric');
    this.cardBodyEl = document.getElementById('card-body');
    this.cardEqEl = document.getElementById('card-equation');
    this.cardSpecsEl = document.getElementById('card-specs');

    this.stagePills = document.querySelectorAll('.stage-pill');

    // Scientific Description Panel
    this.sciScaleBadge = document.getElementById('sci-scale-badge');
    this.sciTitle = document.getElementById('sci-title');
    this.sciBody = document.getElementById('sci-body');

    this.updateHUD(this.currentZoom);
  }

  /* =========================================================================
   * ANNOTATION LABELS SYSTEM (3D → 2D Projection with Leader Lines)
   * ========================================================================= */
  _initAnnotations() {
    this.annotationCanvas = document.getElementById('annotation-canvas');
    this.annotationCtx = this.annotationCanvas.getContext('2d');
    this._resizeAnnotationCanvas();

    // Define 3D anchor points for each annotation label
    // Format: { elementId, position3D, scale: [min, max] zoom range }
    this.annotationAnchors = [
      // Cell Scale
      { id: 'label-membrane',  pos: new THREE.Vector3(0, 1.2, 0),   scale: [0.0, 0.22], offsetX: 120, offsetY: -80 },
      { id: 'label-flagella',  pos: new THREE.Vector3(-5, 0, 0.5),  scale: [0.0, 0.22], offsetX: -160, offsetY: -30 },
      { id: 'label-ribosomes', pos: new THREE.Vector3(1.0, 0.8, 0), scale: [0.0, 0.22], offsetX: 100, offsetY: -50 },
      { id: 'label-nucleoid',  pos: new THREE.Vector3(0.5, -0.5, 0),scale: [0.0, 0.22], offsetX: 120, offsetY: 60 },
      { id: 'label-pili',      pos: new THREE.Vector3(1.5, -1.0, 0.5),scale: [0.0, 0.20], offsetX: 100, offsetY: 30 },
      // Nucleoid Scale
      { id: 'label-70s',       pos: new THREE.Vector3(1.5, 1.0, 0), scale: [0.20, 0.42], offsetX: 100, offsetY: -60 },
      { id: 'label-mrna',      pos: new THREE.Vector3(-0.8, 0.5, 0),scale: [0.20, 0.42], offsetX: -130, offsetY: -40 },
      { id: 'label-groel',     pos: new THREE.Vector3(0.3, -1.2, 0),scale: [0.20, 0.42], offsetX: 100, offsetY: 50 },
      // DNA Scale
      { id: 'label-backbone',  pos: new THREE.Vector3(1.2, 2.0, 0), scale: [0.42, 0.65], offsetX: 120, offsetY: -60 },
      { id: 'label-basepair',  pos: new THREE.Vector3(-0.3, 0.0, 0),scale: [0.42, 0.65], offsetX: -150, offsetY: -20 },
      { id: 'label-hbond',     pos: new THREE.Vector3(0.3, -1.5, 0),scale: [0.42, 0.65], offsetX: 130, offsetY: 40 },
      // Atomic Scale
      { id: 'label-orbital',   pos: new THREE.Vector3(0, 2.0, 0),   scale: [0.65, 0.85], offsetX: 100, offsetY: -70 },
      { id: 'label-nucleus',   pos: new THREE.Vector3(0, 0, 0),     scale: [0.65, 0.85], offsetX: 130, offsetY: 50 },
      // Quantum Scale
      { id: 'label-virtual',   pos: new THREE.Vector3(1.5, 1.5, 0), scale: [0.85, 1.0], offsetX: 100, offsetY: -50 },
      { id: 'label-foam',      pos: new THREE.Vector3(-1.0, -1.0, 0),scale: [0.85, 1.0], offsetX: -130, offsetY: 50 }
    ];

    // Cache DOM elements
    this.annotationAnchors.forEach(a => {
      a.element = document.getElementById(a.id);
    });
  }

  _resizeAnnotationCanvas() {
    if (this.annotationCanvas) {
      this.annotationCanvas.width = window.innerWidth;
      this.annotationCanvas.height = window.innerHeight;
    }
  }

  _updateAnnotations(zoom) {
    if (!this.annotationCtx || !this.camera) return;

    const ctx = this.annotationCtx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.annotationAnchors.forEach(anchor => {
      const inRange = zoom >= anchor.scale[0] && zoom <= anchor.scale[1];
      // Compute fade-in/out at edges of range
      let alpha = 0;
      if (inRange) {
        const range = anchor.scale[1] - anchor.scale[0];
        const fadeZone = range * 0.2;
        if (zoom < anchor.scale[0] + fadeZone) {
          alpha = (zoom - anchor.scale[0]) / fadeZone;
        } else if (zoom > anchor.scale[1] - fadeZone) {
          alpha = (anchor.scale[1] - zoom) / fadeZone;
        } else {
          alpha = 1;
        }
        alpha = Math.max(0, Math.min(1, alpha));
      }

      if (alpha > 0.01 && anchor.element) {
        anchor.element.classList.add('visible');
        anchor.element.style.opacity = alpha;

        // Project 3D position to 2D screen coordinates
        const projected = anchor.pos.clone().project(this.camera);
        const screenX = (projected.x * 0.5 + 0.5) * width;
        const screenY = (-projected.y * 0.5 + 0.5) * height;

        // Label position with offset
        const labelX = screenX + anchor.offsetX;
        const labelY = screenY + anchor.offsetY;

        anchor.element.style.left = labelX + 'px';
        anchor.element.style.top = labelY + 'px';

        // Draw leader line from anchor point to label
        ctx.save();
        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);

        // Elbow joint for cleaner leader lines
        const midX = screenX + anchor.offsetX * 0.3;
        const midY = screenY + anchor.offsetY * 0.3;
        ctx.lineTo(midX, midY);
        ctx.lineTo(labelX, labelY);
        ctx.stroke();

        // Small dot at the anchor point
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (anchor.element) {
        anchor.element.classList.remove('visible');
        anchor.element.style.opacity = 0;
      }
    });
  }

  /* =========================================================================
   * SCIENTIFIC DESCRIPTION DATA (Bottom-Left Panel)
   * ========================================================================= */
  _updateSciDescription(stage) {
    const descriptions = {
      0: {
        badge: '10⁻⁶ M · MICROMETRES',
        title: 'Escherichia coli',
        body: 'One cell about 2 µm long; fifty of them would span the width of a human hair. It swims by spinning a bundle of helical flagella, each turned by a rotary motor at around 100 revolutions per second. Inside: a tangle of DNA called the nucleoid.'
      },
      1: {
        badge: '10⁻⁷ M · SUB-MICROMETRE',
        title: 'Cytoplasmic Interior',
        body: 'A dense molecular soup where 30% of the volume is occupied by ribosomes — molecular machines that read mRNA and build proteins 20 amino acids per second. GroEL chaperonin barrels fold misfolded proteins.'
      },
      2: {
        badge: '10⁻⁹ M · NANOMETRES',
        title: 'The Double Helix',
        body: 'Two intertwined sugar-phosphate backbones connected by 4.6 million base pairs. Adenine bonds with Thymine via 2 hydrogen bonds; Guanine bonds with Cytosine via 3. The entire chromosome is 1.5 mm long, coiled 1,000× to fit inside.'
      },
      3: {
        badge: '10⁻¹⁰ M · ÅNGSTRÖMS',
        title: 'Atomic Orbitals',
        body: 'What we call "solid" matter is 99.9999999% empty space. Electrons exist as probability clouds — standing waves described by the Schrödinger equation. The nucleus at center is 10,000× smaller than the atom itself.'
      },
      4: {
        badge: '10⁻³⁵ M · PLANCK LENGTH',
        title: 'Quantum Vacuum',
        body: 'At the Planck scale, spacetime itself froths into quantum foam. Virtual particle-antiparticle pairs spontaneously appear and annihilate within ℏ/2ΔE seconds. Everything above — atoms, DNA, the cell — emerges from ripples in quantum fields.'
      }
    };

    const desc = descriptions[stage.id];
    if (desc && this.sciScaleBadge) {
      this.sciScaleBadge.textContent = desc.badge;
      this.sciTitle.textContent = desc.title;
      this.sciBody.textContent = desc.body;
    }
  }

  _initEventListeners() {
    // Window Resize
    window.addEventListener('resize', () => this._onResize());

    // Scrubber Slider
    this.slider.addEventListener('input', (e) => {
      this.targetZoom = parseFloat(e.target.value);
      this.isPlayingTour = false;
      this._updatePlayButtonState();
    });

    // Mouse Wheel Logarithmic Zoom
    window.addEventListener('wheel', (e) => {
      if (this.introActive) return;
      e.preventDefault();
      const delta = e.deltaY * 0.0006;
      this.targetZoom = THREE.MathUtils.clamp(this.targetZoom + delta, 0.0, 1.0);
      this.slider.value = this.targetZoom;
      this.isPlayingTour = false;
      this._updatePlayButtonState();
    }, { passive: false });

    // Play / Pause Tour
    this.playTourBtn.addEventListener('click', () => {
      this.isPlayingTour = !this.isPlayingTour;
      this._updatePlayButtonState();
      this._showToast(this.isPlayingTour ? 'Cinematic Tour Resumed' : 'Tour Paused (Manual Exploration)');
    });

    // Audio Toggle
    this.audioBtn.addEventListener('click', () => {
      if (window.QuantumAudio) {
        const isPlaying = window.QuantumAudio.toggle();
        this.audioBtn.classList.toggle('active', isPlaying);
        this.audioBtn.querySelector('span').textContent = isPlaying ? 'Sound On' : 'Sound Off';
        this._showToast(isPlaying ? 'Procedural Soundscape Enabled' : 'Audio Muted');
      }
    });

    // Tour Speed
    this.speedSelect.addEventListener('change', (e) => {
      this.tourSpeed = parseFloat(e.target.value);
      this._showToast(`Tour Speed: ${this.tourSpeed}×`);
    });

    // Stage Pill Clicks
    this.stagePills.forEach((pill, idx) => {
      pill.addEventListener('click', () => {
        const stage = SCALE_STAGES[idx];
        this.targetZoom = stage.progress;
        this.slider.value = stage.progress;
        this.isPlayingTour = false;
        this._updatePlayButtonState();
        this._showToast(`Jumped to: ${stage.title}`);
        this._triggerScaleFlash();
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (this.introActive) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.playTourBtn.click();
      } else if (e.key === 'm' || e.key === 'M') {
        this.audioBtn.click();
      } else if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key) - 1;
        if (this.stagePills[idx]) this.stagePills[idx].click();
      } else if (e.code === 'ArrowRight' || e.code === 'ArrowUp') {
        this.targetZoom = THREE.MathUtils.clamp(this.targetZoom + 0.025, 0.0, 1.0);
        this.slider.value = this.targetZoom;
        this.isPlayingTour = false;
        this._updatePlayButtonState();
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowDown') {
        this.targetZoom = THREE.MathUtils.clamp(this.targetZoom - 0.025, 0.0, 1.0);
        this.slider.value = this.targetZoom;
        this.isPlayingTour = false;
        this._updatePlayButtonState();
      }
    });
  }

  _onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    this._resizeAnnotationCanvas();
  }

  _updatePlayButtonState() {
    const svgIcon = this.isPlayingTour
      ? `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg><span>Pause Tour</span>`
      : `<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"></polygon></svg><span>Play Tour</span>`;
    this.playTourBtn.innerHTML = svgIcon;
  }

  _showToast(msg) {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 2500);
  }

  _triggerScaleFlash() {
    const flash = document.createElement('div');
    flash.className = 'scale-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 900);
  }

  /* =========================================================================
   * HUD TELEMETRY & INFO CARD UPDATER
   * ========================================================================= */
  updateHUD(zoom) {
    // Find closest stage
    let currentStage = SCALE_STAGES[0];
    let minDiff = 999;
    SCALE_STAGES.forEach(st => {
      const diff = Math.abs(st.progress - zoom);
      if (diff < minDiff) {
        minDiff = diff;
        currentStage = st;
      }
    });

    // Detect stage transition
    if (currentStage.id !== this.lastStageId) {
      this.lastStageId = currentStage.id;
      if (!this.introActive) {
        this._triggerScaleFlash();
      }
      // Update scientific description panel
      this._updateSciDescription(currentStage);
    }

    // Update Stage Pills
    this.stagePills.forEach((p, idx) => {
      p.classList.toggle('active', SCALE_STAGES[idx] === currentStage);
    });

    // Update depth indicator
    if (this.depthMarker) {
      const depthPercent = 5 + zoom * 90;
      this.depthMarker.style.top = depthPercent + '%';
    }

    // Interpolate live SI order of magnitude
    const anchors = [
      { p: 0.05, exp: -6, val: 1.0 },
      { p: 0.28, exp: -7, val: 1.0 },
      { p: 0.52, exp: -9, val: 2.0 },
      { p: 0.75, exp: -10, val: 1.0 },
      { p: 0.95, exp: -35, val: 1.6 }
    ];

    let exponent = -6;
    let mantissa = "1.0";

    if (zoom <= anchors[0].p) {
      exponent = anchors[0].exp;
      mantissa = "1.0";
    } else if (zoom >= anchors[anchors.length - 1].p) {
      exponent = anchors[anchors.length - 1].exp;
      mantissa = "1.6";
    } else {
      for (let i = 0; i < anchors.length - 1; i++) {
        const a0 = anchors[i];
        const a1 = anchors[i + 1];
        if (zoom >= a0.p && zoom <= a1.p) {
          const frac = (zoom - a0.p) / (a1.p - a0.p);
          const smoothFrac = frac * frac * (3 - 2 * frac);
          const curExp = a0.exp + (a1.exp - a0.exp) * smoothFrac;
          exponent = Math.round(curExp);
          const curVal = (a0.val + (a1.val - a0.val) * smoothFrac).toFixed(1);
          mantissa = curVal;
          break;
        }
      }
    }

    // Dynamic scale value color
    if (this.scaleValueEl) {
      this.scaleValueEl.textContent = `${mantissa} × 10${this._toSuperscript(exponent)} m`;
      this.scaleValueEl.style.color = currentStage.scaleColor || '#ffffff';
    }
    if (this.scaleComparisonEl) {
      this.scaleComparisonEl.textContent = currentStage.comparison;
    }

    // Update Info Card
    if (this.cardCatEl) this.cardCatEl.textContent = currentStage.category;
    if (this.cardTitleEl) this.cardTitleEl.textContent = currentStage.title;
    if (this.cardMetricEl) this.cardMetricEl.textContent = currentStage.metric;
    if (this.cardBodyEl) this.cardBodyEl.textContent = currentStage.body;
    if (this.cardEqEl) this.cardEqEl.textContent = currentStage.equation;

    // Update Specs Grid
    if (this.cardSpecsEl) {
      let specsHtml = '';
      for (const [k, v] of Object.entries(currentStage.specs)) {
        specsHtml += `
          <div class="spec-item">
            <span class="spec-name">${k}</span>
            <span class="spec-val">${v}</span>
          </div>
        `;
      }
      this.cardSpecsEl.innerHTML = specsHtml;
    }
  }

  _toSuperscript(num) {
    const map = {
      '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³',
      '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return String(num).split('').map(c => map[c] || c).join('');
  }

  /* =========================================================================
   * DYNAMIC SCENE BACKGROUND COLOR
   * ========================================================================= */
  _updateSceneBackground(zoom) {
    // Smoothly transition background color through the journey
    const colors = [
      { p: 0.0,  r: 0.008, g: 0.020, b: 0.065 }, // Deep ocean blue (cell)
      { p: 0.25, r: 0.010, g: 0.025, b: 0.055 }, // Dark blue (nucleoid)
      { p: 0.50, r: 0.015, g: 0.012, b: 0.050 }, // Deep violet (DNA)
      { p: 0.75, r: 0.008, g: 0.020, b: 0.040 }, // Dark teal (atomic)
      { p: 1.0,  r: 0.012, g: 0.005, b: 0.035 }  // Deep purple (quantum)
    ];

    let r = colors[0].r, g = colors[0].g, b = colors[0].b;
    for (let i = 0; i < colors.length - 1; i++) {
      if (zoom >= colors[i].p && zoom <= colors[i + 1].p) {
        const frac = (zoom - colors[i].p) / (colors[i + 1].p - colors[i].p);
        r = colors[i].r + (colors[i + 1].r - colors[i].r) * frac;
        g = colors[i].g + (colors[i + 1].g - colors[i].g) * frac;
        b = colors[i].b + (colors[i + 1].b - colors[i].b) * frac;
        break;
      }
    }

    this.scene.background.setRGB(r, g, b);
  }

  /* =========================================================================
   * DYNAMIC BLOOM INTENSITY
   * ========================================================================= */
  _updateBloom(zoom) {
    if (!this.bloomPass) return;

    // Increase bloom intensity at quantum scales
    const strength = 0.7 + zoom * 0.8;
    const radius = 0.5 + zoom * 0.3;
    this.bloomPass.strength = strength;
    this.bloomPass.radius = radius;
  }

  /* =========================================================================
   * MAIN ANIMATION LOOP
   * ========================================================================= */
  _animate() {
    requestAnimationFrame(() => this._animate());

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) * 0.001, 0.1);
    this.lastTime = now;
    const time = now * 0.001;

    // Tour Autoplay Progression
    if (this.isPlayingTour && !this.introActive) {
      const tourRate = 0.018 * this.tourSpeed;
      this.targetZoom += tourRate * dt;
      if (this.targetZoom > 1.0) {
        this.targetZoom = 0.0; // Loop seamlessly
      }
      this.slider.value = this.targetZoom;
    }

    // Smooth Lerp for Buttery Zoom Transition
    const prevZoom = this.currentZoom;
    const lerpSpeed = 3.8 * dt;
    this.currentZoom = THREE.MathUtils.lerp(this.currentZoom, this.targetZoom, lerpSpeed);
    this.prevZoomSpeed = Math.abs(this.currentZoom - prevZoom) / Math.max(dt, 0.001);

    // Update HUD & Audio
    this.updateHUD(this.currentZoom);
    if (window.QuantumAudio) {
      window.QuantumAudio.updateZoom(this.currentZoom);
    }

    // Update dynamic scene properties
    this._updateSceneBackground(this.currentZoom);
    this._updateBloom(this.currentZoom);

    // Update Scale Systems
    this.scaleSystem.update(time, this.currentZoom);

    // Star field slow rotation
    if (this.starField) {
      this.starField.rotation.y = time * 0.005;
      this.starField.rotation.x = time * 0.003;
    }

    // Dynamic Camera Flight Path
    const camZ = 7.5 - Math.sin(this.currentZoom * Math.PI) * 2.0;
    const camY = 1.2 + Math.cos(time * 0.35) * 0.15;
    const camX = Math.sin(time * 0.2) * 0.1;
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, camZ, 0.04);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, camY, 0.04);
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, camX, 0.02);

    // Auto-rotate speed varies with scale
    if (this.controls) {
      this.controls.autoRotateSpeed = 0.3 + this.currentZoom * 0.5;
      this.controls.update();
    }

    // Render
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // Update annotation labels (after render so camera matrices are fresh)
    if (!this.introActive) {
      this._updateAnnotations(this.currentZoom);
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
