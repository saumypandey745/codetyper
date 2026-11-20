import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, '../bin/codetyper.js');

describe('CodeTyper CLI Terminal Tool', () => {
  it('executes --help and displays usage documentation', async () => {
    const { stdout, stderr } = await execFileAsync('node', [cliPath, '--help']);
    assert.strictEqual(stderr, '');
    assert.match(stdout, /CodeTyper CLI — Developer Typing in Your Terminal/);
    assert.match(stdout, /codetyper --algo/);
    assert.match(stdout, /codetyper --vim/);
    assert.match(stdout, /\[ESC\]/);
  });
});
