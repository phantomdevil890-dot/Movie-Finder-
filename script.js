'use strict';

/* ============================================================
   WORD POOLS
   ============================================================ */
const WORDS = {
  easy: [
    "the","be","to","of","and","a","in","that","have","it","for","not","on",
    "with","he","as","you","do","at","this","but","his","by","from","they","we",
    "say","her","she","or","an","will","my","one","all","would","there","their",
    "what","so","up","out","if","about","who","get","which","go","me","when",
    "make","can","like","time","no","just","him","know","take","people","into",
    "year","your","good","some","could","them","see","other","than","then","now",
    "look","only","come","its","over","think","also","back","after","use","two",
    "how","our","work","first","well","way","even","new","want","because","any",
    "these","give","day","most","us","great","between","need","large","often",
    "hand","high","place","hold","turn","here","why","help","talk","again","off",
    "play","small","home","read","set","put","end","add","move","live","walk",
    "door","stop","side","car","night","light","city","paper","group","dog","tree",
    "road","bird","book","open","start","bring","show","keep","find","call","ask",
    "feel","leave","point","number","while","own","mean","try","kind","real","long",
    "last","never","next","hard","old","life","few","north","open","seem","side",
    "head","face","above","since","hot","fire","both","near","form","plan","cut"
  ],
  hard: [
    "algorithm","threshold","prerequisite","accomplish","implement","phenomenon",
    "subsequent","acknowledge","demonstrate","environment","particular","opportunity",
    "communicate","information","technology","relationship","responsibility",
    "understanding","development","organization","professional","performance",
    "considerable","representative","approximately","manufacturing","determination",
    "administration","international","configuration","infrastructure","architecture",
    "comprehensive","sophisticated","extraordinary","establishment","concentration",
    "documentation","interpretation","authentication","specification","optimization",
    "visualization","implementation","crystallization","cryptocurrency","simultaneously",
    "controversial","predominantly","consequently","differentiation","accomplishment",
    "circumstances","consciousness","discrepancy","embarrassment","exaggeration",
    "fundamental","governmental","independence","jurisdiction","knowledgeable",
    "legislation","magnificent","nevertheless","orchestration","perseverance",
    "qualification","reconnaissance","surveillance","terminology","uncomfortable",
    "vulnerability","catastrophic","deliberately","efficiently","fragmentation",
    "globalization","hierarchical","illumination","justification","overwhelming",
    "psychological","quantitative","reinforcement","substantial","transformation",
    "unprecedented","versatility","entrepreneurial","philosophical","mathematical",
    "experimental","revolutionary","interconnected","multidimensional","miscellaneous",
    "characteristics","abbreviation","accommodation","acknowledgement","bureaucratic"
  ]
};

/* ============================================================
   STATE
   ============================================================ */
let difficulty     = 'easy';
let totalTime      = 30;
let timeLeft       = 30;
let timerInterval  = null;
let sampleInterval = null;
let isRunning      = false;
let isFinished     = false;

let words          = [];
let wordEls        = [];
let wordNatOffsets = []; // natural offsetTop for each word (measured once after render)

let currentWordIdx  = 0;
let currentCharIdx  = 0;
let correctChars    = 0;
let totalTyped      = 0;
let wpmHistory      = [];

let caretEl      = null;
let blinkTimer   = null;

/* ============================================================
   DOM REFS
   ============================================================ */
const wordsDisplay      = document.getElementById('wordsDisplay');
const inputField        = document.getElementById('inputField');
const timerDisplay      = document.getElementById('timerDisplay');
const timerRing         = document.getElementById('timerRing');
const wpmDisplay        = document.getElementById('wpmDisplay');
const accDisplay        = document.getElementById('accDisplay');
const restartBtn        = document.getElementById('restartBtn');
const cursorHint        = document.getElementById('cursorHint');
const typingArea        = document.getElementById('typingArea');
const resultsOverlay    = document.getElementById('resultsOverlay');
const resultsRestartBtn = document.getElementById('resultsRestartBtn');

const CIRCUMFERENCE = 2 * Math.PI * 26; // ≈ 163.4

/* ============================================================
   INIT
   ============================================================ */
function init() {
  clearInterval(timerInterval);
  clearInterval(sampleInterval);

  isRunning      = false;
  isFinished     = false;
  currentWordIdx = 0;
  currentCharIdx = 0;
  correctChars   = 0;
  totalTyped     = 0;
  wpmHistory     = [];
  timeLeft       = totalTime;

  timerDisplay.textContent          = totalTime;
  timerRing.style.strokeDashoffset  = '0';
  timerRing.classList.remove('warning');
  wpmDisplay.textContent            = '—';
  accDisplay.textContent            = '—';
  inputField.value                  = '';
  wordsDisplay.style.marginTop      = '0px';

  resultsOverlay.classList.remove('visible');
  typingArea.classList.remove('active');
  cursorHint.classList.remove('hidden');

  buildWords();
  renderWords();
  setTimeout(() => inputField.focus(), 60);
}

/* ============================================================
   BUILD WORDS
   ============================================================ */
function buildWords() {
  const pool = WORDS[difficulty];
  words = [];
  for (let i = 0; i < 120; i++) {
    words.push(pool[Math.floor(Math.random() * pool.length)]);
  }
}

/* ============================================================
   RENDER WORDS
   ============================================================ */
function renderWords() {
  wordsDisplay.innerHTML = '';
  wordEls = [];
  wordNatOffsets = [];

  caretEl = document.createElement('span');
  caretEl.className = 'caret';

  words.forEach(word => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';

    word.split('').forEach(ch => {
      const charEl = document.createElement('span');
      charEl.className = 'char';
      charEl.textContent = ch;
      wordEl.appendChild(charEl);
    });

    wordEls.push(wordEl);
    wordsDisplay.appendChild(wordEl);
  });

  // Place caret at start of first word
  placeCaret();

  // Measure natural offsets after layout settles (2 frames)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const base = wordEls[0] ? wordEls[0].offsetTop : 0;
      wordNatOffsets = wordEls.map(el => el.offsetTop - base);
    });
  });
}

/* ============================================================
   PLACE CARET
   ============================================================ */
function placeCaret() {
  const wordEl = wordEls[currentWordIdx];
  if (!wordEl) return;

  const naturalChars = wordEl.querySelectorAll('.char:not(.extra)');

  if (currentCharIdx < naturalChars.length) {
    wordEl.insertBefore(caretEl, naturalChars[currentCharIdx]);
  } else {
    // After all natural + extra chars
    wordEl.appendChild(caretEl);
  }
}

/* ============================================================
   EVENTS — FOCUS / CLICK
   ============================================================ */
typingArea.addEventListener('click', () => {
  if (!isFinished) inputField.focus();
});

// If user starts typing anywhere on the page, focus input
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    init();
    return;
  }
  if (!isFinished && document.activeElement !== inputField && e.key.length === 1) {
    inputField.focus();
  }
});

/* ============================================================
   EVENTS — INPUT
   ============================================================ */
inputField.addEventListener('input', () => {
  if (isFinished) return;

  const val = inputField.value;

  // Start test on first character
  if (!isRunning && val.length > 0) startTest();
  if (!isRunning) return;

  // Hide hint
  cursorHint.classList.add('hidden');

  // Caret blink: pause while typing
  caretEl.classList.add('typing');
  clearTimeout(blinkTimer);
  blinkTimer = setTimeout(() => caretEl.classList.remove('typing'), 600);

  const currentWord = words[currentWordIdx];

  // Space = submit word
  if (val.endsWith(' ')) {
    submitWord(val.trimEnd(), currentWord);
    return;
  }

  // Live highlight
  currentCharIdx = val.length;
  highlightChars(val, currentWordIdx);
  placeCaret();
  updateLiveStats();
});

/* Prevent backspace crossing word boundary */
inputField.addEventListener('keydown', e => {
  if (e.key === 'Backspace' && inputField.value === '') {
    e.preventDefault();
  }
});

/* ============================================================
   SUBMIT WORD
   ============================================================ */
function submitWord(typed, correctWord) {
  // Tally characters
  for (let i = 0; i < correctWord.length; i++) {
    totalTyped++;
    if (i < typed.length && typed[i] === correctWord[i]) correctChars++;
  }
  if (typed.length > correctWord.length) {
    totalTyped += typed.length - correctWord.length;
  }

  finalizeWord(typed, currentWordIdx);

  currentWordIdx++;
  currentCharIdx = 0;
  inputField.value = '';

  if (currentWordIdx < wordEls.length) {
    placeCaret();
    scrollWords();
  }

  updateLiveStats();
}

/* ============================================================
   HIGHLIGHT CHARS (live, while typing)
   ============================================================ */
function highlightChars(typed, wi) {
  const wordEl = wordEls[wi];
  const natural = wordEl.querySelectorAll('.char:not(.extra)');

  // Remove stale extra chars
  wordEl.querySelectorAll('.char.extra').forEach(c => c.remove());

  natural.forEach((charEl, i) => {
    charEl.classList.remove('correct', 'wrong');
    if (i < typed.length) {
      charEl.classList.add(typed[i] === charEl.textContent ? 'correct' : 'wrong');
    }
  });

  // Extra chars beyond word length
  if (typed.length > natural.length) {
    for (let i = natural.length; i < typed.length; i++) {
      const extra = document.createElement('span');
      extra.className = 'char extra';
      extra.textContent = typed[i];
      wordEl.appendChild(extra);
    }
  }
}

/* ============================================================
   FINALIZE WORD (after space)
   ============================================================ */
function finalizeWord(typed, wi) {
  const wordEl = wordEls[wi];

  // Remove caret from this word
  if (caretEl.parentNode === wordEl) wordEl.removeChild(caretEl);

  // Remove extra chars
  wordEl.querySelectorAll('.char.extra').forEach(c => c.remove());

  // Mark each char final
  const natural = wordEl.querySelectorAll('.char');
  natural.forEach((charEl, i) => {
    charEl.classList.remove('correct', 'wrong');
    if (i < typed.length) {
      charEl.classList.add(typed[i] === charEl.textContent ? 'correct' : 'wrong');
    } else {
      charEl.classList.add('wrong'); // untyped chars = wrong
    }
  });
}

/* ============================================================
   SCROLL — keep current word on first visible line
   ============================================================ */
function scrollWords() {
  if (!wordNatOffsets.length) return;
  const relTop = wordNatOffsets[currentWordIdx] || 0;
  if (relTop > 0) {
    wordsDisplay.style.marginTop = `-${relTop}px`;
  }
}

/* ============================================================
   START TEST
   ============================================================ */
function startTest() {
  isRunning = true;
  typingArea.classList.add('active');
  cursorHint.classList.add('hidden');

  // Countdown tick
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    const offset = CIRCUMFERENCE * (1 - timeLeft / totalTime);
    timerRing.style.strokeDashoffset = offset;

    if (timeLeft <= 5) timerRing.classList.add('warning');
    if (timeLeft <= 0) finishTest();
  }, 1000);

  // WPM sample every second for chart
  sampleInterval = setInterval(() => {
    const elapsed = (totalTime - timeLeft) / 60;
    const wpm = elapsed > 0 ? Math.round((correctChars / 5) / elapsed) : 0;
    wpmHistory.push(Math.max(0, wpm));
  }, 1000);
}

/* ============================================================
   LIVE STATS UPDATE
   ============================================================ */
function updateLiveStats() {
  if (!isRunning) return;
  const elapsed = (totalTime - timeLeft) / 60;
  if (elapsed > 0) {
    wpmDisplay.textContent = Math.round((correctChars / 5) / elapsed);
  }
  if (totalTyped > 0) {
    accDisplay.textContent = Math.round((correctChars / totalTyped) * 100) + '%';
  }
}

/* ============================================================
   FINISH TEST
   ============================================================ */
function finishTest() {
  clearInterval(timerInterval);
  clearInterval(sampleInterval);
  isFinished = true;
  isRunning  = false;
  inputField.blur();

  const elapsed = totalTime / 60;
  const wpm = Math.round((correctChars / 5) / elapsed);
  const raw = Math.round((totalTyped / 5) / elapsed);
  const acc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;

  document.getElementById('resultWpm').textContent  = wpm;
  document.getElementById('resultRaw').textContent  = raw;
  document.getElementById('resultAcc').textContent  = acc + '%';
  document.getElementById('resultTime').textContent = totalTime + 's';

  setTimeout(() => {
    resultsOverlay.classList.add('visible');
    drawChart();
  }, 380);
}

/* ============================================================
   DRAW WPM CHART
   ============================================================ */
function drawChart() {
  const canvas = document.getElementById('wpmChart');
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const data   = wpmHistory.length >= 2 ? wpmHistory : [0, 0];
  const maxVal = Math.max(...data, 20);
  const pad    = { t: 8, r: 8, b: 18, l: 28 };
  const cW     = W - pad.l - pad.r;
  const cH     = H - pad.t - pad.b;
  const n      = data.length;

  const px = i => pad.l + (i / (n - 1)) * cW;
  const py = v => pad.t + cH * (1 - v / maxVal);

  // Grid lines
  ctx.strokeStyle = '#1e1e1e';
  ctx.lineWidth   = 1;
  [0, 0.5, 1].forEach(t => {
    const y = pad.t + cH * (1 - t);
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + cW, y);
    ctx.stroke();
    ctx.fillStyle  = '#404040';
    ctx.font       = `9px "JetBrains Mono", monospace`;
    ctx.textAlign  = 'right';
    ctx.fillText(Math.round(maxVal * t), pad.l - 4, y + 3.5);
  });

  // Gradient area fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
  grad.addColorStop(0, 'rgba(200, 169, 110, 0.28)');
  grad.addColorStop(1, 'rgba(200, 169, 110, 0)');

  ctx.beginPath();
  data.forEach((v, i) => {
    i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v));
  });
  ctx.lineTo(px(n - 1), pad.t + cH);
  ctx.lineTo(px(0),     pad.t + cH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  data.forEach((v, i) => {
    i === 0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v));
  });
  ctx.strokeStyle = '#c8a96e';
  ctx.lineWidth   = 1.8;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';
  ctx.stroke();

  // Dots
  ctx.fillStyle = '#c8a96e';
  data.forEach((v, i) => {
    ctx.beginPath();
    ctx.arc(px(i), py(v), 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // X-axis labels (start / mid / end)
  ctx.fillStyle = '#404040';
  ctx.font      = `9px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  [0, Math.floor((n - 1) / 2), n - 1].forEach(i => {
    ctx.fillText((i + 1) + 's', px(i), H - 2);
  });
}

/* ============================================================
   CONTROLS
   ============================================================ */
document.getElementById('difficultyGroup').addEventListener('click', e => {
  const btn = e.target.closest('.ctrl-btn');
  if (!btn || btn.classList.contains('active')) return;
  document.querySelectorAll('#difficultyGroup .ctrl-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  difficulty = btn.dataset.difficulty;
  init();
});

document.getElementById('timerGroup').addEventListener('click', e => {
  const btn = e.target.closest('.ctrl-btn');
  if (!btn || btn.classList.contains('active')) return;
  document.querySelectorAll('#timerGroup .ctrl-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  totalTime = parseInt(btn.dataset.time);
  init();
});

restartBtn.addEventListener('click', init);
resultsRestartBtn.addEventListener('click', init);

/* ============================================================
   KICK-OFF
   ============================================================ */
init();
    
