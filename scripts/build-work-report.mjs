import { readFile, writeFile } from 'node:fs/promises';
import { icons } from 'lucide';

const root = new URL('../', import.meta.url);
let html = await readFile(new URL('scripts/work-report.template.html', root), 'utf8');
const names = [
  'Activity', 'ArrowDown', 'ArrowRight', 'ArrowUpRight', 'BookOpen', 'Box',
  'Braces', 'Check', 'CheckCheck', 'ChevronRight', 'CircuitBoard', 'Code',
  'Database', 'Download', 'ExternalLink', 'FileCheck', 'FileJson', 'FileText',
  'FlaskConical', 'GitBranch', 'Github', 'Globe', 'Layers', 'LockKeyhole',
  'Monitor', 'MousePointer2', 'Network', 'PanelTop', 'Printer', 'ScanEye',
  'ShieldCheck', 'Smartphone', 'Terminal', 'X',
];
const subset = Object.fromEntries(names.map(name => {
  const sourceName = name === 'Github' ? 'GitFork' : name;
  if (!icons[sourceName]) throw new Error(`Missing Lucide icon: ${sourceName}`);
  return [name, icons[sourceName]];
}));
html = html.replace('@@ICON_DATA@@', JSON.stringify(subset));
for (const [token, name] of [
  ['CATALOG', 'catalog-desktop.png'],
  ['MOBILE', 'original-questions-mobile.png'],
  ['PUBLIC', 'public-catalog-desktop.png'],
]) {
  const image = await readFile(new URL(`docs/images/${name}`, root));
  html = html.replaceAll(`@@IMAGE_${token}@@`, `data:image/png;base64,${image.toString('base64')}`);
}
if (/@@[A-Z_]+@@/.test(html)) throw new Error('Unresolved report placeholder');
const output = new URL('docs/work-report.html', root);
await writeFile(output, html);
console.log(`Built docs/work-report.html (${Buffer.byteLength(html).toLocaleString('en-US')} bytes; offline, self-contained)`);
