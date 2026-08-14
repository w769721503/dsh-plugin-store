// Build the dual-face dsh-plugin-store package:
//   - Host half:  bundle src/index.ts  -> lib/index.js  (ESM, node platform)
//   - Client half: bundle src/client/index.tsx -> lib/client.js, wrapped in the
//     window.__ModuleLoader__.load({ id, factory }) format the DSH client
//     modules runtime expects (mirrors the shipped client bundles).
import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const PKG_ID = 'dsh-plugin-store'

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  outfile: 'lib/index.js',
  sourcemap: false,
  logLevel: 'info',
})

await build({
  entryPoints: ['src/client/index.tsx'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  outfile: '.client-build/client.cjs',
  jsx: 'automatic',
  external: ['react', 'react/*'],
  loader: { '.css': 'text' },
  sourcemap: false,
  logLevel: 'info',
})

const bundle = readFileSync('.client-build/client.cjs', 'utf8')
const indented = bundle
  .split('\n')
  .map((line) => (line.length === 0 ? '' : '    ' + line))
  .join('\n')

mkdirSync('lib', { recursive: true })
writeFileSync(
  'lib/client.js',
  `window.__ModuleLoader__.load({
  id: ${JSON.stringify(PKG_ID)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${indented}
    return module.exports;
  },
});
`,
)
