import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const files = ['index.html', 'en/index.html', 'admin.html'];
const failures = [];
const warnings = [];
const allRpcNames = new Set();

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function fail(msg) {
  failures.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

function existsAsset(asset, file) {
  const base = file.startsWith('en/') ? path.join(root, 'en') : root;
  const resolved = path.resolve(base, asset);
  return resolved.startsWith(root) && fs.existsSync(resolved);
}

for (const file of files) {
  const html = read(file);
  if (html.includes('data:image/')) fail(`${file}: contains embedded base64 image data`);

  const placeholderPatterns = [
    /链接待添加/,
    /赞赏码待添加/,
    /赞助链接待添加/,
    /购买链接待添加/,
    /赞助Link coming soon/,
  ];
  for (const pattern of placeholderPatterns) {
    if (pattern.test(html)) fail(`${file}: contains placeholder text ${pattern}`);
  }

  const assetMatches = html.matchAll(/(?:src|href)=["']((?:\.\.\/)?assets\/[^"']+)["']/g);
  for (const match of assetMatches) {
    const asset = match[1].split('?')[0];
    if (!existsAsset(asset, file)) fail(`${file}: missing asset ${asset}`);
  }

  const cssAssetMatches = html.matchAll(/url\(["']?((?:\.\.\/)?assets\/[^"')]+)["']?\)/g);
  for (const match of cssAssetMatches) {
    const asset = match[1].split('?')[0];
    if (!existsAsset(asset, file)) fail(`${file}: missing CSS asset ${asset}`);
  }

  const staticHtml = html.split(/<script\b/i)[0];
  const emptyImageMatches = staticHtml.matchAll(/<img\b(?![^>]*\baria-hidden=["']true["'])(?=[^>]*\bsrc=["']\s*["'])[^>]*>/g);
  for (const match of emptyImageMatches) {
    fail(`${file}: visible img has empty src: ${match[0].slice(0, 90)}`);
  }

  const staticIds = [...staticHtml.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
  const seenIds = new Set();
  const duplicateIds = new Set();
  for (const id of staticIds) {
    if (seenIds.has(id)) duplicateIds.add(id);
    seenIds.add(id);
  }
  for (const id of duplicateIds) fail(`${file}: duplicate static id "${id}"`);

  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const scriptText = scripts.join('\n');
  scripts.forEach((script, idx) => {
    try {
      new Function(script);
    } catch (error) {
      fail(`${file}: script block ${idx + 1} does not parse: ${error.message}`);
    }
  });

  const inlineCalls = html.matchAll(/\bonclick=["'][^"']*?\b([A-Za-z_$][\w$]*)\s*\(/g);
  for (const match of inlineCalls) {
    const fn = match[1];
    if (['if', 'for', 'while', 'switch', 'getElementById', 'querySelector', 'scrollIntoView', 'stopPropagation', 'preventDefault'].includes(fn)) continue;
    const re = new RegExp(`(?:function\\s+${fn}\\s*\\(|(?:const|let|var)\\s+${fn}\\s*=|window\\.${fn}\\s*=)`);
    if (!re.test(scriptText)) fail(`${file}: onclick references missing function ${fn}`);
  }

  for (const match of html.matchAll(/\/rpc\/([a-zA-Z0-9_]+)/g)) allRpcNames.add(match[1]);
  for (const match of html.matchAll(/rest\/v1\/rpc\/([a-zA-Z0-9_]+)/g)) allRpcNames.add(match[1]);
  for (const match of html.matchAll(/rpc\(['"]([a-zA-Z0-9_]+)['"]/g)) allRpcNames.add(match[1]);

  const styles = [...html.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  styles.forEach((style, idx) => {
    const open = (style.match(/\{/g) || []).length;
    const close = (style.match(/\}/g) || []).length;
    if (open !== close) fail(`${file}: style block ${idx + 1} has unbalanced braces ${open}/${close}`);
  });
}

const en = read('en/index.html');
const visibleEnglishLeaks = [
  '条Discussion',
  '积木战士大乱斗',
  '待Vote',
  '开启：',
  '造成',
  '发动大招',
  '购买链接',
  '赞助',
];
for (const leak of visibleEnglishLeaks) {
  if (en.includes(leak)) fail(`en/index.html: visible Chinese leak "${leak}"`);
}

const admin = read('admin.html');
if (/localStorage\.setItem\(AI_KEY_STORAGE/.test(admin)) {
  fail('admin.html: AI key is still saved to persistent localStorage');
}
if (/localStorage\.getItem\(AI_KEY_STORAGE/.test(admin)) {
  fail('admin.html: AI key is still read from persistent localStorage');
}

const schema = read('supabase-schema.sql');
for (const rpc of allRpcNames) {
  const re = new RegExp(`create\\s+or\\s+replace\\s+function\\s+(?:public\\.)?${rpc}\\b`, 'i');
  if (!re.test(schema)) warn(`supabase-schema.sql: RPC ${rpc} is used by site files but not found in schema`);
}

const showcaseDir = path.join(root, 'assets', 'weapon-showcases');
for (let i = 1; i <= 11; i += 1) {
  const name = `weapon-${String(i).padStart(2, '0')}.webp`;
  const file = path.join(showcaseDir, name);
  if (!fs.existsSync(file)) {
    fail(`assets/weapon-showcases/${name}: missing`);
    continue;
  }
  try {
    const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
    const width = Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] || 0);
    const height = Number(output.match(/pixelHeight:\s*(\d+)/)?.[1] || 0);
    if (width !== 640 || height !== 860) warn(`${name}: expected 640x860, got ${width}x${height}`);
  } catch {
    warn('sips is unavailable, skipped image dimension checks');
    break;
  }
}

if (warnings.length) {
  console.log('Warnings:');
  for (const item of warnings) console.log(' - ' + item);
}

if (failures.length) {
  console.error('Preflight failed:');
  for (const item of failures) console.error(' - ' + item);
  process.exit(1);
}

console.log('Preflight passed.');
