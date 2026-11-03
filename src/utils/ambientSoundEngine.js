// Web Audio API Procedural Ambient Sound Engine
// Generates soothing natural ambient soundscapes mathematically without external audio files.

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.currentTrack = null;
    this.gainNode = null;
    this.activeNodes = [];
    this.volume = 0.4;
    this.isPlaying = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create pink/brownian noise buffer for organic sounds
  createNoiseBuffer(type = 'pink') {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      // Brown/Red noise (for deep rain / thunder rumble)
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    }
    return buffer;
  }

  playTrack(trackId) {
    this.initContext();
    if (!this.ctx) return;

    if (this.isPlaying && this.currentTrack === trackId) {
      this.stop();
      return;
    }

    this.stop();
    this.currentTrack = trackId;

    switch (trackId) {
      case 'rain':
        this.generateRainSound();
        break;
      case 'forest':
        this.generateForestSound();
        break;
      case 'cafe':
        this.generateCafeSound();
        break;
      case 'vinyl':
        this.generateVinylSound();
        break;
      default:
        return;
    }

    this.isPlaying = true;
  }

  // 1. Procedural Gentle Rain
  generateRainSound() {
    const noiseBuffer = this.createNoiseBuffer('pink');
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Filter to sound like soft rainfall
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // Subtle high-shelf for raindrop texture
    const highShelf = this.ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.setValueAtTime(3500, this.ctx.currentTime);
    highShelf.gain.setValueAtTime(-6, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(highShelf);
    highShelf.connect(this.gainNode);

    source.start(0);
    this.activeNodes.push(source, filter, highShelf);
  }

  // 2. Procedural Forest Breeze
  generateForestSound() {
    const noiseBuffer = this.createNoiseBuffer('pink');
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // LFO to simulate gentle wind gusts
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // very slow oscillation

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(this.gainNode);

    source.start(0);
    lfo.start(0);
    this.activeNodes.push(source, filter, lfo, lfoGain);
  }

  // 3. Cozy White Noise / Warm Cafe Murmur
  generateCafeSound() {
    const noiseBuffer = this.createNoiseBuffer('brown');
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, this.ctx.currentTime);

    // Subtle warm low-frequency drone (hum of warm room)
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, this.ctx.currentTime);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(this.gainNode);

    source.connect(filter);
    filter.connect(this.gainNode);

    source.start(0);
    osc.start(0);
    this.activeNodes.push(source, filter, osc, oscGain);
  }

  // 4. Lo-Fi Vinyl Crackle & Warmth
  generateVinylSound() {
    const noiseBuffer = this.createNoiseBuffer('pink');
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // 50Hz subtle turntable motor hum
    const hum = this.ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(50, this.ctx.currentTime);
    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    hum.connect(humGain);
    humGain.connect(this.gainNode);

    source.connect(filter);
    filter.connect(this.gainNode);

    source.start(0);
    hum.start(0);
    this.activeNodes.push(source, filter, hum, humGain);
  }

  stop() {
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.currentTrack = null;
    this.isPlaying = false;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  getTracks() {
    return [
      { id: 'rain', name: 'Gentle Rain', icon: 'CloudDrizzle', description: 'Soft raindrops on a peaceful studio window' },
      { id: 'forest', name: 'Forest Wind', icon: 'Trees', description: 'Calm breeze rustling through pine trees' },
      { id: 'cafe', name: 'Cozy Room', icon: 'Coffee', description: 'Warm low-frequency ambient studio atmosphere' },
      { id: 'vinyl', name: 'Lo-Fi Vinyl', icon: 'Disc3', description: 'Vintage turntable warmth and subtle crackle' }
    ];
  }
}

export const ambientEngine = new AmbientSoundEngine();

