import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const files = ['index.html', 'en/index.html', 'admin.html'];
const failures = [];
const warnings = [];

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

  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  scripts.forEach((script, idx) => {
    try {
      new Function(script);
    } catch (error) {
      fail(`${file}: script block ${idx + 1} does not parse: ${error.message}`);
    }
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
const rpcNames = new Set();
for (const match of admin.matchAll(/\/rpc\/([a-zA-Z0-9_]+)/g)) rpcNames.add(match[1]);
for (const rpc of rpcNames) {
  const re = new RegExp(`create\\s+or\\s+replace\\s+function\\s+(?:public\\.)?${rpc}\\b`, 'i');
  if (!re.test(schema)) warn(`supabase-schema.sql: RPC ${rpc} is used by admin.html but not found in schema`);
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
    if (width < 700 || height < 900) warn(`${name}: low resolution ${width}x${height}`);
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
