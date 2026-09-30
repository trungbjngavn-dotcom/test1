/**
 * QuantumBioSynthesizer
 * Generates an ethereal, scientifically reactive procedural soundscape using Web Audio API.
 * Modulates harmonic timbre, resonance, and drone textures continuously as scales change
 * from bacterial hydrodynamics down to quantum vacuum fluctuations.
 */

class QuantumBioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.isInitialized = false;

    // Layer Gain nodes
    this.gains = {
      cell: null,
      nucleoid: null,
      dna: null,
      atomic: null,
      quantum: null
    };

    // Sound generators & filters
    this.nodes = {};
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master chain with limiter
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.masterGain.connect(compressor);
      compressor.connect(this.ctx.destination);

      this._buildCellLayer();
      this._buildNucleoidLayer();
      this._buildDnaLayer();
      this._buildAtomicLayer();
      this._buildQuantumLayer();

      this.isInitialized = true;
      this.updateZoom(0);
    } catch (e) {
      console.warn('Web Audio could not initialize:', e);
    }
  }

  toggle() {
    if (!this.isInitialized) {
      this.init();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const target = this.isMuted ? 0.0001 : 0.65;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.5);
    }
    return !this.isMuted;
  }

  /* SCALE 1: Bacterial Hydrodynamic Sub-Drone (Deep fluid resonant hum) */
  _buildCellLayer() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.connect(this.masterGain);
    this.gains.cell = gain;

    // Sub oscillator
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 harmonic

    // Fluid filter modulation
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    // LFO for hydrodynamic undulating flagella
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.35, this.ctx.currentTime); // ~20 rpm wave
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(70, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);

    osc1.start();
    osc2.start();
    lfo.start();
  }

  /* SCALE 2: Macromolecular Crowding (Cellular machinery polyphonic wash) */
  _buildNucleoidLayer() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.connect(this.masterGain);
    this.gains.nucleoid = gain;

    // Filtered pink noise for Brownian thermal motion
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(420, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(4.5, this.ctx.currentTime);

    whiteNoise.connect(bandpass);
    bandpass.connect(gain);
    whiteNoise.start();

    // Secondary rhythmic pulse for translation ribosome activity
    const pulseOsc = this.ctx.createOscillator();
    pulseOsc.type = 'sine';
    pulseOsc.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3

    const pulseGain = this.ctx.createGain();
    pulseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    pulseOsc.connect(pulseGain);
    pulseGain.connect(gain);
    pulseOsc.start();
  }

  /* SCALE 3: DNA Double Helix (Crystalline resonant harmonic frequencies) */
  _buildDnaLayer() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.connect(this.masterGain);
    this.gains.dna = gain;

    // Golden-ratio harmonic intervals evoking crystalline double helix symmetry
    const baseFreqs = [220, 277.18, 329.63, 440, 554.37]; // A major pentatonic
    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);

      // Slow pan modulation
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.setValueAtTime(Math.sin(idx * 1.5), this.ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(oscGain);
        oscGain.connect(gain);
      }
      osc.start();
    });
  }

  /* SCALE 4: Atomic Orbitals (High-frequency shimmering probabilistic field) */
  _buildAtomicLayer() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.connect(this.masterGain);
    this.gains.atomic = gain;

    const highOsc = this.ctx.createOscillator();
    highOsc.type = 'sine';
    highOsc.frequency.setValueAtTime(880, this.ctx.currentTime);

    // FM Modulator for quantum electron cloud phase jitter
    const modOsc = this.ctx.createOscillator();
    modOsc.type = 'sine';
    modOsc.frequency.setValueAtTime(14.5, this.ctx.currentTime); // Quantum phase rate
    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(85, this.ctx.currentTime);

    modOsc.connect(modGain);
    modGain.connect(highOsc.frequency);

    const highFilter = this.ctx.createBiquadFilter();
    highFilter.type = 'highpass';
    highFilter.frequency.setValueAtTime(650, this.ctx.currentTime);

    highOsc.connect(highFilter);
    highFilter.connect(gain);

    highOsc.start();
    modOsc.start();
  }

  /* SCALE 5: Quantum Vacuum Fluctuations & Spacetime Foam (Ethereal cosmic overtone choir) */
  _buildQuantumLayer() {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.connect(this.masterGain);
    this.gains.quantum = gain;

    // Multi-voice celestial cluster (Zero-point ground state)
    const chord = [138.59, 207.65, 277.18, 415.30, 554.37, 830.61]; // C# Minor cosmic expanse
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, this.ctx.currentTime);

      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(0.06 / Math.sqrt(i + 1), this.ctx.currentTime);

      osc.connect(voiceGain);
      voiceGain.connect(gain);
      osc.start();
    });
  }

  /**
   * Update audio parameters smoothly based on zoom progress (0.0 to 1.0)
   */
  updateZoom(progress) {
    if (!this.isInitialized || !this.ctx) return;
    const t = this.ctx.currentTime;
    const ramp = 0.2; // Smooth ramp seconds

    // Compute bell curves for each scale stage
    // Scale 1 (Cell): 0.0 - 0.2
    // Scale 2 (Nucleoid): 0.15 - 0.45
    // Scale 3 (DNA): 0.4 - 0.68
    // Scale 4 (Atomic): 0.62 - 0.88
    // Scale 5 (Quantum): 0.82 - 1.0

    const wCell = Math.max(0, 1 - progress * 4.5);
    const wNucleoid = Math.max(0, 1 - Math.abs(progress - 0.28) * 4.5);
    const wDna = Math.max(0, 1 - Math.abs(progress - 0.52) * 4.5);
    const wAtomic = Math.max(0, 1 - Math.abs(progress - 0.75) * 4.5);
    const wQuantum = Math.max(0, (progress - 0.78) * 4.5);

    if (this.gains.cell) this.gains.cell.gain.setTargetAtTime(Math.min(0.7, wCell * 0.7), t, ramp);
    if (this.gains.nucleoid) this.gains.nucleoid.gain.setTargetAtTime(Math.min(0.6, wNucleoid * 0.6), t, ramp);
    if (this.gains.dna) this.gains.dna.gain.setTargetAtTime(Math.min(0.65, wDna * 0.65), t, ramp);
    if (this.gains.atomic) this.gains.atomic.gain.setTargetAtTime(Math.min(0.55, wAtomic * 0.55), t, ramp);
    if (this.gains.quantum) this.gains.quantum.gain.setTargetAtTime(Math.min(0.8, Math.min(1.0, wQuantum) * 0.8), t, ramp);
  }
}

window.QuantumAudio = new QuantumBioSynthesizer();
