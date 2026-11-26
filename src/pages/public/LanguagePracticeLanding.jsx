import React from 'react';
import { Code2, ArrowRight, CheckCircle2, ChevronRight, Terminal, Sparkles, BookOpen } from 'lucide-react';
import { PracticePage } from '../app/PracticePage.jsx';

const LANGUAGE_DETAILS = {
  Python: {
    title: 'Python Typing Practice & Speed Test',
    tagline: 'Master indentation, colons, dunder methods, and clean Pythonic syntax.',
    icon: 'PY',
    color: '#3776AB',
    challenges: [
      'Indentation Sensitivity: Maintaining a steady 4-space rhythm or tab discipline without syntax errors.',
      'Trailing Colons: Automatic muscle memory for colon `:` at the end of def, class, if, and for statements.',
      'Dunder & Magic Methods: Rapid typing of double underscores in `__init__`, `__repr__`, and `__len__`.',
      'List Comprehension Syntax: Effortless placement of brackets `[x for x in data if x > 0]` and lambda expressions.'
    ],
    sampleCode: `def calculate_fibonacci(n: int) -> list[int]:
    """Generates the Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]`,
    syntaxTips: 'Focus on reaching the colon key `:` with your right pinky without looking down. In Python, hesitation often happens between line breaks and indentation blocks.'
  },
  JavaScript: {
    title: 'JavaScript Typing Practice & WPM Test',
    tagline: 'Build fluid muscle memory for arrow functions, template literals, and curly braces.',
    icon: 'JS',
    color: '#F7DF1E',
    challenges: [
      'Arrow Functions & Callbacks: Swift typing of `const handleEvent = (e) => { ... }`.',
      "Template Literals: Backtick `${variable}` dexterity on the top-left key without shifting focus.",
      'Equality & Operators: Strict triple equals `===`, nullish coalescing `??`, and optional chaining `?.`.',
      'Object Destructuring: Rapid finger coordination for nested braces `{ data: { user } }`.'
    ],
    sampleCode: `const fetchUserData = async (userId) => {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const { status, data } = await response.json();
    return status === 200 ? data : null;
  } catch (error) {
    console.error('Network failure:', error?.message);
    return null;
  }
};`,
    syntaxTips: 'Practice curling your right ring and pinky fingers for brackets `{}` and semicolons `;`. Eliminating hesitation on backticks and arrow operators yields an immediate 15+ WPM jump in real development.'
  },
  TypeScript: {
    title: 'TypeScript Typing Practice for Developers',
    tagline: 'Train your reflexes for generics, type annotations, and interfaces.',
    icon: 'TS',
    color: '#3178C6',
    challenges: [
      'Generics & Angles: Fast typing of angle brackets `<T, U extends Record<string, unknown>>`.',
      'Type Unions & Intersections: Frequent pipe `|` and ampersand `&` symbols.',
      'Interface Contracts: Repetitive colon-separated property annotations `id: string; count?: number;`.',
      'Readonly & Utility Types: Swift typing of `Partial<T>`, `ReadonlyArray<T>`, and `Record<K, V>`.'
    ],
    sampleCode: `interface ApiResponse<T> {
  readonly status: number;
  readonly payload: T | null;
  readonly timestamp: string;
}

export type Handler<TReq, TRes> = (req: TReq) => Promise<ApiResponse<TRes>>;`,
    syntaxTips: 'Angle brackets `<` and `>` require holding Shift with your right hand and striking comma/period. Keep your hands balanced on the home row to avoid wrist drift.'
  },
  'C++': {
    title: 'C++ Code Typing Practice & Speed Drills',
    tagline: 'Conquer pointers, memory references, scope resolution, and template syntax.',
    icon: 'C++',
    color: '#00599C',
    challenges: [
      'Pointers & Memory: Fast combinations of asterisks `*ptr` and ampersands `&ref`.',
      'Scope Resolution: Double colons `std::vector<std::string>` without losing cadence.',
      'Arrow Operators: Object dereference `ptr->member` using hyphen and angle bracket.',
      'Preprocessor Directives: Number sign `#include <iostream>` and `#pragma once`.'
    ],
    sampleCode: `#include <iostream>
#include <vector>
#include <memory>

template <typename T>
void printVector(const std::vector<T>& items) {
    for (const auto& item : items) {
        std::cout << item << " ";
    }
    std::cout << std::endl;
}`,
    syntaxTips: 'In C++, syntax density is higher than in prose. Prioritize accuracy over raw speed: missing one asterisk `*` or ampersand `&` in code changes meaning entirely.'
  },
  Rust: {
    title: 'Rust Code Typing Practice & Syntax Training',
    tagline: 'Master borrow checker symbols, match arms, lifetimes, and macro syntax.',
    icon: 'RS',
    color: '#DEA584',
    challenges: [
      'Borrowing & Lifetimes: Exclamation marks `println!`, ampersands `&mut self`, and single quote lifetimes `\'a`.',
      'Match Arms & Arrows: Fat arrows `Some(x) => x * 2,` and double colons `Option::None`.',
      'Question Mark Operator: Rapid error propagation `let file = File::open(path)?;`.',
      'Traits & Structs: Attribute macros `#[derive(Debug, Clone, PartialEq)]`.'
    ],
    sampleCode: `pub fn process_records<T>(records: &[T]) -> Result<usize, &'static str>
where
    T: AsRef<str>,
{
    match records.is_empty() {
        true => Err("Collection is empty"),
        false => Ok(records.len()),
    }
}`,
    syntaxTips: 'Rust uses frequent apostrophes for lifetimes and exclamation marks for macros. Use the left pinky for Shift when striking the top row numbers.'
  },
  Go: {
    title: 'Go (Golang) Typing Practice & Concurrency Drills',
    tagline: 'Boost your Go typing rhythm: channels, short variable assignments, and error blocks.',
    icon: 'GO',
    color: '#00ADD8',
    challenges: [
      'Short Variable Declaration: Rapid colon-equals `result, err := fetchData()`.',
      'Channel Operations: Left arrow syntax `ch <- data` and `<-done`.',
      'Idiomatic Error Checking: Frequent `if err != nil { return nil, err }` blocks.',
      'Capitalized Exported Identifiers: Alternating Shift key for exported functions `func ProcessData()`.'
    ],
    sampleCode: `func ProcessConcurrently(urls []string) <-chan Result {
    out := make(chan Result, len(urls))
    go func() {
        defer close(out)
        for _, url := range urls {
            res, err := fetchUrl(url)
            if err != nil {
                log.Printf("Error: %v", err)
                continue
            }
            out <- res
        }
    }()
    return out
}`,
    syntaxTips: 'Go code is clean and repetitive by design. Once your fingers memorize `if err != nil`, your coding velocity will soar.'
  },
  SQL: {
    title: 'SQL Query Typing Practice & Database Drills',
    tagline: 'Build rapid muscle memory for SELECT, JOIN, subqueries, and window clauses.',
    icon: 'SQL',
    color: '#E38C00',
    challenges: [
      'Uppercase Keywords: Holding or toggling Caps Lock/Shift for `SELECT`, `FROM`, `WHERE`, `GROUP BY`.',
      "String Literals: Single quotes 'value' rather than double quotes.",
      'Wildcards & Aliases: Asterisks `SELECT *` and table dot syntax `u.id = p.user_id`.',
      'Parentheses in Subqueries: Balanced parentheses around nested subqueries.'
    ],
    sampleCode: `SELECT
    u.id,
    u.full_name,
    COUNT(s.id) AS total_sessions,
    ROUND(AVG(s.wpm), 2) AS average_wpm
FROM users u
LEFT JOIN typing_sessions s ON s.user_id = u.id
WHERE s.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.full_name
HAVING COUNT(s.id) >= 10
ORDER BY average_wpm DESC
LIMIT 50;`,
    syntaxTips: 'Mastering SQL typing involves smooth transitions between capital keywords and lowercase table aliases. Keep your palms relaxed.'
  }
};

export function LanguagePracticeLanding({ language = 'Python', onNavigate }) {
  const details = LANGUAGE_DETAILS[language] || LANGUAGE_DETAILS['Python'];
  const allLangs = Object.keys(LANGUAGE_DETAILS);

  return (
    <div style={{ maxWidth: '1200px', margin: '1.5rem auto', padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Semantic Breadcrumbs */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        <a
          href="/"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          Home
        </a>
        <ChevronRight size={13} />
        <a
          href="/practice"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              onNavigate('/practice');
            }
          }}
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          Practice
        </a>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{language} Practice</span>
      </nav>

      {/* Hero Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', background: `${details.color}20`, border: `1px solid ${details.color}50`, color: details.color, fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem' }}>
          <span>{details.icon}</span>
          <span>{language} Developer Drills</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
          {details.title}
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', maxWidth: '800px', lineHeight: 1.6 }}>
          {details.tagline}
        </p>
      </div>

      {/* Embedded Live Practice Page */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)' }}>
        <PracticePage
          initialType="coding"
          initialLanguage={language}
          onNavigate={onNavigate}
        />
      </div>

      {/* Language Technical Challenges & Syntax Ergonomics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-forest)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={18} />
            <span>Why {language} Typing Stutters</span>
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {details.challenges.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.92rem', lineHeight: 1.5 }}>
                <CheckCircle2 size={16} color="var(--color-primary-forest)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-sage)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} />
            <span>Ergonomic Cadence Advice</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            {details.syntaxTips}
          </p>
          <div style={{ background: 'var(--color-bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)', overflowX: 'auto' }}>
            <pre style={{ margin: 0 }}>{details.sampleCode}</pre>
          </div>
        </div>
      </div>

      {/* Related Language Practice Navigation */}
      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Explore Other Real-World Developer Stacks
        </h3>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {allLangs.map((lang) => {
            const langPathMap = {
              Python: '/python-typing-practice',
              JavaScript: '/javascript-typing-practice',
              TypeScript: '/typescript-typing-practice',
              'C++': '/cpp-typing-practice',
              Rust: '/rust-typing-practice',
              Go: '/go-typing-practice',
              SQL: '/sql-typing-practice'
            };
            const targetPath = langPathMap[lang] || '/practice';
            const isCurrent = lang === language;

            return (
              <a
                key={lang}
                href={targetPath}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    onNavigate(targetPath);
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: isCurrent ? 'var(--color-primary-forest)' : 'var(--color-bg-subtle)',
                  color: isCurrent ? '#ffffff' : 'var(--color-text)',
                  border: isCurrent ? '1px solid var(--color-primary-forest)' : '1px solid var(--color-border)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{lang}</span>
                {!isCurrent && <ArrowRight size={12} />}
              </a>
            );
          })}
        </div>
      </div>

    </div>
  );
}
