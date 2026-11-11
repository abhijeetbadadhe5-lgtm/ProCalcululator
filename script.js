/**
 * ProCalc - Modern Desktop & Scientific Calculator
 * Vanilla JavaScript Engine (Offline, Zero-dependency, Fast)
 */

(function () {
  'use strict';

  // --- State Management ---
  const state = {
    currentInput: '0',
    expression: '',
    previousInput: null,
    operator: null,
    isNewNumber: true,
    lastAction: null,
    isDegreeMode: true,
    memoryValue: 0,
    hasMemory: false,
    soundEnabled: true,
    theme: 'dark',
    history: []
  };

  // --- Audio Synthesizer (Zero-latency Web Audio API) ---
  let audioCtx = null;
  function playClickSound(freq = 600, duration = 0.035, type = 'sine') {
    if (!state.soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // --- DOM Elements ---
  const outputDisplay = document.getElementById('outputDisplay');
  const expressionDisplay = document.getElementById('expressionDisplay');
  const copyBtn = document.getElementById('copyBtn');
  const copyFeedback = document.getElementById('copyFeedback');
  const themeToggle = document.getElementById('themeToggle');
  const soundToggle = document.getElementById('soundToggle');
  const historyToggle = document.getElementById('historyToggle');
  const historyDrawer = document.getElementById('historyDrawer');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const degRadBtn = document.getElementById('degRadBtn');
  const angleFlag = document.getElementById('angleFlag');
  const angleModeBadge = document.getElementById('angleModeBadge');
  const memFlag = document.getElementById('memFlag');
  const appContainer = document.querySelector('.app-container');
  const modeTabs = document.querySelectorAll('.tab-btn');
  const memButtons = document.querySelectorAll('.mem-btn');

  // --- Math Utility Helpers ---
  function roundPrecision(num, decimals = 10) {
    if (isNaN(num) || !isFinite(num)) return num;
    return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
  }

  function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity; // JS Number overflow limit
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  function formatDisplayNumber(value) {
    if (value === 'Error' || value === 'Cannot divide by 0') return value;
    if (value === 'Infinity' || value === '-Infinity') return 'Overflow';
    
    // Check if ends with decimal
    const str = String(value);
    if (str.endsWith('.')) return str;

    const parts = str.split('.');
    // Add comma formatting for integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  // Adjust display font size based on input length
  function adjustFontSize() {
    const len = outputDisplay.textContent.length;
    if (len > 14) {
      outputDisplay.style.fontSize = '1.6rem';
    } else if (len > 9) {
      outputDisplay.style.fontSize = '2.1rem';
    } else {
      outputDisplay.style.fontSize = '2.75rem';
    }
  }

  function updateDisplay() {
    outputDisplay.textContent = formatDisplayNumber(state.currentInput);
    expressionDisplay.textContent = state.expression;
    adjustFontSize();
  }

  // --- Calculation Engine ---
  function compute(a, b, op) {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);

    switch (op) {
      case '+':
        return roundPrecision(num1 + num2);
      case '-':
        return roundPrecision(num1 - num2);
      case '×':
      case '*':
        return roundPrecision(num1 * num2);
      case '÷':
      case '/':
        if (num2 === 0) return 'Cannot divide by 0';
        return roundPrecision(num1 / num2);
      case '%':
        return roundPrecision(num1 % num2);
      case '^':
        return roundPrecision(Math.pow(num1, num2));
      default:
        return num2;
    }
  }

  // Handle Digit or Decimal Input
  function inputDigit(digit) {
    playClickSound(750, 0.02);

    if (state.currentInput === 'Cannot divide by 0' || state.currentInput === 'Error') {
      state.currentInput = '0';
      state.expression = '';
    }

    if (digit === '.') {
      if (state.isNewNumber) {
        state.currentInput = '0.';
        state.isNewNumber = false;
      } else if (!state.currentInput.includes('.')) {
        state.currentInput += '.';
      }
      updateDisplay();
      return;
    }

    if (state.isNewNumber || state.currentInput === '0') {
      state.currentInput = digit;
      state.isNewNumber = false;
    } else {
      if (state.currentInput.replace(/[^\d]/g, '').length >= 16) return; // Prevent unreasonable overflow
      state.currentInput += digit;
    }
    updateDisplay();
  }

  // Handle Binary Operators (+, -, *, /, ^)
  function handleOperator(opSymbol) {
    playClickSound(900, 0.03, 'triangle');

    if (state.currentInput === 'Cannot divide by 0' || state.currentInput === 'Error') {
      return;
    }

    const currentVal = parseFloat(state.currentInput);

    if (state.operator && !state.isNewNumber) {
      const result = compute(state.previousInput, currentVal, state.operator);
      if (result === 'Cannot divide by 0') {
        state.currentInput = result;
        state.expression = '';
        state.previousInput = null;
        state.operator = null;
        state.isNewNumber = true;
        updateDisplay();
        return;
      }
      state.currentInput = String(result);
      state.previousInput = result;
    } else {
      state.previousInput = currentVal;
    }

    state.operator = opSymbol;
    state.expression = `${roundPrecision(state.previousInput)} ${opSymbol} `;
    state.isNewNumber = true;
    updateDisplay();
    highlightActiveOperator(opSymbol);
  }

  function highlightActiveOperator(opSymbol) {
    document.querySelectorAll('.op-key').forEach(btn => {
      if (btn.dataset.op === opSymbol) {
        btn.classList.add('active-op');
      } else {
        btn.classList.remove('active-op');
      }
    });
  }

  function clearActiveOperator() {
    document.querySelectorAll('.op-key').forEach(btn => btn.classList.remove('active-op'));
  }

  // Handle Equals Evaluation
  function handleEquals() {
    playClickSound(1050, 0.04, 'square');

    if (!state.operator || state.previousInput === null) return;
    if (state.currentInput === 'Cannot divide by 0' || state.currentInput === 'Error') return;

    const currentVal = parseFloat(state.currentInput);
    const result = compute(state.previousInput, currentVal, state.operator);

    const fullExp = `${roundPrecision(state.previousInput)} ${state.operator} ${roundPrecision(currentVal)} =`;
    
    if (result !== 'Cannot divide by 0') {
      addHistoryItem(fullExp, result);
    }

    state.expression = fullExp;
    state.currentInput = String(result);
    state.previousInput = null;
    state.operator = null;
    state.isNewNumber = true;
    clearActiveOperator();
    updateDisplay();
  }

  // Scientific Single-Operand Functions
  function handleScientific(func) {
    playClickSound(800, 0.03, 'sine');

    if (state.currentInput === 'Cannot divide by 0' || state.currentInput === 'Error') return;

    let val = parseFloat(state.currentInput);
    let result = val;
    let label = '';

    switch (func) {
      case 'sin':
        const sinAngle = state.isDegreeMode ? (val * Math.PI) / 180 : val;
        result = roundPrecision(Math.sin(sinAngle));
        label = `sin(${val})`;
        break;
      case 'cos':
        const cosAngle = state.isDegreeMode ? (val * Math.PI) / 180 : val;
        result = roundPrecision(Math.cos(cosAngle));
        label = `cos(${val})`;
        break;
      case 'tan':
        const tanAngle = state.isDegreeMode ? (val * Math.PI) / 180 : val;
        result = roundPrecision(Math.tan(tanAngle));
        label = `tan(${val})`;
        break;
      case 'asin':
        if (val < -1 || val > 1) { result = 'Error'; }
        else {
          let rad = Math.asin(val);
          result = state.isDegreeMode ? roundPrecision((rad * 180) / Math.PI) : roundPrecision(rad);
        }
        label = `asin(${val})`;
        break;
      case 'acos':
        if (val < -1 || val > 1) { result = 'Error'; }
        else {
          let rad = Math.acos(val);
          result = state.isDegreeMode ? roundPrecision((rad * 180) / Math.PI) : roundPrecision(rad);
        }
        label = `acos(${val})`;
        break;
      case 'atan':
        let rad = Math.atan(val);
        result = state.isDegreeMode ? roundPrecision((rad * 180) / Math.PI) : roundPrecision(rad);
        label = `atan(${val})`;
        break;
      case 'sqr':
        result = roundPrecision(Math.pow(val, 2));
        label = `sqr(${val})`;
        break;
      case 'sqrt':
        if (val < 0) { result = 'Error'; }
        else { result = roundPrecision(Math.sqrt(val)); }
        label = `√(${val})`;
        break;
      case 'cbrt':
        result = roundPrecision(Math.cbrt(val));
        label = `∛(${val})`;
        break;
      case 'log':
        if (val <= 0) { result = 'Error'; }
        else { result = roundPrecision(Math.log10(val)); }
        label = `log(${val})`;
        break;
      case 'ln':
        if (val <= 0) { result = 'Error'; }
        else { result = roundPrecision(Math.log(val)); }
        label = `ln(${val})`;
        break;
      case 'pi':
        result = Math.PI;
        label = 'π';
        break;
      case 'euler':
        result = Math.E;
        label = 'e';
        break;
      case 'reciprocal':
        if (val === 0) { result = 'Cannot divide by 0'; }
        else { result = roundPrecision(1 / val); }
        label = `1/(${val})`;
        break;
      case 'abs':
        result = Math.abs(val);
        label = `|${val}|`;
        break;
      case 'factorial':
        result = factorial(val);
        label = `fact(${val})`;
        break;
      case 'power':
        handleOperator('^');
        return;
    }

    if (result !== 'Error' && result !== 'Cannot divide by 0') {
      addHistoryItem(`${label} =`, result);
    }

    state.expression = `${label} =`;
    state.currentInput = String(result);
    state.isNewNumber = true;
    updateDisplay();
  }

  // Clear Functions
  function clearAll() {
    playClickSound(500, 0.03);
    state.currentInput = '0';
    state.expression = '';
    state.previousInput = null;
    state.operator = null;
    state.isNewNumber = true;
    clearActiveOperator();
    updateDisplay();
  }

  function clearEntry() {
    playClickSound(520, 0.03);
    state.currentInput = '0';
    state.isNewNumber = true;
    updateDisplay();
  }

  function backspace() {
    playClickSound(600, 0.02);
    if (state.isNewNumber || state.currentInput === 'Cannot divide by 0' || state.currentInput === 'Error') {
      state.currentInput = '0';
      updateDisplay();
      return;
    }
    if (state.currentInput.length > 1) {
      state.currentInput = state.currentInput.slice(0, -1);
      if (state.currentInput === '-' || state.currentInput === '-0') {
        state.currentInput = '0';
      }
    } else {
      state.currentInput = '0';
    }
    updateDisplay();
  }

  function negate() {
    playClickSound(700, 0.02);
    if (state.currentInput === '0' || state.currentInput === 'Cannot divide by 0' || state.currentInput === 'Error') return;
    state.currentInput = String(-parseFloat(state.currentInput));
    updateDisplay();
  }

  // --- Memory Operations ---
  function handleMemory(action) {
    playClickSound(850, 0.02);
    const currentVal = parseFloat(state.currentInput) || 0;

    switch (action) {
      case 'ms': // Memory Store
        state.memoryValue = currentVal;
        state.hasMemory = true;
        break;
      case 'mr': // Memory Recall
        if (state.hasMemory) {
          state.currentInput = String(state.memoryValue);
          state.isNewNumber = true;
        }
        break;
      case 'm-plus': // Memory Add
        state.memoryValue += currentVal;
        state.hasMemory = true;
        break;
      case 'm-minus': // Memory Subtract
        state.memoryValue -= currentVal;
        state.hasMemory = true;
        break;
      case 'mc': // Memory Clear
        state.memoryValue = 0;
        state.hasMemory = false;
        break;
    }

    updateMemoryUI();
    updateDisplay();
  }

  function updateMemoryUI() {
    memFlag.style.display = state.hasMemory ? 'inline-block' : 'none';
    memButtons.forEach(btn => {
      const act = btn.dataset.action;
      if (act === 'mc' || act === 'mr') {
        btn.disabled = !state.hasMemory;
      }
    });
  }

  // --- History Management ---
  function addHistoryItem(exp, val) {
    const item = { exp, val, timestamp: Date.now() };
    state.history.unshift(item);
    if (state.history.length > 30) state.history.pop();
    saveHistory();
    renderHistory();
  }

  function saveHistory() {
    try {
      localStorage.setItem('procalc_history', JSON.stringify(state.history));
    } catch (e) {}
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem('procalc_history');
      if (saved) {
        state.history = JSON.parse(saved);
        renderHistory();
      }
    } catch (e) {}
  }

  function renderHistory() {
    if (!historyList) return;
    if (state.history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No history recorded yet</div>';
      return;
    }

    historyList.innerHTML = '';
    state.history.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-item-exp">${item.exp}</div>
        <div class="history-item-val">${formatDisplayNumber(item.val)}</div>
      `;
      div.addEventListener('click', () => {
        playClickSound(750, 0.02);
        state.currentInput = String(item.val);
        state.isNewNumber = true;
        updateDisplay();
      });
      historyList.appendChild(div);
    });
  }

  // --- Copy to Clipboard ---
  function copyResult() {
    playClickSound(950, 0.02);
    const textToCopy = state.currentInput;
    navigator.clipboard.writeText(textToCopy).then(() => {
      copyFeedback.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyFeedback.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 1600);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyFeedback.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyFeedback.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 1600);
    });
  }

  // --- Theme Management ---
  function toggleTheme() {
    playClickSound(650, 0.02);
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.className = `theme-${state.theme}`;
    try {
      localStorage.setItem('procalc_theme', state.theme);
    } catch (e) {}
  }

  function initTheme() {
    try {
      const saved = localStorage.getItem('procalc_theme');
      if (saved) {
        state.theme = saved;
        document.body.className = `theme-${saved}`;
      }
    } catch (e) {}
  }

  // --- Sound Toggle ---
  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    soundToggle.style.opacity = state.soundEnabled ? '1' : '0.4';
    if (state.soundEnabled) {
      playClickSound(800, 0.03);
    }
  }

  // --- Angle Mode (Deg / Rad) ---
  function toggleDegRad() {
    playClickSound(700, 0.02);
    state.isDegreeMode = !state.isDegreeMode;
    const mode = state.isDegreeMode ? 'DEG' : 'RAD';
    degRadBtn.textContent = state.isDegreeMode ? 'RAD' : 'DEG';
    angleFlag.textContent = mode;
    angleModeBadge.textContent = mode;
  }

  // --- Tab Mode Switch (Standard / Scientific) ---
  function setMode(mode) {
    playClickSound(750, 0.02);
    modeTabs.forEach(tab => {
      if (tab.dataset.mode === mode) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    if (mode === 'scientific') {
      appContainer.classList.add('scientific-mode');
    } else {
      appContainer.classList.remove('scientific-mode');
    }
  }

  // --- Event Listeners Setup ---
  function initEventListeners() {
    // Buttons in keypad
    document.querySelector('.keypad-wrapper').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const val = btn.dataset.val;
      const action = btn.dataset.action;
      const op = btn.dataset.op;

      if (val !== undefined) {
        inputDigit(val);
      } else if (op !== undefined) {
        handleOperator(op);
      } else if (action) {
        switch (action) {
          case 'clear':
            clearAll();
            break;
          case 'clear-entry':
            clearEntry();
            break;
          case 'backspace':
            backspace();
            break;
          case 'negate':
            negate();
            break;
          case 'calculate':
            handleEquals();
            break;
          case 'deg-rad':
            toggleDegRad();
            break;
          default:
            handleScientific(action);
            break;
        }
      }
    });

    // Memory bar
    document.querySelector('.memory-bar').addEventListener('click', (e) => {
      const btn = e.target.closest('.mem-btn');
      if (!btn || btn.disabled) return;
      handleMemory(btn.dataset.action);
    });

    // Tabs
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => setMode(tab.dataset.mode));
    });

    // Action bar buttons
    themeToggle.addEventListener('click', toggleTheme);
    soundToggle.addEventListener('click', toggleSound);
    copyBtn.addEventListener('click', copyResult);
    outputDisplay.addEventListener('click', copyResult);

    // History drawer controls
    historyToggle.addEventListener('click', () => {
      playClickSound(600, 0.02);
      historyDrawer.classList.toggle('open');
    });

    closeHistoryBtn.addEventListener('click', () => {
      playClickSound(600, 0.02);
      historyDrawer.classList.remove('open');
    });

    clearHistoryBtn.addEventListener('click', () => {
      playClickSound(500, 0.03);
      state.history = [];
      saveHistory();
      renderHistory();
    });

    // Full Keyboard Listener (Laptop numpad & top row)
    window.addEventListener('keydown', handleKeyboardInput);
  }

  // Keyboard Handler
  function handleKeyboardInput(e) {
    const key = e.key;

    // Check for memory shortcuts
    if (e.ctrlKey) {
      if (key.toLowerCase() === 'm') { e.preventDefault(); handleMemory('ms'); return; }
      if (key.toLowerCase() === 'r') { e.preventDefault(); handleMemory('mr'); return; }
      if (key.toLowerCase() === 'l') { e.preventDefault(); handleMemory('mc'); return; }
      if (key.toLowerCase() === 'p') { e.preventDefault(); handleMemory('m-plus'); return; }
      if (key.toLowerCase() === 'q') { e.preventDefault(); handleMemory('m-minus'); return; }
    }

    // Number keys
    if (key >= '0' && key <= '9') {
      triggerVisualKey(`[data-val="${key}"]`);
      inputDigit(key);
      return;
    }

    if (key === '.' || key === ',') {
      triggerVisualKey('[data-val="."]');
      inputDigit('.');
      return;
    }

    // Operators
    if (key === '+') {
      triggerVisualKey('[data-op="+"]');
      handleOperator('+');
      return;
    }
    if (key === '-') {
      triggerVisualKey('[data-op="-"]');
      handleOperator('-');
      return;
    }
    if (key === '*' || key === 'x' || key === 'X') {
      triggerVisualKey('[data-op="×"]');
      handleOperator('×');
      return;
    }
    if (key === '/') {
      e.preventDefault();
      triggerVisualKey('[data-op="÷"]');
      handleOperator('÷');
      return;
    }
    if (key === '%') {
      triggerVisualKey('[data-action="reciprocal"]');
      handleOperator('%');
      return;
    }
    if (key === '^') {
      triggerVisualKey('[data-action="power"]');
      handleOperator('^');
      return;
    }

    // Equals / Enter
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      triggerVisualKey('.equals-key');
      handleEquals();
      return;
    }

    // Backspace / Delete
    if (key === 'Backspace') {
      triggerVisualKey('[data-action="backspace"]');
      backspace();
      return;
    }
    if (key === 'Delete') {
      triggerVisualKey('[data-action="clear-entry"]');
      clearEntry();
      return;
    }
    if (key === 'Escape') {
      triggerVisualKey('[data-action="clear"]');
      clearAll();
      return;
    }

    // History Toggle Shortcut
    if (key.toLowerCase() === 'h' && !e.ctrlKey && !e.altKey) {
      historyDrawer.classList.toggle('open');
      return;
    }

    // Theme Toggle Shortcut
    if (key.toLowerCase() === 't' && !e.ctrlKey && !e.altKey) {
      toggleTheme();
      return;
    }
  }

  // Visual button press animation on keyboard strike
  function triggerVisualKey(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.classList.add('pressed');
      setTimeout(() => el.classList.remove('pressed'), 120);
    }
  }

  // Initialize Application
  function init() {
    initTheme();
    loadHistory();
    initEventListeners();
    updateDisplay();
    updateMemoryUI();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
