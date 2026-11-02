'use strict';

const stage = document.getElementById('stage');

const COLORS = [
  { top: '#ff5a4f', side: '#c22f3a' },
  { top: '#ffc928', side: '#d18a0c' },
  { top: '#2ed9a3', side: '#109a78' },
  { top: '#38b6ff', side: '#1677c9' },
  { top: '#ff7ac6', side: '#cc4294' },
  { top: '#ff9a2e', side: '#cf6410' },
];

// Notes from a pentatonic scale, so any combination of presses sounds pleasant.
const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

const SPAWN_INTERVAL_MS = 700;
const PRESS_ANIMATION_MS = 170;
const PARTY_EVERY = 15;
// Extra reach around a button, because little fingers rarely land dead centre.
const TOUCH_MARGIN_PX = 14;

function starPoints() {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 44 : 23;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${50 + radius * Math.cos(angle)},${52 + radius * Math.sin(angle)}`);
  }
  return points.join(' ');
}

function flowerCircles() {
  let circles = '<circle cx="50" cy="50" r="24"/>';
  for (let i = 0; i < 5; i++) {
    const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
    circles += `<circle cx="${50 + 26 * Math.cos(angle)}" cy="${50 + 26 * Math.sin(angle)}" r="19"/>`;
  }
  return circles;
}

// Each shape pairs an outline with its own kind of sound.
const SHAPES = [
  { outline: '<circle cx="50" cy="50" r="44"/>', sound: bloop },
  { outline: '<rect x="9" y="9" width="82" height="82" rx="20"/>', sound: xylophone },
  { outline: `<polygon points="${starPoints()}" stroke-width="10" stroke-linejoin="round"/>`, sound: chime },
  { outline: '<path d="M50 90C20 68 6 50 6 32 6 17 18 8 30 8c9 0 16 5 20 13 4-8 11-13 20-13 12 0 24 9 24 24 0 18-14 36-44 58z"/>', sound: booBoop },
  { outline: flowerCircles(), sound: boing },
  { outline: '<polygon points="50,14 90,84 10,84" stroke-width="14" stroke-linejoin="round"/>', sound: squeak },
];

// Animals have a fixed color, and details drawn under and over the face.
const ANIMALS = [
  {
    color: { top: '#ff9a2e', side: '#cf6410' },
    outline: '<polygon points="17,42 20,9 46,24" stroke-width="8" stroke-linejoin="round"/><polygon points="83,42 80,9 54,24" stroke-width="8" stroke-linejoin="round"/><circle cx="50" cy="54" r="38"/>',
    under: '<polygon points="24,30 24,16 36,24" fill="#ffc2dc"/><polygon points="76,30 76,16 64,24" fill="#ffc2dc"/>',
    over: '<path d="M16 54l14 3M16 66l14-3M84 54l-14 3M84 66l-14-3" stroke="#23203f" stroke-width="2.5" stroke-linecap="round"/><path d="M46 55h8l-4 4z" fill="#ff5a8a"/>',
    sound: meow,
  },
  {
    color: { top: '#b79cff', side: '#8463d6' },
    outline: '<ellipse cx="33" cy="26" rx="11" ry="24"/><ellipse cx="67" cy="26" rx="11" ry="24"/><circle cx="50" cy="60" r="35"/>',
    under: '<ellipse cx="33" cy="24" rx="5" ry="16" fill="#ffc2dc"/><ellipse cx="67" cy="24" rx="5" ry="16" fill="#ffc2dc"/>',
    over: '<path d="M46 55h8l-4 4z" fill="#ff5a8a"/><rect x="45" y="67" width="10" height="9" rx="2" fill="#fff"/>',
    sound: hop,
  },
  {
    color: { top: '#b5793f', side: '#845226' },
    outline: '<circle cx="22" cy="26" r="15"/><circle cx="78" cy="26" r="15"/><circle cx="50" cy="54" r="38"/>',
    under: '<circle cx="22" cy="26" r="7" fill="#e3c08f"/><circle cx="78" cy="26" r="7" fill="#e3c08f"/><ellipse cx="50" cy="63" rx="19" ry="14" fill="#e3c08f"/>',
    over: '<ellipse cx="50" cy="55" rx="6" ry="4" fill="#23203f"/>',
    sound: growl,
  },
  {
    color: { top: '#ff8fbe', side: '#cc5a8c' },
    outline: '<polygon points="16,36 16,10 40,22" stroke-width="8" stroke-linejoin="round"/><polygon points="84,36 84,10 60,22" stroke-width="8" stroke-linejoin="round"/><circle cx="50" cy="54" r="38"/>',
    under: '',
    over: '<ellipse cx="50" cy="62" rx="14" ry="10" fill="#ffb9d6" stroke="#cc5a8c" stroke-width="2"/><ellipse cx="45" cy="62" rx="2.5" ry="3.5" fill="#23203f"/><ellipse cx="55" cy="62" rx="2.5" ry="3.5" fill="#23203f"/>',
    sound: oink,
  },
  {
    color: { top: '#5fd04f', side: '#369a2c' },
    outline: '<circle cx="31" cy="27" r="16"/><circle cx="69" cy="27" r="16"/><ellipse cx="50" cy="60" rx="43" ry="32"/>',
    under: '<circle cx="22" cy="64" r="6" fill="#ff9fb0"/><circle cx="78" cy="64" r="6" fill="#ff9fb0"/>',
    over: '',
    sound: ribbit,
  },
  {
    color: { top: '#ffd93b', side: '#d9a300' },
    outline: '<polygon points="50,6 42,22 58,22" stroke-width="6" stroke-linejoin="round"/><ellipse cx="12" cy="58" rx="9" ry="15"/><ellipse cx="88" cy="58" rx="9" ry="15"/><circle cx="50" cy="55" r="38"/>',
    under: '',
    over: '<polygon points="41,57 59,57 50,69" fill="#ff8a1f" stroke="#ff8a1f" stroke-width="3" stroke-linejoin="round"/>',
    sound: cheep,
  },
];

const WHEEL = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#23203f"/><circle cx="${x}" cy="${y}" r="${r * 0.4}" fill="#c9cde0"/>`;
const WINDOW_BLUE = '#bfe9ff';

const VEHICLES = [
  {
    color: COLORS[0],
    outline: '<rect x="24" y="10" width="52" height="34" rx="12"/><rect x="5" y="30" width="90" height="46" rx="16"/>',
    under: `<rect x="32" y="15" width="36" height="13" rx="4" fill="${WINDOW_BLUE}"/>`,
    over: `${WHEEL(24, 78, 12)}${WHEEL(76, 78, 12)}<circle cx="12" cy="56" r="4" fill="#fff3b0"/><circle cx="88" cy="56" r="4" fill="#fff3b0"/>`,
    sound: honk,
  },
  {
    color: COLORS[1],
    outline: '<rect x="7" y="8" width="86" height="72" rx="14"/>',
    under: `<rect x="14" y="15" width="72" height="14" rx="4" fill="${WINDOW_BLUE}"/>`,
    over: `${WHEEL(27, 81, 11)}${WHEEL(73, 81, 11)}`,
    sound: busHorn,
  },
  {
    color: COLORS[3],
    outline: '<rect x="38" y="4" width="24" height="24" rx="5"/><rect x="14" y="24" width="72" height="54" rx="14"/>',
    under: '<rect x="34" y="4" width="32" height="8" rx="4" fill="#23203f"/>',
    over: `${WHEEL(28, 82, 10)}${WHEEL(50, 82, 10)}${WHEEL(72, 82, 10)}`,
    sound: choo,
  },
  {
    color: { top: '#e9efff', side: '#a9b4d6' },
    outline: '<rect x="2" y="26" width="96" height="46" rx="23"/>',
    under: '<polygon points="74,30 86,6 96,6 94,34" fill="#ff5a4f" stroke="#ff5a4f" stroke-width="4" stroke-linejoin="round"/><circle cx="14" cy="45" r="5" fill="#bfe9ff"/><circle cx="82" cy="45" r="4" fill="#bfe9ff"/>',
    over: '<polygon points="40,70 66,70 74,94 56,94" fill="#ff5a4f" stroke="#ff5a4f" stroke-width="4" stroke-linejoin="round"/>',
    sound: whoosh,
  },
  {
    color: COLORS[2],
    outline: '<rect x="54" y="4" width="14" height="24" rx="3"/><rect x="24" y="24" width="52" height="36" rx="9"/><path d="M4 54H96L82 88Q50 96 18 88Z" stroke-width="4" stroke-linejoin="round"/>',
    under: '<rect x="54" y="4" width="14" height="7" rx="2" fill="#ff5a4f"/><path d="M12 74H88L85 81H15Z" fill="#fff"/>',
    over: '',
    sound: boatHorn,
  },
  {
    color: COLORS[5],
    outline: '<rect x="4" y="8" width="84" height="8" rx="4"/><rect x="42" y="12" width="8" height="18" rx="2"/><rect x="76" y="50" width="22" height="9" rx="4"/><rect x="90" y="40" width="7" height="24" rx="3"/><ellipse cx="46" cy="56" rx="38" ry="32"/>',
    under: '',
    over: '<path d="M26 92H66" stroke="#23203f" stroke-width="5" stroke-linecap="round"/>',
    sound: rotor,
  },
];

function ringOfCircles(count, ringRadius, radius) {
  let circles = '';
  for (let i = 0; i < count; i++) {
    const angle = ((Math.PI * 2) / count) * i;
    circles += `<circle cx="${50 + ringRadius * Math.cos(angle)}" cy="${50 + ringRadius * Math.sin(angle)}" r="${radius}"/>`;
  }
  return circles;
}

function spikyPoints(count, outer, inner) {
  const points = [];
  for (let i = 0; i < count * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / count) * i;
    points.push(`${50 + radius * Math.cos(angle)},${52 + radius * Math.sin(angle)}`);
  }
  return points.join(' ');
}

const NOSTRILS = (y, color) => `<ellipse cx="42" cy="${y}" rx="3" ry="2.5" fill="${color}"/><ellipse cx="58" cy="${y}" rx="3" ry="2.5" fill="${color}"/>`;
const BEAK = '<polygon points="41,57 59,57 50,69" fill="#ff8a1f" stroke="#ff8a1f" stroke-width="3" stroke-linejoin="round"/>';

const SEA_ANIMALS = [
  {
    color: COLORS[5],
    outline: '<polygon points="76,52 98,28 98,76" stroke-width="8" stroke-linejoin="round"/><polygon points="34,26 52,10 62,26" stroke-width="6" stroke-linejoin="round"/><ellipse cx="46" cy="52" rx="40" ry="30"/>',
    under: '<path d="M74 40q6 12 0 24" fill="none" stroke="#cf6410" stroke-width="3" stroke-linecap="round"/>',
    over: '',
    sound: blub,
  },
  {
    color: COLORS[1],
    outline: `<polygon points="${spikyPoints(16, 47, 37)}" stroke-width="4" stroke-linejoin="round"/>`,
    under: '<ellipse cx="50" cy="74" rx="24" ry="12" fill="#fff3b0"/>',
    over: '',
    sound: whoosh,
  },
  {
    color: { top: '#ff9ad5', side: '#cc5fa3' },
    outline: '<path d="M10 70A40 40 0 0 1 90 70Q80 76 70 70Q60 76 50 70Q40 76 30 70Q20 76 10 70Z"/><path d="M24 74q-6 10 0 20M42 76q6 10 0 20M58 76q-6 10 0 20M76 74q6 10 0 20" fill="none" stroke-width="6" stroke-linecap="round"/>',
    under: '',
    over: '',
    sound: chime,
  },
  {
    color: COLORS[0],
    outline: '<path d="M24 44L16 34M76 44L84 34" stroke-width="8" stroke-linecap="round"/><path d="M18 70L4 78M18 60L4 62M82 70L96 78M82 60L96 62" stroke-width="6" stroke-linecap="round"/><circle cx="14" cy="28" r="12"/><circle cx="86" cy="28" r="12"/><ellipse cx="50" cy="60" rx="36" ry="26"/>',
    under: '',
    over: '',
    sound: clack,
  },
  {
    color: { top: '#a77bff', side: '#7448d1' },
    outline: '<path d="M22 62q-8 18 2 30M40 70q-4 16 4 26M60 70q4 16 -4 26M78 62q8 18 -2 30" fill="none" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="42" r="34"/>',
    under: '',
    over: '',
    sound: blub,
  },
  {
    color: COLORS[3],
    outline: '<path d="M8 60Q8 24 50 24Q84 24 88 52L98 36V72L86 62Q80 84 46 84Q8 84 8 60Z"/>',
    under: '<path d="M14 66Q46 86 82 64Q78 82 46 82Q18 82 14 66Z" fill="#bfe9ff"/>',
    over: '<path d="M50 22V8M50 14Q40 4 32 8M50 14Q60 4 68 8" fill="none" stroke="#bfe9ff" stroke-width="4" stroke-linecap="round"/>',
    sound: whaleSong,
  },
];

const SAFARI_ANIMALS = [
  {
    color: { top: '#c8742a', side: '#97520f' },
    outline: `${ringOfCircles(10, 34, 14)}<circle cx="50" cy="50" r="36"/>`,
    under: '<circle cx="28" cy="28" r="7" fill="#ffc34d"/><circle cx="72" cy="28" r="7" fill="#ffc34d"/><circle cx="50" cy="52" r="29" fill="#ffc34d"/>',
    over: '<path d="M45 55h10l-5 5z" fill="#6b3a10"/>',
    sound: roar,
  },
  {
    color: { top: '#a3aed0', side: '#6f7aa0' },
    outline: '<ellipse cx="16" cy="46" rx="16" ry="24"/><ellipse cx="84" cy="46" rx="16" ry="24"/><circle cx="50" cy="44" r="32"/><path d="M50 58Q48 88 66 88" fill="none" stroke-width="15" stroke-linecap="round"/>',
    under: '<ellipse cx="16" cy="46" rx="9" ry="16" fill="#ffc2dc"/><ellipse cx="84" cy="46" rx="9" ry="16" fill="#ffc2dc"/>',
    over: '',
    sound: trumpet,
  },
  {
    color: { top: '#ffcf4a', side: '#d99a12' },
    outline: '<rect x="32" y="8" width="7" height="22" rx="3"/><rect x="61" y="8" width="7" height="22" rx="3"/><ellipse cx="14" cy="38" rx="13" ry="6"/><ellipse cx="86" cy="38" rx="13" ry="6"/><ellipse cx="50" cy="56" rx="32" ry="36"/>',
    under: '<circle cx="35.5" cy="9" r="6" fill="#a8622a"/><circle cx="64.5" cy="9" r="6" fill="#a8622a"/><circle cx="26" cy="72" r="6" fill="#c9782f"/><circle cx="76" cy="70" r="7" fill="#c9782f"/><circle cx="72" cy="28" r="5" fill="#c9782f"/><ellipse cx="50" cy="74" rx="18" ry="12" fill="#ffe7a8"/>',
    over: '',
    sound: hop,
  },
  {
    color: { top: '#f4f4ff', side: '#b7b9d6' },
    outline: '<polygon points="24,30 26,6 42,20" stroke-width="6" stroke-linejoin="round"/><polygon points="76,30 74,6 58,20" stroke-width="6" stroke-linejoin="round"/><ellipse cx="50" cy="54" rx="32" ry="38"/>',
    under: '<path d="M50 16V30M38 20L42 32M62 20L58 32M19 46H29M71 46H81M20 58H30M70 58H80" stroke="#23203f" stroke-width="5" stroke-linecap="round"/><ellipse cx="50" cy="76" rx="20" ry="14" fill="#9aa0c4"/>',
    over: NOSTRILS(80, '#23203f'),
    sound: neigh,
  },
  {
    color: { top: '#a8683a', side: '#7a4520' },
    outline: '<circle cx="14" cy="48" r="12"/><circle cx="86" cy="48" r="12"/><circle cx="50" cy="52" r="36"/>',
    under: '<circle cx="14" cy="48" r="6" fill="#f2c9a0"/><circle cx="86" cy="48" r="6" fill="#f2c9a0"/><circle cx="38" cy="45" r="14" fill="#f2c9a0"/><circle cx="62" cy="45" r="14" fill="#f2c9a0"/><ellipse cx="50" cy="66" rx="22" ry="16" fill="#f2c9a0"/>',
    over: '',
    sound: monkey,
  },
  {
    color: { top: '#a58fc9', side: '#7660a0' },
    outline: '<circle cx="28" cy="16" r="8"/><circle cx="72" cy="16" r="8"/><ellipse cx="50" cy="40" rx="30" ry="26"/><ellipse cx="50" cy="66" rx="42" ry="24"/>',
    under: '<circle cx="28" cy="16" r="4" fill="#ffc2dc"/><circle cx="72" cy="16" r="4" fill="#ffc2dc"/>',
    over: '<ellipse cx="28" cy="64" rx="4" ry="3" fill="#4d3a73"/><ellipse cx="72" cy="64" rx="4" ry="3" fill="#4d3a73"/>',
    sound: growl,
  },
];

const FARM = [
  {
    color: { top: '#f7f4ef', side: '#c5bfb3' },
    outline: '<ellipse cx="14" cy="38" rx="13" ry="7"/><ellipse cx="86" cy="38" rx="13" ry="7"/><ellipse cx="50" cy="52" rx="32" ry="38"/>',
    under: '<path d="M30 20Q18 16 16 4M70 20Q82 16 84 4" fill="none" stroke="#e3c98f" stroke-width="7" stroke-linecap="round"/><ellipse cx="30" cy="28" rx="10" ry="7" fill="#23203f"/><ellipse cx="74" cy="60" rx="6" ry="10" fill="#23203f"/><ellipse cx="50" cy="74" rx="26" ry="16" fill="#ffb9d6"/>',
    over: NOSTRILS(78, '#cc5a8c'),
    sound: moo,
  },
  {
    color: { top: '#ffffff', side: '#c9cde3' },
    outline: `${ringOfCircles(9, 32, 15)}<circle cx="50" cy="50" r="34"/>`,
    under: '<ellipse cx="16" cy="46" rx="11" ry="6" fill="#d9c4a8"/><ellipse cx="84" cy="46" rx="11" ry="6" fill="#d9c4a8"/><ellipse cx="50" cy="54" rx="26" ry="30" fill="#e8d9c4"/>',
    over: '',
    sound: baa,
  },
  {
    color: { top: '#c07a3e', side: '#8b521f' },
    outline: '<polygon points="28,24 30,4 44,16" stroke-width="6" stroke-linejoin="round"/><polygon points="72,24 70,4 56,16" stroke-width="6" stroke-linejoin="round"/><ellipse cx="50" cy="52" rx="30" ry="40"/>',
    under: '<path d="M38 16Q50 4 62 16L58 26H42Z" fill="#5a3414"/><ellipse cx="50" cy="76" rx="22" ry="15" fill="#e3b07f"/>',
    over: NOSTRILS(80, '#5a3414'),
    sound: neigh,
  },
  {
    color: { top: '#fbfbff', side: '#c3c6dd' },
    outline: '<path d="M50 18Q54 4 64 6" fill="none" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="52" r="36"/>',
    under: '',
    over: '<ellipse cx="50" cy="66" rx="18" ry="8" fill="#ff8a1f"/><path d="M34 66H66" stroke="#cf6410" stroke-width="2"/>',
    sound: quack,
  },
  {
    color: { top: '#fff1d6', side: '#d9b98a' },
    outline: '<circle cx="50" cy="54" r="36"/>',
    under: '<circle cx="38" cy="20" r="9" fill="#ff5a4f"/><circle cx="50" cy="15" r="10" fill="#ff5a4f"/><circle cx="62" cy="20" r="9" fill="#ff5a4f"/>',
    over: `${BEAK}<ellipse cx="50" cy="77" rx="6" ry="8" fill="#ff5a4f"/>`,
    sound: crow,
  },
  {
    color: { top: '#3fae49', side: '#23762c' },
    outline: '<rect x="74" y="8" width="7" height="24" rx="3"/><rect x="10" y="10" width="46" height="56" rx="8"/><rect x="36" y="32" width="58" height="36" rx="8"/>',
    under: `<rect x="17" y="16" width="32" height="12" rx="3" fill="${WINDOW_BLUE}"/>`,
    over: `${WHEEL(26, 77, 16)}${WHEEL(80, 80, 12)}`,
    sound: putput,
  },
];

// The player moves on to the next set at every party.
const FIGURE_SETS = [SHAPES, ANIMALS, SEA_ANIMALS, VEHICLES, SAFARI_ANIMALS, FARM];

const FACE = `
  <g class="face-idle">
    <g class="eyes">
      <circle cx="37" cy="44" r="9" fill="#fff"/><circle cx="63" cy="44" r="9" fill="#fff"/>
      <circle cx="39" cy="45" r="4.5" fill="#23203f"/><circle cx="65" cy="45" r="4.5" fill="#23203f"/>
    </g>
    <path d="M38 61q12 11 24 0" fill="none" stroke="#23203f" stroke-width="4.5" stroke-linecap="round"/>
  </g>
  <g class="face-pressed">
    <circle cx="36" cy="42" r="11" fill="#fff"/><circle cx="64" cy="42" r="11" fill="#fff"/>
    <circle cx="36" cy="42" r="4" fill="#23203f"/><circle cx="64" cy="42" r="4" fill="#23203f"/>
    <ellipse cx="50" cy="65" rx="8" ry="10" fill="#23203f"/>
  </g>`;

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

/* Sound: everything is synthesized, so the app has no audio files to load. */

let audio = null;
let master = null;

function unlockAudio() {
  // iOS silences web audio with the mute switch unless the session is "playback".
  if (navigator.audioSession) navigator.audioSession.type = 'playback';
  if (!audio) {
    audio = new AudioContext({ latencyHint: 'interactive' });
    const limiter = audio.createDynamicsCompressor();
    master = audio.createGain();
    master.gain.value = 0.5;
    master.connect(limiter).connect(audio.destination);
  }
  if (audio.state !== 'running') {
    audio.resume().catch(() => {});
    // iOS only starts audio for a sound played during the gesture, so play a silent one.
    const silence = audio.createBufferSource();
    silence.buffer = audio.createBuffer(1, 1, audio.sampleRate);
    silence.connect(audio.destination);
    silence.start();
  }
}

function tone(frequency, { to = frequency, type = 'sine', duration = 0.2, level = 0.6, delay = 0, vibrato = 0 } = {}) {
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope).connect(master);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
  if (vibrato) {
    // Wobbles the pitch, which makes animal voices sound alive.
    const wobble = audio.createOscillator();
    const depth = audio.createGain();
    wobble.frequency.value = 7;
    depth.gain.value = frequency * vibrato;
    wobble.connect(depth).connect(oscillator.frequency);
    wobble.start(start);
    wobble.stop(start + duration + 0.02);
  }
}

function bloop(note) {
  tone(note * 0.6, { to: note * 1.6, duration: 0.2 });
}

function xylophone(note) {
  tone(note, { duration: 0.4 });
  tone(note * 4, { duration: 0.08, level: 0.2 });
}

function chime(note) {
  [1, 1.25, 1.5].forEach((step, i) => {
    tone(note * step, { type: 'triangle', duration: 0.3, level: 0.45, delay: i * 0.07 });
  });
}

function booBoop(note) {
  tone(note * 0.75, { duration: 0.13 });
  tone(note * 1.125, { duration: 0.2, delay: 0.12 });
}

function boing(note) {
  tone(note * 0.4, { to: note * 1.4, type: 'triangle', duration: 0.16 });
  tone(note * 1.4, { to: note * 0.7, type: 'triangle', duration: 0.2, delay: 0.14, level: 0.4 });
}

function squeak(note) {
  tone(note * 1.5, { to: note * 2.2, duration: 0.1, level: 0.35 });
  tone(note * 2.2, { to: note * 1.6, duration: 0.14, delay: 0.09, level: 0.35 });
}

function meow(note) {
  const pitch = note / 700;
  tone(520 * pitch, { to: 900 * pitch, type: 'triangle', duration: 0.14 });
  tone(900 * pitch, { to: 460 * pitch, type: 'triangle', duration: 0.28, delay: 0.13 });
}

function hop(note) {
  tone(note, { to: note * 1.8, duration: 0.09, level: 0.45 });
  tone(note * 1.2, { to: note * 2.2, duration: 0.09, delay: 0.11, level: 0.45 });
}

function growl(note) {
  const pitch = note / 700;
  tone(240 * pitch, { to: 150 * pitch, type: 'sawtooth', duration: 0.32, level: 0.35 });
}

function oink(note) {
  const pitch = note / 700;
  tone(340 * pitch, { to: 230 * pitch, type: 'sawtooth', duration: 0.12, level: 0.3 });
  tone(380 * pitch, { to: 250 * pitch, type: 'sawtooth', duration: 0.14, delay: 0.14, level: 0.3 });
}

function ribbit(note) {
  const pitch = note / 700;
  tone(220 * pitch, { to: 330 * pitch, type: 'square', duration: 0.08, level: 0.22 });
  tone(260 * pitch, { to: 400 * pitch, type: 'square', duration: 0.12, delay: 0.1, level: 0.22 });
}

function cheep(note) {
  tone(note * 2.6, { to: note * 3.4, duration: 0.08, level: 0.35 });
  tone(note * 2.8, { to: note * 3.6, duration: 0.1, delay: 0.12, level: 0.35 });
}

function honk(note) {
  const pitch = note / 700;
  tone(440 * pitch, { type: 'square', duration: 0.11, level: 0.2 });
  tone(440 * pitch, { type: 'square', duration: 0.16, delay: 0.16, level: 0.2 });
}

function busHorn(note) {
  const pitch = note / 700;
  tone(300 * pitch, { type: 'sawtooth', duration: 0.32, level: 0.22 });
  tone(375 * pitch, { type: 'sawtooth', duration: 0.32, level: 0.22 });
}

function choo(note) {
  const pitch = note / 700;
  tone(660 * pitch, { type: 'triangle', duration: 0.2, level: 0.4 });
  tone(880 * pitch, { type: 'triangle', duration: 0.2, level: 0.3 });
  tone(660 * pitch, { type: 'triangle', duration: 0.32, delay: 0.24, level: 0.4 });
  tone(880 * pitch, { type: 'triangle', duration: 0.32, delay: 0.24, level: 0.3 });
}

function whoosh(note) {
  tone(note * 0.4, { to: note * 2, duration: 0.45, level: 0.4 });
}

function boatHorn(note) {
  const pitch = note / 700;
  tone(220 * pitch, { type: 'sawtooth', duration: 0.5, level: 0.25 });
  tone(330 * pitch, { type: 'sawtooth', duration: 0.5, level: 0.18 });
}

function rotor(note) {
  const pitch = note / 700;
  for (let i = 0; i < 7; i++) {
    tone(200 * pitch, { type: 'square', duration: 0.04, delay: i * 0.06, level: 0.22 });
  }
}

function blub(note) {
  for (let i = 0; i < 3; i++) {
    const step = 1 + i * 0.15;
    tone(note * 0.7 * step, { to: note * 1.5 * step, duration: 0.07, delay: i * 0.09, level: 0.4 });
  }
}

function clack(note) {
  const pitch = note / 700;
  tone(1200 * pitch, { type: 'square', duration: 0.03, level: 0.2 });
  tone(1000 * pitch, { type: 'square', duration: 0.03, delay: 0.1, level: 0.2 });
}

function whaleSong(note) {
  const pitch = note / 700;
  tone(300 * pitch, { to: 520 * pitch, duration: 0.35, level: 0.45 });
  tone(520 * pitch, { to: 260 * pitch, duration: 0.45, delay: 0.33, level: 0.4 });
}

function roar(note) {
  const pitch = note / 700;
  tone(260 * pitch, { to: 110 * pitch, type: 'sawtooth', duration: 0.5, level: 0.35, vibrato: 0.08 });
}

function trumpet(note) {
  const pitch = note / 700;
  tone(400 * pitch, { to: 800 * pitch, type: 'sawtooth', duration: 0.45, level: 0.25, vibrato: 0.04 });
}

function monkey(note) {
  const pitch = note / 700;
  tone(500 * pitch, { to: 900 * pitch, duration: 0.12, level: 0.4 });
  tone(500 * pitch, { to: 900 * pitch, duration: 0.12, delay: 0.14, level: 0.4 });
  tone(700 * pitch, { to: 1300 * pitch, duration: 0.18, delay: 0.28, level: 0.4 });
}

function moo(note) {
  const pitch = note / 700;
  tone(220 * pitch, { to: 160 * pitch, type: 'sawtooth', duration: 0.7, level: 0.3 });
}

function baa(note) {
  const pitch = note / 700;
  tone(420 * pitch, { to: 380 * pitch, type: 'sawtooth', duration: 0.5, level: 0.22, vibrato: 0.06 });
}

function neigh(note) {
  const pitch = note / 700;
  tone(900 * pitch, { to: 500 * pitch, type: 'triangle', duration: 0.5, level: 0.35, vibrato: 0.08 });
}

function quack(note) {
  const pitch = note / 700;
  tone(500 * pitch, { to: 400 * pitch, type: 'square', duration: 0.12, level: 0.18 });
  tone(500 * pitch, { to: 400 * pitch, type: 'square', duration: 0.12, delay: 0.16, level: 0.18 });
}

function crow(note) {
  const pitch = note / 700;
  [[600, 0.1], [800, 0.1], [800, 0.1], [700, 0.35]].reduce((delay, [frequency, duration]) => {
    tone(frequency * pitch, { type: 'triangle', duration, delay, level: 0.4 });
    return delay + duration + 0.02;
  }, 0);
}

function putput(note) {
  const pitch = note / 700;
  for (let i = 0; i < 5; i++) {
    tone(160 * pitch, { type: 'square', duration: 0.05, delay: i * 0.09, level: 0.25 });
  }
}

function fanfare() {
  NOTES.forEach((note, i) => {
    tone(note, { type: 'triangle', duration: 0.3, level: 0.45, delay: i * 0.09 });
  });
}

/* Buttons */

const toys = [];
let popCount = 0;

function baseSize() {
  const shortSide = Math.min(stage.clientWidth, stage.clientHeight);
  return Math.max(88, Math.min(170, shortSide * 0.24));
}

function maxToys() {
  const size = baseSize();
  const fit = Math.floor((stage.clientWidth * stage.clientHeight) / (size * size * 2.6));
  return Math.max(4, Math.min(10, fit));
}

function findFreeSpot(radius) {
  const maxX = stage.clientWidth - radius * 2;
  // Leaves room below for the thick edge and the bobbing.
  const maxY = stage.clientHeight - radius * 2.3;
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = radius + Math.random() * maxX;
    const y = radius + Math.random() * maxY;
    const isFree = toys.every((toy) => Math.hypot(toy.x - x, toy.y - y) > toy.radius + radius + 6);
    if (isFree) return { x, y };
  }
  return null;
}

function placeToy(toy) {
  toy.element.style.left = `${toy.x - toy.radius}px`;
  toy.element.style.top = `${toy.y - toy.radius}px`;
}

function pickFigure() {
  const set = FIGURE_SETS[Math.floor(popCount / PARTY_EVERY) % FIGURE_SETS.length];
  const shape = randomItem(set);
  return { shape, color: shape.color || randomItem(COLORS) };
}

function createToyElement(radius, { shape, color }) {
  const element = document.createElement('div');
  element.className = 'toy';
  element.style.width = element.style.height = `${radius * 2}px`;
  element.style.setProperty('--delay', `${-Math.random() * 5}s`);
  element.innerHTML = `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <g fill="${color.side}" stroke="${color.side}" transform="translate(0 6)">${shape.outline}</g>
      <g fill="${color.top}" stroke="${color.top}">${shape.outline}</g>
      ${shape.under || ''}
      ${FACE}
      ${shape.over || ''}
    </svg>`;
  return element;
}

function spawnToy() {
  const radius = (baseSize() * (0.85 + Math.random() * 0.3)) / 2;
  const spot = findFreeSpot(radius);
  if (!spot) return;

  const figure = pickFigure();
  const element = createToyElement(radius, figure);
  stage.append(element);

  const toy = { element, ...figure, radius, ...spot };
  placeToy(toy);
  toys.push(toy);
}

function changeToys() {
  toys.forEach((toy) => {
    const figure = pickFigure();
    const element = createToyElement(toy.radius, figure);
    toy.element.replaceWith(element);
    Object.assign(toy, figure, { element });
    placeToy(toy);
  });
}

function burst(x, y, colors, count, reach) {
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    const size = 8 + Math.random() * 12;
    const angle = Math.random() * Math.PI * 2;
    const distance = reach * (0.5 + Math.random() * 0.5);
    spark.className = 'spark';
    spark.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;background:${randomItem(colors)}`;
    stage.append(spark);
    const flight = spark.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 450 + Math.random() * 250, easing: 'cubic-bezier(0.1, 0.7, 0.3, 1)' },
    );
    flight.onfinish = () => spark.remove();
  }
}

function party() {
  fanfare();
  const colors = COLORS.map((color) => color.top);
  burst(stage.clientWidth / 2, stage.clientHeight / 2, colors, 50, Math.max(stage.clientWidth, stage.clientHeight) * 0.6);
  toys.forEach((toy) => {
    toy.element.classList.add('jump');
    setTimeout(() => toy.element.classList.remove('jump'), 600);
  });
}

function pressToy(toy) {
  toys.splice(toys.indexOf(toy), 1);
  toy.shape.sound(randomItem(NOTES));
  toy.element.classList.add('pressed');
  setTimeout(() => {
    toy.element.remove();
    burst(toy.x, toy.y, [toy.color.top, '#ffffff'], 12, toy.radius * 2);
  }, PRESS_ANIMATION_MS);

  popCount++;
  if (popCount % PARTY_EVERY === 0) {
    changeToys();
    party();
  }
  if (toys.length < 2) spawnToy();
}

function nearestToy(x, y) {
  let nearest = null;
  let nearestGap = TOUCH_MARGIN_PX;
  toys.forEach((toy) => {
    const gap = Math.hypot(toy.x - x, toy.y - y) - toy.radius;
    if (gap < nearestGap) {
      nearest = toy;
      nearestGap = gap;
    }
  });
  return nearest;
}

function onPointerDown(event) {
  unlockAudio();
  keepScreenAwake();
  const bounds = stage.getBoundingClientRect();
  const toy = nearestToy(event.clientX - bounds.left, event.clientY - bounds.top);
  if (toy) pressToy(toy);
}

function onKeyDown(event) {
  if (event.repeat || event.metaKey || event.ctrlKey) return;
  unlockAudio();
  if (toys.length) pressToy(randomItem(toys));
}

/* Screen and browser behaviour */

let wakeLock = null;

function keepScreenAwake() {
  if (wakeLock || !navigator.wakeLock || document.visibilityState !== 'visible') return;
  wakeLock = {};
  navigator.wakeLock.request('screen').then((lock) => {
    wakeLock = lock;
    lock.addEventListener('release', () => { wakeLock = null; });
  }).catch(() => { wakeLock = null; });
}

function fillStage() {
  toys.splice(0).forEach((toy) => toy.element.remove());
  for (let i = 0; i < 4; i++) spawnToy();
}

let stageWidth = stage.clientWidth;
let stageHeight = stage.clientHeight;

// Button sizes and spots depend on the screen, so start over when it rotates.
function onResize() {
  if (stage.clientWidth === stageWidth && stage.clientHeight === stageHeight) return;
  stageWidth = stage.clientWidth;
  stageHeight = stage.clientHeight;
  fillStage();
}

stage.addEventListener('pointerdown', onPointerDown);
window.addEventListener('keydown', onKeyDown);
window.addEventListener('resize', onResize);

// iOS only lets audio start at the end of a touch, so the first press unlocks it here too.
['pointerup', 'touchend', 'click'].forEach((type) => {
  window.addEventListener(type, unlockAudio);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') keepScreenAwake();
});

// Block every gesture that could zoom, scroll or open a menu.
['gesturestart', 'gesturechange', 'contextmenu', 'dragstart', 'selectstart'].forEach((type) => {
  document.addEventListener(type, (event) => event.preventDefault());
});
document.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });

setInterval(() => {
  if (document.visibilityState === 'visible' && toys.length < maxToys()) spawnToy();
}, SPAWN_INTERVAL_MS);

fillStage();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
