#!/usr/bin/env node

/**
 * CodeTyper CLI — High-Performance Terminal Typing Practice
 * Practice coding syntax and English typing directly in your terminal.
 */

import readline from 'readline';

const SNIPPETS = [
  {
    category: 'Algorithms',
    title: 'Two Sum (Hash Map)',
    text: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}`
  },
  {
    category: 'Algorithms',
    title: 'Binary Search',
    text: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`
  },
  {
    category: 'React & Modern JS',
    title: 'Custom Hook (useDebounce)',
    text: `function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}`
  },
  {
    category: 'Python',
    title: 'LRU Cache Decorator',
    text: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]`
  },
  {
    category: 'Rust',
    title: 'Pattern Matching & Result',
    text: `fn divide(numerator: f64, denominator: f64) -> Result<f64, String> {
    if denominator == 0.0 {
        Err(String::from("division by zero"))
    } else {
        Ok(numerator / denominator)
    }
}`
  },
  {
    category: 'Vim Motions',
    title: 'Vim Navigation Precision',
    text: `ciw -> change inside word
yap -> yank around paragraph
dt; -> delete till semicolon
:%s/foo/bar/gc -> find and replace
0 -> start of line, $ -> end of line`
  },
  {
    category: 'English Prose',
    title: 'Zen of Clean Code',
    text: `Simplicity is prerequisite for reliability. Programs must be written for people to read, and only incidentally for machines to execute. Code never lies, comments sometimes do.`
  }
];

// ANSI Escape Codes
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  // Colors
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  brightGreen: '\x1b[92m',
  brightCyan: '\x1b[96m',
  brightYellow: '\x1b[93m',
  // Backgrounds
  bgRed: '\x1b[41m',
  bgCyan: '\x1b[46m',
  bgBlack: '\x1b[40m',
  // Cursor
  clearScreen: '\x1b[2J\x1b[H',
  hideCursor: '\x1b[?25l',
  showCursor: '\x1b[?25h'
};

class TerminalCodeTyper {
  constructor(categoryFilter = null) {
    this.categoryFilter = categoryFilter;
    this.state = 'MENU'; // 'MENU' | 'TYPING' | 'RESULTS'
    this.currentSnippet = null;
    this.target = '';
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    this.endTime = null;
    this.timerInterval = null;
  }

  start() {
    process.stdout.write(ANSI.hideCursor);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key) => this.handleKey(key));

    process.on('exit', () => {
      process.stdout.write(ANSI.showCursor + ANSI.reset);
    });

    process.on('SIGINT', () => {
      this.cleanup();
      process.exit(0);
    });

    this.pickNextSnippet();
    this.state = 'TYPING';
    this.render();
  }

  cleanup() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    process.stdout.write(ANSI.showCursor + ANSI.reset + '\n');
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
  }

  pickNextSnippet() {
    let pool = SNIPPETS;
    if (this.categoryFilter) {
      pool = SNIPPETS.filter((s) =>
        s.category.toLowerCase().includes(this.categoryFilter.toLowerCase())
      );
      if (pool.length === 0) pool = SNIPPETS;
    }
    const idx = Math.floor(Math.random() * pool.length);
    this.currentSnippet = pool[idx];
    this.target = this.currentSnippet.text.replace(/\r\n/g, '\n');
    this.typed = '';
    this.errors = 0;
    this.startTime = null;
    this.endTime = null;
  }

  handleKey(key) {
    // Ctrl+C
    if (key === '\u0003') {
      this.cleanup();
      process.exit(0);
    }

    if (this.state === 'RESULTS') {
      if (key === '\r' || key === '\n' || key === ' ') {
        this.pickNextSnippet();
        this.state = 'TYPING';
        this.render();
      } else if (key.toLowerCase() === 'q' || key === '\u001b') {
        this.cleanup();
        process.exit(0);
      }
      return;
    }

    if (this.state === 'TYPING') {
      // Escape key aborts to new snippet
      if (key === '\u001b') {
        this.pickNextSnippet();
        this.render();
        return;
      }

      // Backspace (\x7f or \x08)
      if (key === '\x7f' || key === '\x08') {
        if (this.typed.length > 0) {
          this.typed = this.typed.slice(0, -1);
          this.render();
        }
        return;
      }

      // Start timer on first character
      if (!this.startTime) {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
          if (this.state === 'TYPING') this.render();
        }, 200);
      }

      // Handle Enter
      let charToAdd = key;
      if (key === '\r') {
        charToAdd = '\n';
      }

      // Check correctness
      const expectedChar = this.target[this.typed.length];
      if (charToAdd !== expectedChar) {
        this.errors++;
      }

      this.typed += charToAdd;

      // Check if finished
      if (this.typed.length >= this.target.length) {
        this.endTime = Date.now();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.state = 'RESULTS';
      }

      this.render();
    }
  }

  calculateStats() {
    const elapsedSec = Math.max(1, ((this.endTime || Date.now()) - (this.startTime || Date.now())) / 1000);
    const minutes = elapsedSec / 60;
    const typedLength = this.typed.length;
    const correctChars = this.typed.split('').filter((c, i) => c === this.target[i]).length;

    const grossWpm = Math.round((typedLength / 5) / minutes) || 0;
    const netWpm = Math.max(0, Math.round(((typedLength / 5) - (this.errors / 5)) / minutes)) || 0;
    const accuracy = typedLength > 0 ? Math.max(0, Math.round((correctChars / typedLength) * 100)) : 100;
    const progress = Math.min(100, Math.round((typedLength / this.target.length) * 100));

    return { elapsedSec: elapsedSec.toFixed(1), grossWpm, netWpm, accuracy, progress, errors: this.errors };
  }

  render() {
    const stats = this.calculateStats();
    let out = ANSI.clearScreen;

    // Header Banner
    out += `${ANSI.bold}${ANSI.brightCyan}╔════════════════════════════════════════════════════════════════════════════╗${ANSI.reset}\n`;
    out += `${ANSI.bold}${ANSI.brightCyan}║ ${ANSI.brightYellow}CODETYPER CLI${ANSI.brightCyan} — Fast, Focused Terminal Typing Practice                ║${ANSI.reset}\n`;
    out += `${ANSI.bold}${ANSI.brightCyan}╚════════════════════════════════════════════════════════════════════════════╝${ANSI.reset}\n\n`;

    if (this.state === 'TYPING') {
      // Live HUD
      const progressBarWidth = 24;
      const filled = Math.round((stats.progress / 100) * progressBarWidth);
      const bar = '█'.repeat(filled) + '░'.repeat(Math.max(0, progressBarWidth - filled));

      out += ` ${ANSI.bold}Category:${ANSI.reset} ${ANSI.magenta}${this.currentSnippet.category}${ANSI.reset}  │  ${ANSI.bold}Snippet:${ANSI.reset} ${ANSI.white}${this.currentSnippet.title}${ANSI.reset}\n`;
      out += ` ${ANSI.bold}Speed:${ANSI.reset} ${ANSI.brightGreen}${stats.netWpm} WPM${ANSI.reset}  │  ${ANSI.bold}Acc:${ANSI.reset} ${stats.accuracy > 95 ? ANSI.brightGreen : ANSI.yellow}${stats.accuracy}%${ANSI.reset}  │  ${ANSI.bold}Time:${ANSI.reset} ${stats.elapsedSec}s  │  [${ANSI.cyan}${bar}${ANSI.reset}] ${stats.progress}%\n`;
      out += ` ${ANSI.dim}Commands: [ESC] Next Snippet │ [Ctrl+C] Quit${ANSI.reset}\n`;
      out += `${ANSI.dim}────────────────────────────────────────────────────────────────────────────${ANSI.reset}\n\n`;

      // Code Display
      const targetLines = this.target.split('\n');
      let charCounter = 0;

      for (let lineIdx = 0; lineIdx < targetLines.length; lineIdx++) {
        const line = targetLines[lineIdx];
        const lineNum = String(lineIdx + 1).padStart(3, ' ');
        out += `${ANSI.dim}${lineNum} │ ${ANSI.reset}`;

        for (let colIdx = 0; colIdx < line.length; colIdx++) {
          const expected = line[colIdx];
          const globalIdx = charCounter;

          if (globalIdx < this.typed.length) {
            const actual = this.typed[globalIdx];
            if (actual === expected) {
              out += `${ANSI.brightGreen}${actual}${ANSI.reset}`;
            } else {
              out += `${ANSI.bgRed}${ANSI.white}${actual === ' ' ? '·' : actual}${ANSI.reset}`;
            }
          } else if (globalIdx === this.typed.length) {
            // Cursor
            out += `${ANSI.bgCyan}${ANSI.white}${expected === ' ' ? ' ' : expected}${ANSI.reset}`;
          } else {
            out += `${ANSI.dim}${expected}${ANSI.reset}`;
          }
          charCounter++;
        }

        // Handle newline character at end of line
        if (lineIdx < targetLines.length - 1) {
          const globalIdx = charCounter;
          if (globalIdx < this.typed.length) {
            if (this.typed[globalIdx] === '\n') {
              // Typed enter correctly
            } else {
              out += `${ANSI.bgRed}${ANSI.white}↵${ANSI.reset}`;
            }
          } else if (globalIdx === this.typed.length) {
            out += `${ANSI.bgCyan}${ANSI.white}↵${ANSI.reset}`;
          }
          charCounter++; // Account for the \n
        }

        out += '\n';
      }
    } else if (this.state === 'RESULTS') {
      out += ` ${ANSI.bold}${ANSI.brightGreen}✨ SESSION COMPLETE!${ANSI.reset}\n`;
      out += ` ${ANSI.dim}Snippet: ${this.currentSnippet.title} (${this.currentSnippet.category})${ANSI.reset}\n\n`;

      out += ` ┌───────────────────────────┬───────────────────────────┐\n`;
      out += ` │ ${ANSI.bold}Metric${ANSI.reset}                    │ ${ANSI.bold}Score${ANSI.reset}                     │\n`;
      out += ` ├───────────────────────────┼───────────────────────────┤\n`;
      out += ` │ Net Speed (WPM)           │ ${ANSI.bold}${ANSI.brightGreen}${String(stats.netWpm).padEnd(25)}${ANSI.reset} │\n`;
      out += ` │ Raw Speed (WPM)           │ ${ANSI.dim}${String(stats.grossWpm).padEnd(25)}${ANSI.reset} │\n`;
      out += ` │ Accuracy                  │ ${stats.accuracy >= 95 ? ANSI.brightGreen : ANSI.yellow}${String(stats.accuracy + '%').padEnd(25)}${ANSI.reset} │\n`;
      out += ` │ Duration                  │ ${ANSI.white}${String(stats.elapsedSec + ' seconds').padEnd(25)}${ANSI.reset} │\n`;
      out += ` │ Uncorrected Errors        │ ${stats.errors > 0 ? ANSI.red : ANSI.green}${String(stats.errors).padEnd(25)}${ANSI.reset} │\n`;
      out += ` │ Total Keystrokes          │ ${ANSI.cyan}${String(this.typed.length).padEnd(25)}${ANSI.reset} │\n`;
      out += ` └───────────────────────────┴───────────────────────────┘\n\n`;

      out += ` ${ANSI.bold}${ANSI.brightYellow}Press [Enter / Space] to practice another snippet, or [q] to quit.${ANSI.reset}\n`;
    }

    process.stdout.write(out);
  }
}

// CLI Argument Parsing
const args = process.argv.slice(2);
let categoryFilter = null;

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
CodeTyper CLI — Developer Typing in Your Terminal

Usage:
  codetyper              Start interactive typing session with random code snippets
  codetyper --algo       Practice Data Structures & Algorithms
  codetyper --react      Practice React & JavaScript hooks
  codetyper --python     Practice Python snippets
  codetyper --rust       Practice Rust patterns
  codetyper --vim        Practice Vim Navigation commands
  codetyper --english    Practice English prose
  codetyper --help       Show this help message

In-Session Controls:
  [ESC]                  Skip to next snippet
  [Ctrl+C]               Exit CodeTyper
`);
  process.exit(0);
}

if (args.includes('--algo')) categoryFilter = 'Algorithms';
else if (args.includes('--react')) categoryFilter = 'React';
else if (args.includes('--python')) categoryFilter = 'Python';
else if (args.includes('--rust')) categoryFilter = 'Rust';
else if (args.includes('--vim')) categoryFilter = 'Vim';
else if (args.includes('--english')) categoryFilter = 'English';

const app = new TerminalCodeTyper(categoryFilter);
app.start();
