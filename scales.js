/**
 * ScaleSystem: Builds and coordinates the 5 scientific scale layers with
 * dramatically enhanced biological and physical detail:
 *
 * 1. CellScale (10^-6 m) — Full E. coli with capsule, flagella, pili,
 *    membrane cutaway, cytoplasmic interior, nucleoid mass hint
 * 2. NucleoidScale (10^-7 m) — Dense macromolecular crowding: 70S ribosomes
 *    with distinct 50S/30S subunits, mRNA threading, supercoiled plectonemic
 *    DNA loops, HU/H-NS NAPs, GroEL/GroES chaperonin barrels
 * 3. DnaScale (10^-9 m) — Watson-Crick B-DNA double helix with accurate
 *    3.4 nm pitch, 10.5 bp/turn, major/minor grooves, Adenine-Thymine (2 H-bonds)
 *    and Guanine-Cytosine (3 H-bonds) base pair coloring
 * 4. AtomicScale (10^-10 m) — Electron probability clouds (|ψ|²), 2p_z orbital
 *    with positive/negative phase lobes, sp³ hybrid tetrahedrals, pi-electron
 *    delocalized tori, nucleus with protons & neutrons, strong force aura
 * 5. QuantumScale (10^-15 to 10^-35 m) — Vacuum fluctuations, virtual
 *    particle-antiparticle loops, Planck-scale spacetime foam, gauge field manifold
 */

class ScaleSystem {
  constructor(scene) {
    this.scene = scene;
    this.groups = {
      cell: new THREE.Group(),
      nucleoid: new THREE.Group(),
      dna: new THREE.Group(),
      atomic: new THREE.Group(),
      quantum: new THREE.Group()
    };

    Object.values(this.groups).forEach(g => this.scene.add(g));
    this._buildAll();
  }

  _buildAll() {
    this._buildCellScale();
    this._buildNucleoidScale();
    this._buildDnaScale();
    this._buildAtomicScale();
    this._buildQuantumScale();
  }

  /* =========================================================================
   * SCALE 1: BACTERIAL CELL (10^-6 m / 1 - 2 µm)
   * Gram-negative rod-shaped bacillus (E. coli K-12)
   * ========================================================================= */
  _buildCellScale() {
    const group = this.groups.cell;
    group.name = "BacterialCellScale";

    const bodyLength = 4.0;
    const bodyRadius = 1.05;

    // === OUTER MEMBRANE (Lipopolysaccharide Layer) ===
    this.membraneUniforms = {
      uTime: { value: 0 },
      uColorBase: { value: new THREE.Color(0x06283d) },
      uColorRim: { value: new THREE.Color(0x00f0ff) },
      uCutawayProgress: { value: 0.0 }
    };

    const membraneMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.CellMembrane.vertexShader,
      fragmentShader: Shaders.CellMembrane.fragmentShader,
      uniforms: this.membraneUniforms,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Rod-shaped capsule: cylinder body + hemispherical end caps
    const cylGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyLength, 64, 32, true);
    const topCapGeo = new THREE.SphereGeometry(bodyRadius, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const btmCapGeo = new THREE.SphereGeometry(bodyRadius, 64, 32, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);

    const cylMesh = new THREE.Mesh(cylGeo, membraneMat);
    const topCap = new THREE.Mesh(topCapGeo, membraneMat);
    topCap.position.y = bodyLength * 0.5;
    const btmCap = new THREE.Mesh(btmCapGeo, membraneMat);
    btmCap.position.y = -bodyLength * 0.5;

    // === INNER PEPTIDOGLYCAN MESH LAYER ===
    const pepMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const pepMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(bodyRadius * 0.96, bodyRadius * 0.96, bodyLength * 0.96, 40, 20, true),
      pepMat
    );

    // === INNER CYTOPLASMIC MEMBRANE ===
    const innerMemMat = new THREE.MeshStandardMaterial({
      color: 0x0a3d62,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const innerMemMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(bodyRadius * 0.92, bodyRadius * 0.92, bodyLength * 0.92, 32, 16, true),
      innerMemMat
    );

    // === CYTOPLASMIC INTERIOR VOLUME ===
    this.cytoUniforms = {
      uTime: { value: 0 },
      uOpacity: { value: 0.3 }
    };

    const cytoMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.CytoplasmVolume.vertexShader,
      fragmentShader: Shaders.CytoplasmVolume.fragmentShader,
      uniforms: this.cytoUniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const cytoGeo = new THREE.SphereGeometry(bodyRadius * 0.88, 24, 24);
    cytoGeo.scale(1.0, bodyLength * 0.22, 1.0);
    const cytoMesh = new THREE.Mesh(cytoGeo, cytoMat);

    const capsuleGroup = new THREE.Group();
    capsuleGroup.add(cylMesh, topCap, btmCap, pepMesh, innerMemMesh, cytoMesh);
    capsuleGroup.rotation.z = Math.PI * 0.5;
    group.add(capsuleGroup);

    // === NUCLEOID MASS HINT (visible from outside — yellow/amber like reference) ===
    const nucleoidHintMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });
    const nucleoidHintGeo = new THREE.SphereGeometry(0.6, 16, 16);
    nucleoidHintGeo.scale(1.8, 1.0, 1.0);
    const nucleoidHint = new THREE.Mesh(nucleoidHintGeo, nucleoidHintMat);
    capsuleGroup.add(nucleoidHint);

    // Secondary nucleoid glow (warmer inner)
    const nucleoidInnerMat = new THREE.MeshBasicMaterial({
      color: 0xffcc44,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending
    });
    const nucleoidInnerGeo = new THREE.SphereGeometry(0.45, 12, 12);
    nucleoidInnerGeo.scale(1.5, 0.8, 0.8);
    capsuleGroup.add(new THREE.Mesh(nucleoidInnerGeo, nucleoidInnerMat));

    // === PERITRICHOUS FLAGELLA WITH BASAL BODY MOTORS ===
    this.flagellaList = [];
    const flagellaCount = 7;
    const flagellaMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.5
    });
    const motorMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      metalness: 0.8,
      emissive: 0x075985,
      emissiveIntensity: 0.3
    });

    for (let f = 0; f < flagellaCount; f++) {
      const angle = (f / flagellaCount) * Math.PI * 2;
      const xOffset = (Math.random() - 0.5) * 2.8;
      const rootPos = new THREE.Vector3(
        xOffset,
        Math.cos(angle) * bodyRadius * 0.96,
        Math.sin(angle) * bodyRadius * 0.96
      );

      const flagellumContainer = new THREE.Group();
      flagellumContainer.position.copy(rootPos);
      flagellumContainer.rotation.z = angle;

      // Basal body motor (L ring, P ring, MS ring, C ring)
      const motorMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.12, 14),
        motorMat
      );
      motorMesh.rotation.x = Math.PI * 0.5;
      flagellumContainer.add(motorMesh);

      // Hook region
      const hookGeo = new THREE.TorusGeometry(0.08, 0.025, 8, 12, Math.PI * 0.5);
      const hookMesh = new THREE.Mesh(hookGeo, flagellaMat);
      hookMesh.position.y = 0.12;
      hookMesh.rotation.x = Math.PI * 0.5;
      flagellumContainer.add(hookMesh);

      // Helical filament (accurate left-handed helix)
      const points = [];
      const numPts = 80;
      const length = 8.0 + Math.random() * 2.5;
      const helixPitch = 2.3;
      const helixAmplitude = 0.38;
      for (let p = 0; p < numPts; p++) {
        const u = p / (numPts - 1);
        const along = -u * length;
        // Left-handed helix waveform
        const wave = Math.sin(u * Math.PI * 2 * (length / helixPitch) + f * 1.2) * helixAmplitude * (0.2 + u * 0.8);
        const wave2 = Math.cos(u * Math.PI * 2 * (length / helixPitch) + f * 1.2) * helixAmplitude * (0.2 + u * 0.8);
        points.push(new THREE.Vector3(along, wave, wave2));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 60, 0.028, 8, false);
      const flagellumMesh = new THREE.Mesh(tubeGeo, flagellaMat);
      flagellumContainer.add(flagellumMesh);

      // === GLOWING WAVE TRAIL (like reference image) ===
      // Wider, transparent, additive-blending tube creates luminescent trail
      const trailMat = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const trailGeo = new THREE.TubeGeometry(curve, 60, 0.15, 8, false);
      const trailMesh = new THREE.Mesh(trailGeo, trailMat);
      flagellumContainer.add(trailMesh);

      // Outer wide glow trail
      const outerTrailMat = new THREE.MeshBasicMaterial({
        color: 0x0088cc,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const outerTrailGeo = new THREE.TubeGeometry(curve, 60, 0.35, 8, false);
      const outerTrailMesh = new THREE.Mesh(outerTrailGeo, outerTrailMat);
      flagellumContainer.add(outerTrailMesh);

      group.add(flagellumContainer);
      this.flagellaList.push({
        container: flagellumContainer,
        speed: 4.0 + f * 0.5,
        phase: f * 0.9
      });
    }

    // === TYPE IV PILI / FIMBRIAE ===
    const piliGeo = new THREE.BufferGeometry();
    const piliCount = 500;
    const piliPositions = new Float32Array(piliCount * 6);
    for (let i = 0; i < piliCount; i++) {
      const px = (Math.random() - 0.5) * bodyLength;
      const theta = Math.random() * Math.PI * 2;
      const r = bodyRadius * 0.99;
      const py = Math.cos(theta) * r;
      const pz = Math.sin(theta) * r;
      const len = 0.25 + Math.random() * 0.6;

      piliPositions[i * 6 + 0] = px;
      piliPositions[i * 6 + 1] = py;
      piliPositions[i * 6 + 2] = pz;
      piliPositions[i * 6 + 3] = px + (Math.random() - 0.5) * 0.08;
      piliPositions[i * 6 + 4] = py + Math.cos(theta) * len;
      piliPositions[i * 6 + 5] = pz + Math.sin(theta) * len;
    }
    piliGeo.setAttribute('position', new THREE.BufferAttribute(piliPositions, 3));
    const piliMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4
    });
    group.add(new THREE.LineSegments(piliGeo, piliMat));

    // === EXTRACELLULAR NUTRIENT PARTICLES ===
    const nutrientGeo = new THREE.BufferGeometry();
    const nutrientCount = 450;
    const nPos = new Float32Array(nutrientCount * 3);
    const nColors = new Float32Array(nutrientCount * 3);
    for (let i = 0; i < nutrientCount; i++) {
      nPos[i * 3] = (Math.random() - 0.5) * 18.0;
      nPos[i * 3 + 1] = (Math.random() - 0.5) * 14.0;
      nPos[i * 3 + 2] = (Math.random() - 0.5) * 14.0;
      // Varied colors: glucose (amber), amino acids (green), ions (cyan)
      const type = Math.random();
      if (type < 0.33) {
        nColors[i * 3] = 1.0; nColors[i * 3 + 1] = 0.67; nColors[i * 3 + 2] = 0.0;
      } else if (type < 0.66) {
        nColors[i * 3] = 0.0; nColors[i * 3 + 1] = 0.96; nColors[i * 3 + 2] = 0.63;
      } else {
        nColors[i * 3] = 0.0; nColors[i * 3 + 1] = 0.94; nColors[i * 3 + 2] = 1.0;
      }
    }
    nutrientGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
    nutrientGeo.setAttribute('color', new THREE.BufferAttribute(nColors, 3));
    const nutrientMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    this.nutrientCloud = new THREE.Points(nutrientGeo, nutrientMat);
    group.add(this.nutrientCloud);

    // === DISTANT COMPANION BACTERIA (Environmental context) ===
    const companionMat = new THREE.MeshStandardMaterial({
      color: 0x06283d,
      transparent: true,
      opacity: 0.25,
      emissive: 0x003050,
      emissiveIntensity: 0.3
    });

    for (let c = 0; c < 4; c++) {
      const compGroup = new THREE.Group();
      const compCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 2.0, 16, 8, true),
        companionMat
      );
      const compTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
        companionMat
      );
      compTop.position.y = 1.0;
      const compBtm = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
        companionMat
      );
      compBtm.position.y = -1.0;
      compGroup.add(compCyl, compTop, compBtm);
      compGroup.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        -5 - Math.random() * 8
      );
      compGroup.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      group.add(compGroup);
    }
  }

  /* =========================================================================
   * SCALE 2: CYTOPLASM & NUCLEOID (10^-7 m / 100 nm)
   * Dense macromolecular crowding interior
   * ========================================================================= */
  _buildNucleoidScale() {
    const group = this.groups.nucleoid;
    group.name = "CytoplasmNucleoidScale";

    const dummy = new THREE.Object3D();

    // === 70S RIBOSOMES: 50S (large) + 30S (small) subunits ===
    const ribosomeCount = 220;
    const largeSubunitGeo = new THREE.SphereGeometry(0.12, 14, 12);
    const smallSubunitGeo = new THREE.SphereGeometry(0.08, 12, 10);

    // Pink/magenta ribosomes (matching reference image)
    const largeSubunitMat = new THREE.MeshStandardMaterial({
      color: 0xc44dbb,
      roughness: 0.45,
      metalness: 0.15,
      emissive: 0x8b2580,
      emissiveIntensity: 0.35
    });

    const smallSubunitMat = new THREE.MeshStandardMaterial({
      color: 0xe078d8,
      roughness: 0.45,
      metalness: 0.15,
      emissive: 0xa03890,
      emissiveIntensity: 0.35
    });

    const instancedLarge = new THREE.InstancedMesh(largeSubunitGeo, largeSubunitMat, ribosomeCount);
    const instancedSmall = new THREE.InstancedMesh(smallSubunitGeo, smallSubunitMat, ribosomeCount);

    this.ribosomePositions = [];

    for (let i = 0; i < ribosomeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 2.2;
      const z = (Math.random() - 0.5) * 3.8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      this.ribosomePositions.push(new THREE.Vector3(x, y, z));

      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      instancedLarge.setMatrixAt(i, dummy.matrix);

      // 30S subunit offset from 50S (mRNA channel interface)
      dummy.position.set(x + 0.1, y + 0.07, z);
      dummy.updateMatrix();
      instancedSmall.setMatrixAt(i, dummy.matrix);
    }
    instancedLarge.instanceMatrix.needsUpdate = true;
    instancedSmall.instanceMatrix.needsUpdate = true;
    group.add(instancedLarge, instancedSmall);

    // === GroEL / GroES CHAPERONIN CYLINDRICAL BARRELS ===
    const chapMat = new THREE.MeshStandardMaterial({
      color: 0x6d28d9,
      roughness: 0.35,
      emissive: 0x3b0764,
      emissiveIntensity: 0.3
    });
    const chapGeoBottom = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 14);
    const chapGeoTop = new THREE.SphereGeometry(0.18, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);

    for (let c = 0; c < 14; c++) {
      const chapGroup = new THREE.Group();
      const bottom = new THREE.Mesh(chapGeoBottom, chapMat);
      const top = new THREE.Mesh(chapGeoTop, chapMat);
      top.position.y = 0.15;
      chapGroup.add(bottom, top);
      chapGroup.position.set(
        (Math.random() - 0.5) * 3.6,
        (Math.random() - 0.5) * 3.2,
        (Math.random() - 0.5) * 2.6
      );
      chapGroup.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      group.add(chapGroup);
    }

    // === mRNA MESSENGER FILAMENTS (Threading through ribosomes) ===
    const mrnaMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8
    });
    for (let m = 0; m < 16; m++) {
      const pts = [];
      const start = this.ribosomePositions[Math.floor(Math.random() * ribosomeCount)];
      pts.push(start.clone());
      for (let p = 1; p <= 6; p++) {
        pts.push(new THREE.Vector3(
          start.x + (Math.random() - 0.5) * 1.3,
          start.y + (Math.random() - 0.5) * 1.3,
          start.z + (Math.random() - 0.5) * 1.3
        ));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const mrnaGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
      group.add(new THREE.Line(mrnaGeo, mrnaMat));
    }

    // === SUPERCOILED PLECTONEMIC DNA NUCLEOID LOOPS ===
    // Yellow/amber nucleoid fibers (matching reference image)
    const nucleoidFibersMat = new THREE.LineBasicMaterial({
      color: 0xf5c542,
      transparent: true,
      opacity: 0.85
    });

    const loopCount = 32;
    for (let l = 0; l < loopCount; l++) {
      const loopPts = [];
      const loopRadius = 0.55 + Math.random() * 0.9;
      const thetaOffset = (l / loopCount) * Math.PI * 2;
      const zCenter = (Math.random() - 0.5) * 1.4;

      for (let step = 0; step <= 80; step++) {
        const t = (step / 80) * Math.PI * 2;
        // Plectonemic supercoiling with high-frequency writhe
        const supercoilWave = Math.sin(t * 16.0 + l * 0.5) * 0.1;
        const writhe = Math.cos(t * 24.0 + l * 0.3) * 0.04;
        const x = Math.cos(t + thetaOffset) * (loopRadius + supercoilWave);
        const y = Math.sin(t + thetaOffset) * (loopRadius + supercoilWave);
        const z = zCenter + Math.sin(t * 10.0) * 0.25 + writhe;
        loopPts.push(new THREE.Vector3(x, y, z));
      }

      const loopCurve = new THREE.CatmullRomCurve3(loopPts);
      const loopGeo = new THREE.BufferGeometry().setFromPoints(loopCurve.getPoints(100));
      group.add(new THREE.Line(loopGeo, nucleoidFibersMat));
    }

    // === NUCLEOID-ASSOCIATED PROTEINS (HU, H-NS, IHF) ===
    const napGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const napColors = [
      new THREE.MeshBasicMaterial({ color: 0xf5c542 }), // HU (yellow)
      new THREE.MeshBasicMaterial({ color: 0xe88c30 }), // H-NS (orange)
      new THREE.MeshBasicMaterial({ color: 0xffd866 })  // IHF (gold)
    ];
    for (let i = 0; i < 140; i++) {
      const nap = new THREE.Mesh(napGeo, napColors[i % 3]);
      nap.position.set(
        (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 2.0,
        (Math.random() - 0.5) * 1.6
      );
      group.add(nap);
    }

    // === POLYPEPTIDE CHAINS EMERGING FROM RIBOSOMES ===
    const polypeptideMat = new THREE.LineBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.5
    });
    for (let pp = 0; pp < 20; pp++) {
      const ribo = this.ribosomePositions[Math.floor(Math.random() * ribosomeCount)];
      const ppPts = [ribo.clone()];
      for (let s = 0; s < 5; s++) {
        ppPts.push(new THREE.Vector3(
          ribo.x + (Math.random() - 0.5) * 0.6,
          ribo.y + (Math.random() - 0.5) * 0.6 + s * 0.15,
          ribo.z + (Math.random() - 0.5) * 0.6
        ));
      }
      const ppCurve = new THREE.CatmullRomCurve3(ppPts);
      const ppGeo = new THREE.BufferGeometry().setFromPoints(ppCurve.getPoints(16));
      group.add(new THREE.Line(ppGeo, polypeptideMat));
    }
  }

  /* =========================================================================
   * SCALE 3: DNA DOUBLE HELIX (10^-9 m / 2 nm B-DNA Watson-Crick)
   * Accurate B-form DNA with 3.4 nm pitch, 10.5 bp/turn,
   * Major groove (2.2 nm) and Minor groove (1.2 nm)
   * ========================================================================= */
  _buildDnaScale() {
    const group = this.groups.dna;
    group.name = "DnaHelixScale";

    const helixRadius = 1.05;
    const helixLength = 12.0;
    const pitch = 3.4;
    const bpPerTurn = 10.5;
    const totalTurns = helixLength / pitch;
    const totalBases = Math.floor(totalTurns * bpPerTurn);

    const backbonePoints1 = [];
    const backbonePoints2 = [];

    // A-T (Cyan & Amber, 2 H-bonds) | G-C (Emerald & Rose, 3 H-bonds)
    const basePairs = [
      { name1: 'Adenine', color1: 0x00f0ff, name2: 'Thymine', color2: 0xf59e0b, hbonds: 2 },
      { name1: 'Guanine', color1: 0x10b981, name2: 'Cytosine', color2: 0xf43f5e, hbonds: 3 }
    ];

    // Realistic random sequence
    const sequence = [];
    for (let i = 0; i <= totalBases; i++) {
      sequence.push(Math.random() < 0.5 ? 0 : 1);
    }

    const baseGroup = new THREE.Group();

    for (let i = 0; i <= totalBases; i++) {
      const t = i / totalBases;
      const angle = t * totalTurns * Math.PI * 2;
      const y = (t - 0.5) * helixLength;

      // Antiparallel strands with asymmetric offset for Major/Minor grooves
      const angle1 = angle;
      const angle2 = angle + Math.PI * 0.74; // Creates major/minor groove asymmetry

      const p1 = new THREE.Vector3(
        Math.cos(angle1) * helixRadius, y, Math.sin(angle1) * helixRadius
      );
      const p2 = new THREE.Vector3(
        Math.cos(angle2) * helixRadius, y, Math.sin(angle2) * helixRadius
      );

      backbonePoints1.push(p1);
      backbonePoints2.push(p2);

      const bp = basePairs[sequence[i]];
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      // Purine nucleobase (larger, double-ring: A or G)
      const purineEnd = new THREE.Vector3().lerpVectors(p1, mid, 0.78);
      baseGroup.add(this._createCylinderBetween(p1, purineEnd, 0.065, bp.color1));

      // Pyrimidine nucleobase (smaller, single-ring: T or C)
      const pyrimEnd = new THREE.Vector3().lerpVectors(p2, mid, 0.78);
      baseGroup.add(this._createCylinderBetween(p2, pyrimEnd, 0.065, bp.color2));

      // Hydrogen bonds between base pairs (2 for A-T, 3 for G-C)
      const bondDir = new THREE.Vector3().subVectors(pyrimEnd, purineEnd);
      const bondLen = bondDir.length();

      for (let hb = 0; hb < bp.hbonds; hb++) {
        const offset = (hb / (bp.hbonds - 1 || 1) - 0.5) * 0.06;
        const hbStart = purineEnd.clone();
        const hbEnd = pyrimEnd.clone();
        // Slight perpendicular offset for each bond
        const perp = new THREE.Vector3().crossVectors(bondDir, new THREE.Vector3(0, 1, 0)).normalize();
        hbStart.addScaledVector(perp, offset);
        hbEnd.addScaledVector(perp, offset);

        const hBondGeo = new THREE.BufferGeometry().setFromPoints([hbStart, hbEnd]);
        const hBondMat = new THREE.LineDashedMaterial({
          color: 0xffffff,
          dashSize: 0.03,
          gapSize: 0.02,
          transparent: true,
          opacity: 0.8
        });
        const hLine = new THREE.Line(hBondGeo, hBondMat);
        hLine.computeLineDistances();
        baseGroup.add(hLine);
      }

      // Deoxyribose sugar sphere at backbone connection
      if (i % 3 === 0) {
        const sugarGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const sugarMat = new THREE.MeshStandardMaterial({
          color: 0x7dd3fc,
          emissive: 0x0369a1,
          emissiveIntensity: 0.3
        });
        const sugar1 = new THREE.Mesh(sugarGeo, sugarMat);
        sugar1.position.copy(p1);
        const sugar2 = new THREE.Mesh(sugarGeo, sugarMat);
        sugar2.position.copy(p2);
        baseGroup.add(sugar1, sugar2);
      }
    }

    // === ANTIPARALLEL SUGAR-PHOSPHATE BACKBONES ===
    const curve1 = new THREE.CatmullRomCurve3(backbonePoints1);
    const curve2 = new THREE.CatmullRomCurve3(backbonePoints2);

    const tubeGeo1 = new THREE.TubeGeometry(curve1, 180, 0.1, 12, false);
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 180, 0.1, 12, false);

    const backboneMat1 = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.7
    });
    const backboneMat2 = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x6b21a8,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.7
    });

    group.add(new THREE.Mesh(tubeGeo1, backboneMat1));
    group.add(new THREE.Mesh(tubeGeo2, backboneMat2));
    group.add(baseGroup);

    // === MAJOR & MINOR GROOVE LABELS (Water molecule clusters) ===
    const waterMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const waterGeo = new THREE.BufferGeometry();
    const waterCount = 300;
    const waterPos = new Float32Array(waterCount * 3);
    for (let w = 0; w < waterCount; w++) {
      const t = Math.random();
      const angle = t * totalTurns * Math.PI * 2;
      const y = (t - 0.5) * helixLength;
      const grooveR = helixRadius + 0.2 + Math.random() * 0.4;
      waterPos[w * 3] = Math.cos(angle + Math.random()) * grooveR;
      waterPos[w * 3 + 1] = y + (Math.random() - 0.5) * 0.3;
      waterPos[w * 3 + 2] = Math.sin(angle + Math.random()) * grooveR;
    }
    waterGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
    group.add(new THREE.Points(waterGeo, waterMat));

    this.dnaGroup = group;
  }

  _createCylinderBetween(p1, p2, radius, color) {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const length = dir.length();
    const geo = new THREE.CylinderGeometry(radius, radius, length, 12);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: new THREE.Color(color).multiplyScalar(0.35),
      roughness: 0.3,
      metalness: 0.45
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(p1).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return mesh;
  }

  /* =========================================================================
   * SCALE 4: ATOMIC SCALE & ORBITAL CLOUDS (10^-10 m / 1 Å = 0.1 nm)
   * Carbon atom in a nucleobase with quantum mechanical electron orbitals
   * ========================================================================= */
  _buildAtomicScale() {
    const group = this.groups.atomic;
    group.name = "AtomicOrbitalScale";

    // === 2p_z DUMBBELL ORBITAL (|ψ|² Cloud) ===
    this.orbitalUniforms = {
      uTime: { value: 0 },
      uOrbitalType: { value: 1 },
      uColorPositive: { value: new THREE.Color(0x00f0ff) },
      uColorNegative: { value: new THREE.Color(0xf43f5e) },
      uOpacity: { value: 0.85 }
    };

    const orbitalGeo = new THREE.SphereGeometry(2.5, 56, 56);
    const orbitalMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.OrbitalCloud.vertexShader,
      fragmentShader: Shaders.OrbitalCloud.fragmentShader,
      uniforms: this.orbitalUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    group.add(new THREE.Mesh(orbitalGeo, orbitalMat));

    // === 1s INNER ORBITAL CORE ===
    const innerOrbUniforms = {
      uTime: { value: 0 },
      uOrbitalType: { value: 0 },
      uColorPositive: { value: new THREE.Color(0xffffff) },
      uColorNegative: { value: new THREE.Color(0xffffff) },
      uOpacity: { value: 0.4 }
    };
    this.innerOrbUniforms = innerOrbUniforms;

    const innerOrbGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const innerOrbMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.OrbitalCloud.vertexShader,
      fragmentShader: Shaders.OrbitalCloud.fragmentShader,
      uniforms: innerOrbUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    group.add(new THREE.Mesh(innerOrbGeo, innerOrbMat));

    // === sp³ HYBRID TETRAHEDRAL LOBES ===
    const sp3Directions = [
      new THREE.Vector3(1, 1, 1).normalize(),
      new THREE.Vector3(-1, -1, 1).normalize(),
      new THREE.Vector3(-1, 1, -1).normalize(),
      new THREE.Vector3(1, -1, -1).normalize()
    ];

    const lobeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const lobeGeo = new THREE.ConeGeometry(0.4, 1.5, 18);

    sp3Directions.forEach(dir => {
      const lobeMesh = new THREE.Mesh(lobeGeo, lobeMat.clone());
      lobeMesh.position.copy(dir).multiplyScalar(0.85);
      lobeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      group.add(lobeMesh);
    });

    // === π-ELECTRON DELOCALIZED TORUS RINGS (Aromatic system) ===
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f5a0,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const ringGeo = new THREE.TorusGeometry(1.5, 0.05, 18, 72);

    const rTop = new THREE.Mesh(ringGeo, ringMat);
    rTop.rotation.x = Math.PI * 0.5;
    rTop.position.y = 0.6;
    const rBtm = new THREE.Mesh(ringGeo, ringMat);
    rBtm.rotation.x = Math.PI * 0.5;
    rBtm.position.y = -0.6;
    group.add(rTop, rBtm);

    // === ELECTRON PROBABILITY DENSITY POINT CLOUD ===
    const electronCount = 1500;
    const electronGeo = new THREE.BufferGeometry();
    const ePos = new Float32Array(electronCount * 3);
    const eColors = new Float32Array(electronCount * 3);

    for (let i = 0; i < electronCount; i++) {
      // Sample from hydrogen-like 2p_z distribution
      const r = -Math.log(1 - Math.random()) * 1.2;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;

      ePos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      ePos[i * 3 + 1] = r * Math.cos(theta);
      ePos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);

      // Color by angular momentum phase
      const phase = Math.cos(theta);
      if (phase > 0) {
        eColors[i * 3] = 0.0; eColors[i * 3 + 1] = 0.94; eColors[i * 3 + 2] = 1.0;
      } else {
        eColors[i * 3] = 0.96; eColors[i * 3 + 1] = 0.25; eColors[i * 3 + 2] = 0.37;
      }
    }
    electronGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
    electronGeo.setAttribute('color', new THREE.BufferAttribute(eColors, 3));

    const electronMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    this.electronCloud = new THREE.Points(electronGeo, electronMat);
    group.add(this.electronCloud);

    // === ATOMIC NUCLEUS (10^-14 m): Protons + Neutrons ===
    const nucleusGroup = new THREE.Group();
    const nucleonCount = 12; // Carbon-12
    const protonGeo = new THREE.SphereGeometry(0.09, 14, 14);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.6
    });
    const nMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.6
    });

    for (let n = 0; n < nucleonCount; n++) {
      const isProton = n < 6; // Carbon: 6 protons, 6 neutrons
      const nucleon = new THREE.Mesh(protonGeo, isProton ? pMat : nMat);
      // Dense packing (face-centered cubic approximation)
      const phi = Math.acos(-1 + (2 * n) / nucleonCount);
      const theta = Math.sqrt(nucleonCount * Math.PI) * phi;
      const r = 0.16;
      nucleon.position.set(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi)
      );
      nucleusGroup.add(nucleon);
    }

    // Strong Nuclear Force Binding Aura (Gluon Field)
    const strongForceGeo = new THREE.SphereGeometry(0.38, 24, 24);
    const strongForceMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    nucleusGroup.add(new THREE.Mesh(strongForceGeo, strongForceMat));

    // Inner strong force glow
    const innerGlowGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    nucleusGroup.add(new THREE.Mesh(innerGlowGeo, innerGlowMat));

    group.add(nucleusGroup);
    this.nucleusGroup = nucleusGroup;
  }

  /* =========================================================================
   * SCALE 5: QUANTUM VACUUM & SPACETIME FOAM (10^-15 to 10^-35 m)
   * The Planck-scale bedrock of physical reality
   * ========================================================================= */
  _buildQuantumScale() {
    const group = this.groups.quantum;
    group.name = "QuantumFieldScale";

    // === QUANTUM VACUUM FIELD SPHERE ===
    this.quantumUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
      uColorA: { value: new THREE.Color(0x3b0764) },
      uColorB: { value: new THREE.Color(0x00f0ff) },
      uColorC: { value: new THREE.Color(0xf43f5e) }
    };

    const quantumGeo = new THREE.SphereGeometry(3.8, 72, 72);
    const quantumMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.QuantumField.vertexShader,
      fragmentShader: Shaders.QuantumField.fragmentShader,
      uniforms: this.quantumUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    group.add(new THREE.Mesh(quantumGeo, quantumMat));

    // === INNER VACUUM ENERGY CORE ===
    const innerQuantumGeo = new THREE.SphereGeometry(1.5, 48, 48);
    const innerQuantumUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 1.5 },
      uColorA: { value: new THREE.Color(0x1a0033) },
      uColorB: { value: new THREE.Color(0x00ffcc) },
      uColorC: { value: new THREE.Color(0xff44aa) }
    };
    this.innerQuantumUniforms = innerQuantumUniforms;
    const innerQuantumMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.QuantumField.vertexShader,
      fragmentShader: Shaders.QuantumField.fragmentShader,
      uniforms: innerQuantumUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    group.add(new THREE.Mesh(innerQuantumGeo, innerQuantumMat));

    // === VIRTUAL PARTICLE-ANTIPARTICLE ANNIHILATION LOOPS (Feynman Diagrams) ===
    const loopCount = 28;
    this.virtualLoops = [];

    for (let i = 0; i < loopCount; i++) {
      const loopMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0xff0077 : 0x00f0ff,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });

      const pts = [];
      const steps = 40;
      const baseR = 0.3 + Math.random() * 0.5;
      for (let s = 0; s <= steps; s++) {
        const rad = (s / steps) * Math.PI * 2;
        pts.push(new THREE.Vector3(
          Math.cos(rad) * baseR + (Math.random() - 0.5) * 0.08,
          Math.sin(rad) * baseR + (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.12
        ));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const line = new THREE.Line(geo, loopMat);

      const pivot = new THREE.Group();
      pivot.position.set(
        (Math.random() - 0.5) * 5.0,
        (Math.random() - 0.5) * 5.0,
        (Math.random() - 0.5) * 5.0
      );
      pivot.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      pivot.add(line);
      group.add(pivot);

      this.virtualLoops.push({
        group: pivot,
        line: line,
        speed: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    // === SPACETIME METRIC GRID (Fluctuating Planck-scale geometry) ===
    const gridHelper = new THREE.GridHelper(7, 32, 0x00f0ff, 0x7c3aed);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
    gridHelper.material.blending = THREE.AdditiveBlending;
    group.add(gridHelper);
    this.planckGrid = gridHelper;

    // === GAUGE FIELD FLUX TUBES (Color charge confinement) ===
    const fluxMat = new THREE.LineBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    this.fluxTubes = [];
    for (let f = 0; f < 12; f++) {
      const fPts = [];
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4
      );
      for (let s = 0; s <= 20; s++) {
        const t = s / 20;
        fPts.push(new THREE.Vector3(
          start.x + Math.sin(t * Math.PI * 4) * 0.5,
          start.y + t * 3 - 1.5,
          start.z + Math.cos(t * Math.PI * 4) * 0.5
        ));
      }
      const fCurve = new THREE.CatmullRomCurve3(fPts);
      const fGeo = new THREE.BufferGeometry().setFromPoints(fCurve.getPoints(30));
      const fLine = new THREE.Line(fGeo, fluxMat.clone());
      group.add(fLine);
      this.fluxTubes.push(fLine);
    }

    // === ZERO-POINT ENERGY PARTICLE FIELD ===
    const zpeCount = 2000;
    const zpeGeo = new THREE.BufferGeometry();
    const zpePos = new Float32Array(zpeCount * 3);
    const zpeColors = new Float32Array(zpeCount * 3);
    for (let i = 0; i < zpeCount; i++) {
      const r = Math.random() * 4.5;
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;
      zpePos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      zpePos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      zpePos[i * 3 + 2] = r * Math.cos(theta);

      const col = Math.random();
      if (col < 0.33) {
        zpeColors[i * 3] = 0.0; zpeColors[i * 3 + 1] = 0.94; zpeColors[i * 3 + 2] = 1.0;
      } else if (col < 0.66) {
        zpeColors[i * 3] = 0.62; zpeColors[i * 3 + 1] = 0.23; zpeColors[i * 3 + 2] = 0.98;
      } else {
        zpeColors[i * 3] = 1.0; zpeColors[i * 3 + 1] = 0.0; zpeColors[i * 3 + 2] = 0.47;
      }
    }
    zpeGeo.setAttribute('position', new THREE.BufferAttribute(zpePos, 3));
    zpeGeo.setAttribute('color', new THREE.BufferAttribute(zpeColors, 3));

    const zpeMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    this.zpeCloud = new THREE.Points(zpeGeo, zpeMat);
    group.add(this.zpeCloud);
  }

  /* =========================================================================
   * CONTINUOUS EXPONENTIAL ZOOM & VISIBILITY COORDINATOR
   * ========================================================================= */
  update(time, zoomProgress) {
    // Update shader uniforms
    if (this.membraneUniforms) this.membraneUniforms.uTime.value = time;
    if (this.cytoUniforms) this.cytoUniforms.uTime.value = time;
    if (this.orbitalUniforms) this.orbitalUniforms.uTime.value = time;
    if (this.innerOrbUniforms) this.innerOrbUniforms.uTime.value = time;
    if (this.quantumUniforms) this.quantumUniforms.uTime.value = time;
    if (this.innerQuantumUniforms) this.innerQuantumUniforms.uTime.value = time;

    // Flagella helical wave motion (proton-motive force driven rotation)
    if (this.flagellaList) {
      this.flagellaList.forEach(f => {
        f.container.rotation.x = Math.sin(time * f.speed + f.phase) * 0.18;
        f.container.rotation.y += 0.03;
      });
    }

    // Nutrient Brownian drift
    if (this.nutrientCloud) {
      this.nutrientCloud.rotation.y = time * 0.025;
      this.nutrientCloud.rotation.x = time * 0.012;
      // Subtle position jitter
      this.nutrientCloud.position.x = Math.sin(time * 0.5) * 0.05;
    }

    // DNA helical rotation & thermal breathing
    if (this.dnaGroup) {
      this.dnaGroup.rotation.y = time * 0.28;
      const breath = 1.0 + Math.sin(time * 2.5) * 0.015;
      this.dnaGroup.scale.set(breath, 1.0, breath);
    }

    // Electron cloud rotation (standing wave phase evolution)
    if (this.electronCloud) {
      this.electronCloud.rotation.y = time * 0.8;
      this.electronCloud.rotation.x = Math.sin(time * 0.3) * 0.1;
    }

    // Nucleus zero-point jitter (Heisenberg uncertainty vibration)
    if (this.nucleusGroup) {
      this.nucleusGroup.rotation.x = time * 1.2;
      this.nucleusGroup.rotation.y = time * 1.8;
      const jitter = 1.0 + Math.sin(time * 18.0) * 0.04;
      this.nucleusGroup.scale.set(jitter, jitter, jitter);
    }

    // Virtual particle loops (Heisenberg energy-time uncertainty pulse)
    if (this.virtualLoops) {
      this.virtualLoops.forEach(vl => {
        const pulse = Math.sin(time * vl.speed + vl.phase);
        const absPulse = Math.abs(pulse);
        vl.group.scale.setScalar(Math.max(0.001, absPulse * 1.4));
        vl.line.material.opacity = Math.max(0.0, absPulse * 0.9);
        vl.group.rotation.z += 0.02;
        vl.group.rotation.x += 0.008;
      });
    }

    // Planck grid fluctuation
    if (this.planckGrid) {
      this.planckGrid.rotation.y = time * 0.1;
      this.planckGrid.position.y = Math.sin(time * 1.2) * 0.08;
    }

    // Zero-point energy cloud rotation
    if (this.zpeCloud) {
      this.zpeCloud.rotation.y = time * 0.15;
      this.zpeCloud.rotation.z = time * 0.08;
    }

    // Flux tubes pulsation
    if (this.fluxTubes) {
      this.fluxTubes.forEach((ft, i) => {
        ft.material.opacity = 0.3 + Math.sin(time * 2.0 + i) * 0.2;
      });
    }

    // Dynamic scale crossfades
    this._coordinateScales(zoomProgress);
  }

  _coordinateScales(p) {
    // Membrane cutaway progress
    if (this.membraneUniforms) {
      this.membraneUniforms.uCutawayProgress.value = THREE.MathUtils.clamp((p - 0.05) / 0.18, 0.0, 1.0);
    }

    // Slightly overlapping fade windows for seamless transitions
    const a1 = this._fade(p, 0.0, 0.08, 0.20, 0.30);
    const a2 = this._fade(p, 0.16, 0.26, 0.38, 0.48);
    const a3 = this._fade(p, 0.36, 0.46, 0.60, 0.70);
    const a4 = this._fade(p, 0.60, 0.70, 0.82, 0.90);
    const a5 = this._fade(p, 0.80, 0.88, 1.00, 1.00);

    this._applyGroupVisibility(this.groups.cell, a1);
    this._applyGroupVisibility(this.groups.nucleoid, a2);
    this._applyGroupVisibility(this.groups.dna, a3);
    this._applyGroupVisibility(this.groups.atomic, a4);
    this._applyGroupVisibility(this.groups.quantum, a5);
  }

  _fade(t, inStart, inEnd, outStart, outEnd) {
    if (t < inStart) return 0;
    if (t < inEnd) {
      const raw = (t - inStart) / (inEnd - inStart);
      return raw * raw * (3 - 2 * raw); // Smoothstep easing
    }
    if (t <= outStart) return 1.0;
    if (t < outEnd) {
      const raw = 1.0 - (t - outStart) / (outEnd - outStart);
      return raw * raw * (3 - 2 * raw); // Smoothstep easing
    }
    return 0;
  }

  _applyGroupVisibility(group, alpha) {
    group.visible = alpha > 0.001;
    if (!group.visible) return;

    group.traverse(child => {
      if (child.material) {
        if (child.material.uniforms && child.material.uniforms.uOpacity) {
          child.material.uniforms.uOpacity.value = alpha;
        } else if (child.material.opacity !== undefined) {
          if (!child.userData.origOpacity) child.userData.origOpacity = child.material.opacity || 1.0;
          child.material.opacity = child.userData.origOpacity * alpha;
        }
      }
    });
  }
}
