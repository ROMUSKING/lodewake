type Bus = {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
};

let bus: Bus | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (bus) {
    const t = bus.ctx.currentTime;
    bus.master.gain.setTargetAtTime(on ? 1 : 0, t, 0.02);
  }
}

export function unlockAudio() {
  try {
    if (!bus) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx({ latencyHint: "interactive" });
      const master = ctx.createGain();
      const sfx = ctx.createGain();
      sfx.gain.value = 0.28;
      master.gain.value = enabled ? 1 : 0;
      sfx.connect(master);
      master.connect(ctx.destination);
      bus = { ctx, master, sfx };
    }
    if (bus.ctx.state === "suspended") void bus.ctx.resume();
  } catch {
    bus = null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.2, slide = 0) {
  if (!bus || !enabled) return;
  const { ctx, sfx } = bus;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(sfx);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(dur: number, gain = 0.12) {
  if (!bus || !enabled) return;
  const { ctx, sfx } = bus;
  const t = ctx.currentTime;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 420;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(sfx);
  src.start(t);
}

export const sfx = {
  probe() {
    tone(420 + Math.random() * 40, 0.07, "square", 0.07);
  },
  extract(combo: number) {
    const f = 220 + Math.min(8, combo) * 28;
    tone(f, 0.14, "triangle", 0.16, 180);
    tone(f * 2, 0.1, "sine", 0.06, 80);
  },
  rift() {
    noise(0.22, 0.18);
    tone(90, 0.28, "sawtooth", 0.12, -50);
  },
  chord() {
    tone(520, 0.09, "sine", 0.08);
    tone(780, 0.12, "sine", 0.05);
  },
  mark() {
    tone(180, 0.05, "square", 0.05);
  },
  buy() {
    tone(300, 0.08, "triangle", 0.1, 200);
  },
  death() {
    tone(140, 0.4, "sawtooth", 0.14, -90);
    noise(0.3, 0.1);
  },
  recall() {
    tone(260, 0.18, "sine", 0.1, 120);
  },
  ui() {
    tone(640, 0.04, "square", 0.04);
  },
  miss() {
    tone(160, 0.07, "square", 0.05, -40);
  },
};
