class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.theme = 'mechanical'; // mechanical, soft, typewriter, beep
    this.volume = 0.5;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setPreferences(enabled, theme, volume) {
    if (enabled !== undefined) this.enabled = Boolean(enabled);
    if (theme !== undefined) this.theme = theme;
    if (volume !== undefined) this.volume = Math.max(0, Math.min(1, volume));
  }

  playKeypress() {
    if (!this.enabled || this.volume <= 0) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.35, t);
    masterGain.connect(this.ctx.destination);

    if (this.theme === 'thock') {
      // Deep creamy thock (Gateron Oil King style)
      // Sub-bass body
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140 + Math.random() * 20, t);
      sub.frequency.exponentialRampToValueAtTime(45, t + 0.05);

      subGain.gain.setValueAtTime(0.9, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      sub.connect(subGain);
      subGain.connect(masterGain);
      sub.start(t);
      sub.stop(t + 0.055);

      // Creamy wooden top click through lowpass filter
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, t);
      filter.Q.setValueAtTime(3.5, t);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.03);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.04);

    } else if (this.theme === 'holypanda') {
      // Tactile dual-transient bump (Holy Panda style)
      // Bump 1: Tactile round pop
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(750 + Math.random() * 50, t);
      osc1.frequency.exponentialRampToValueAtTime(220, t + 0.018);

      gain1.gain.setValueAtTime(0.65, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(t);
      osc1.stop(t + 0.025);

      // Bump 2: Bottom-out snap
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1250, t + 0.008);
      osc2.frequency.exponentialRampToValueAtTime(280, t + 0.035);

      gain2.gain.setValueAtTime(0, t);
      gain2.gain.setValueAtTime(0.8, t + 0.008);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.038);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(t + 0.008);
      osc2.stop(t + 0.042);

    } else if (this.theme === 'buckling') {
      // Vintage IBM Model M Buckling Spring (Metallic click + spring ping)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(2400 + Math.random() * 200, t);
      osc.frequency.exponentialRampToValueAtTime(450, t + 0.02);

      gain.gain.setValueAtTime(0.75, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.025);

      // Spring acoustic resonance
      const spring = this.ctx.createOscillator();
      const springGain = this.ctx.createGain();
      spring.type = 'sine';
      spring.frequency.setValueAtTime(3200, t);
      spring.frequency.exponentialRampToValueAtTime(1800, t + 0.06);

      springGain.gain.setValueAtTime(0.2, t);
      springGain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      spring.connect(springGain);
      springGain.connect(masterGain);
      spring.start(t);
      spring.stop(t + 0.07);

    } else if (this.theme === 'typewriter') {
      // Typewriter snap with mechanical impact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1600 + Math.random() * 200, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.035);

      gain.gain.setValueAtTime(0.85, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.04);

      // Steel lever body thud
      const body = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      body.type = 'sine';
      body.frequency.setValueAtTime(220, t);
      body.frequency.exponentialRampToValueAtTime(50, t + 0.045);
      bodyGain.gain.setValueAtTime(0.5, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      body.connect(bodyGain);
      bodyGain.connect(masterGain);
      body.start(t);
      body.stop(t + 0.05);

    } else if (this.theme === 'soft') {
      // Soft membrane / bubble tap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420 + Math.random() * 60, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.045);

    } else if (this.theme === 'mechanical') {
      // Cherry MX Blue style mechanical switch click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800 + Math.random() * 400, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.025);

      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.03);

      // Low end thud
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(160, t);
      sub.frequency.exponentialRampToValueAtTime(60, t + 0.04);
      subGain.gain.setValueAtTime(0.5, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      sub.connect(subGain);
      subGain.connect(masterGain);
      sub.start(t);
      sub.stop(t + 0.045);

    } else {
      // Digital beep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.025);
    }
  }

  playError() {
    if (!this.enabled || this.volume <= 0) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.085);
  }

  playComplete() {
    if (!this.enabled || this.volume <= 0) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }
}

export const soundEngine = new SoundEngine();
