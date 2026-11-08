import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

// Design-system guardrails: the tokens, surface classes, and brand assets the
// rebuilt product depends on — caught here instead of as unstyled surprises.

const root = process.cwd(); // vitest runs from the frontend package root

describe('design-system guardrails', () => {
  it('keeps the required tokens defined once in tokens.css', () => {
    const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');
    for (const token of [
      '--qd-primary:', '--qd-primary-soft:', '--qd-primary-on-soft:',
      '--qd-surface-2:', '--qd-border:', '--qd-muted:',
      '--qd-mono:', '--font-display:', '--font-body:',
      '--radius-card:', '--radius-pill:',
    ]) {
      expect(tokens).toContain(token);
    }
  });

  it('keeps the practice/interviews surface classes defined where they live', () => {
    const practiceCss = readFileSync(join(root, 'src/components/dashboard/practice.css'), 'utf8');
    for (const cls of ['.qd-rail__item', '.qd-code', '.qd-fb', '.qd-mic', '.qd-bar', '.qd-sql', '.qd-outline']) {
      expect(practiceCss).toContain(cls);
    }
  });

  it('keeps the shipped brand assets in place', () => {
    expect(existsSync(join(root, 'public/art/quadly-logo.png'))).toBe(true);
    expect(existsSync(join(root, 'public/favicon.png'))).toBe(true);
  });
});
