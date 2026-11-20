/**
 * CodeTyper Intelligent Snippet Generator
 * Synthesizes production-grade coding drills by language, concept, and difficulty.
 */

const TEMPLATES = {
  JavaScript: {
    'Async / Await Pipeline': `async function fetchUserData(userId) {
  try {
    const res = await fetch(\`/api/users/\${userId}\`);
    if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);
    const data = await res.json();
    return { success: true, user: data };
  } catch (err) {
    console.error('Failed to load profile:', err.message);
    return { success: false, error: err.message };
  }
}`,
    'Custom Debounce Hook': `function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}`,
    'Event Bus / PubSub': `class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  on(event, listener) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event).add(listener);
    return () => this.events.get(event).delete(listener);
  }
  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((cb) => cb(...args));
    }
  }
}`
  },
  TypeScript: {
    'Generic Repository Interface': `interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

class UserRepository implements Repository<User> {
  async findById(id: string): Promise<User | null> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }
  async save(user: User): Promise<User> {
    return db.insert(users).values(user).returning();
  }
  async delete(id: string): Promise<boolean> {
    const res = await db.delete(users).where(eq(users.id, id));
    return res.rowCount > 0;
  }
}`,
    'Type Guard & Discriminated Union': `type ApiResponse<T> =
  | { status: 'success'; data: T; timestamp: number }
  | { status: 'error'; message: string; code: number };

function isSuccess<T>(res: ApiResponse<T>): res is { status: 'success'; data: T; timestamp: number } {
  return res.status === 'success';
}`
  },
  Python: {
    'Asyncio Worker Pool': `import asyncio

async def worker(queue: asyncio.Queue, worker_id: int):
    while True:
        task = await queue.get()
        try:
            print(f"Worker {worker_id} processing {task}")
            await asyncio.sleep(0.5)
        finally:
            queue.task_done()

async def main():
    queue = asyncio.Queue()
    workers = [asyncio.create_task(worker(queue, i)) for i in range(3)]
    for item in range(10):
        await queue.put(item)
    await queue.join()
    for w in workers:
        w.cancel()`,
    'Context Manager & Decorator': `import time
from functools import wraps
from contextlib import contextmanager

@contextmanager
def timed_block(label: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        duration = (time.perf_counter() - start) * 1000
        print(f"[{label}] finished in {duration:.2f}ms")`
  },
  Rust: {
    'Safe Concurrency with Arc and Mutex': `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter_ref = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter_ref.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }
    println!("Result: {}", *counter.lock().unwrap());
}`,
    'Custom Result and Error Handling': `#[derive(Debug)]
enum MathError {
    DivisionByZero,
    NegativeSquareRoot,
}

fn safe_divide(x: f64, y: f64) -> Result<f64, MathError> {
    if y == 0.0 {
        Err(MathError::DivisionByZero)
    } else {
        Ok(x / y)
    }
}`
  },
  Go: {
    'Goroutines Worker Pool': `package main

import (
	"fmt"
	"sync"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		fmt.Printf("worker %d started job %d\\n", id, j)
		results <- j * 2
	}
}

func main() {
	const numJobs = 5
	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)
	var wg sync.WaitGroup

	for w := 1; w <= 3; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}
}`,
    'HTTP Middleware & Logging': `package main

import (
	"log"
	"net/http"
	"time"
)

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s in %v", r.Method, r.URL.Path, time.Since(start))
	})
}`
  },
  SQL: {
    'Window Functions & Ranking': `WITH RankedSalaries AS (
  SELECT
    employee_id,
    department_id,
    salary,
    DENSE_RANK() OVER (
      PARTITION BY department_id
      ORDER BY salary DESC
    ) as salary_rank
  FROM employees
)
SELECT * FROM RankedSalaries
WHERE salary_rank <= 3;`,
    'Recursive CTE Hierarchy': `WITH RECURSIVE OrgChart AS (
  SELECT employee_id, manager_id, name, 1 as level
  FROM employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT e.employee_id, e.manager_id, e.name, o.level + 1
  FROM employees e
  INNER JOIN OrgChart o ON e.manager_id = o.employee_id
)
SELECT * FROM OrgChart ORDER BY level, employee_id;`
  },
  'Algorithms (DSA)': {
    'LRU Cache (Hash Map + Doubly Linked List)': `class Node {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
}`,
    'Trie (Prefix Tree) Implementation': `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  insert(word) {
    let curr = this.root;
    for (const ch of word) {
      if (!curr.children[ch]) curr.children[ch] = new TrieNode();
      curr = curr.children[ch];
    }
    curr.isEnd = true;
  }
}`
  }
};

/**
 * Generate a clean coding snippet tailored for typing drills.
 */
export function generateCodingSnippet(language, topic, difficulty = 'intermediate') {
  const langTemplates = TEMPLATES[language] || TEMPLATES['JavaScript'];
  const topics = Object.keys(langTemplates);

  // If a specific topic is requested and exists
  if (topic && langTemplates[topic]) {
    return {
      title: topic,
      language,
      difficulty,
      content: langTemplates[topic].trim()
    };
  }

  // If keyword matches any topic
  if (topic) {
    const matched = topics.find((t) => t.toLowerCase().includes(topic.toLowerCase()));
    if (matched) {
      return {
        title: matched,
        language,
        difficulty,
        content: langTemplates[matched].trim()
      };
    }
  }

  // Random pick from language
  const chosenTopic = topics[Math.floor(Math.random() * topics.length)];
  return {
    title: chosenTopic,
    language,
    difficulty,
    content: langTemplates[chosenTopic].trim()
  };
}

export function getAvailableTopics(language) {
  const langTemplates = TEMPLATES[language] || TEMPLATES['JavaScript'];
  return Object.keys(langTemplates);
}
