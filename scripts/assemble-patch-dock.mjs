#!/usr/bin/env node
import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p1 = fs.readFileSync(path.join(root, 'scripts/_patch-dock-p1.b64'), 'utf8').trim();
const p2 = fs.readFileSync(path.join(root, 'scripts/_patch-dock-p2.b64'), 'utf8').trim();
const out = zlib.inflateSync(Buffer.from(p1 + p2, 'base64'));
fs.writeFileSync(path.join(root, 'scripts/patch-dock-css-cl.mjs'), out);
console.log('assembled patch-dock-css-cl.mjs', out.length);
