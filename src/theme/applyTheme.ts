import { tokens, type Tokens } from './tokens';

const kebab = (value: string): string => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function flatten(
  node: Record<string, unknown>,
  prefix: string,
  sink: Array<[string, string]>,
): void {
  for (const [key, value] of Object.entries(node)) {
    const name = prefix ? `${prefix}-${kebab(key)}` : kebab(key);
    if (value !== null && typeof value === 'object') {
      flatten(value as Record<string, unknown>, name, sink);
    } else {
      sink.push([`--${name}`, String(value)]);
    }
  }
}

export function applyTheme(theme: Tokens | Record<string, unknown> = tokens): void {
  const root = document.documentElement;
  const variables: Array<[string, string]> = [];
  flatten(theme as unknown as Record<string, unknown>, '', variables);
  for (const [name, value] of variables) {
    root.style.setProperty(name, value);
  }
}

export const cssVar = (path: string): string => `var(--${kebab(path)})`;
