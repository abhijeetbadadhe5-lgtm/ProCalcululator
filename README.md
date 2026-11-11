# ProCalc - Modern Desktop & Scientific Calculator 🚀

A high-performance, responsive, zero-dependency desktop-style calculator built with vanilla HTML5, modern CSS3, and JavaScript. Designed to look and feel just like a native laptop/desktop application with dark glassmorphism, instant keyboard response, and both Standard & Scientific calculation modes.

---

## ⚡ How to Run Locally

Because this project is built entirely in vanilla HTML, CSS, and JavaScript, **no build step or server installation is required**. It runs instantly offline at maximum speed.

### Option 1: Direct Launch (Easiest)
1. Open File Explorer and navigate to:
   `C:\Users\ADMIN\.gemini\antigravity\scratch\calculator-app`
2. Double-click **`index.html`** to open it in your default web browser (Chrome, Edge, Firefox, Brave, etc.).

### Option 2: Via Terminal / PowerShell
Run this command in PowerShell to launch it immediately:
```powershell
Start-Process "C:\Users\ADMIN\.gemini\antigravity\scratch\calculator-app\index.html"
```

---

## 🌟 Key Features

- **Laptop / Native App Aesthetics**:
  - Acrylic glassmorphic window frame with titlebar and window controls.
  - Ambient gradient glow background.
  - Active tactile feedback animation on button clicks and keystrokes.
- **Two Complete Modes**:
  - **Standard Mode**: Everyday basic arithmetic, percentages, negation, backspace, and memory registers.
  - **Scientific Mode**: Trigonometry (`sin`, `cos`, `tan`, `sin⁻¹`, `cos⁻¹`, `tan⁻¹`), Degree/Radian toggle, powers (`x²`, `xʸ`), roots (`√`, `∛`), logarithms (`log`, `ln`), factorials (`x!`), reciprocal (`1/x`), absolute values (`|x|`), and mathematical constants (`π`, `e`).
- **Calculation History**:
  - Slide-out history drawer that saves all calculations to `localStorage`.
  - Click any previous item in history to instantly restore its answer onto the display.
- **Full Memory System**:
  - `MC` (Clear), `MR` (Recall), `M+` (Add), `M-` (Subtract), and `MS` (Store) with a live `M` display indicator badge.
- **Synthesized Audio Feedback**:
  - Zero-latency tactile key clicks synthesized using the browser's native Web Audio API (no external sound files required).
  - Can be toggled on/off anytime with the speaker icon.
- **Dark & Light Themes**:
  - Clean high-contrast dark theme and crisp modern light theme with smooth animated transitions.
  - Preference is automatically remembered.
- **One-Click Result Copying**:
  - Click the output screen or the `Copy` button to instantly copy the calculated value to the clipboard.
- **Smart Formatting**:
  - Floating-point arithmetic rounding corrections (e.g. `0.1 + 0.2` outputs `0.3` instead of `0.30000000000000004`).
  - Auto-shrinking font size to prevent display truncation on long numbers.

---

## ⌨️ Full Keyboard Shortcuts

You can use your laptop keyboard or numeric keypad seamlessly:

| Key | Action |
| :--- | :--- |
| `0` - `9` | Input Digits |
| `.` or `,` | Decimal Point |
| `+`, `-`, `*`, `/` | Basic Operators (`+`, `−`, `×`, `÷`) |
| `Enter` or `=` | Calculate Result |
| `Backspace` | Delete last entered digit |
| `Delete` | Clear Entry (CE) |
| `Escape` | All Clear (AC) |
| `^` | Power (`xʸ`) |
| `%` | Modulo / Percentage |
| `h` | Toggle Calculation History Drawer |
| `t` | Toggle Dark / Light Theme |
| `Ctrl + M` | Memory Store (MS) |
| `Ctrl + R` | Memory Recall (MR) |
| `Ctrl + L` | Memory Clear (MC) |
| `Ctrl + P` | Memory Add (M+) |
| `Ctrl + Q` | Memory Subtract (M-) |

---

## 📁 Project Structure

```
calculator-app/
│
├── index.html       # Clean semantic window structure and markup
├── style.css        # Glassmorphic UI, responsive layout, animations & themes
├── script.js        # High-precision calculator engine, Web Audio, history & hotkeys
└── README.md        # Documentation and shortcut guide
```
