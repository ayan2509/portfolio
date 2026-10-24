#!/usr/bin/env node
/* Design-system check for the portfolio site.
   Run from the site folder:   node scripts/check-design.js
   No installs needed. Exits with code 1 when it finds a problem.

   What it checks, in every .css file and every <style> block:
   1. font-size uses a token: --cs-* on case-study pages (projects/ and
      case-study.css), --cs-* or --type-* elsewhere. Relative values
      (em, %, inherit) are fine; so is max(var(--cs-label), …) and
      calc(var(--cs-…) * …).
   2. No raw colour (hex, rgb, hsl, oklch) in color, fill or stroke.
      Text and diagram marks take colours from tokens/colors.css.
   3. No font-size set in an inline style="" attribute.

   Exceptions:
   - Rules inside an embedded product mockup (MOCKUPS below) are skipped:
     they show that product's own UI (README: Embedded product mockups).
   - A declaration with a  ds-ignore: <reason>  comment on the same line
     is skipped (write it as a normal CSS comment). Use it for glyphs and animations, and always give a reason. */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'design-reference', 'images', 'tokens', '.git', 'scripts', 'components']);
const MOCKUPS = ['.bp', '.fv-chat', '.fv-tv', '.fv-phone', '.pr-ipad', '.pr-map-ams-mark'];
const RAW_COLOUR = /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch)\(/i;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out); }
    else if (/\.(html|css)$/.test(e.name) && !/\.(backup|before)[.-]/.test(e.name)) out.push(path.join(dir, e.name));
  }
  return out;
}

function cssBlocks(file, text) {
  if (file.endsWith('.css')) return [{ css: text, offset: 0 }];
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = re.exec(text))) blocks.push({ css: m[1], offset: text.slice(0, m.index + m[0].indexOf('>') + 1).split('\n').length - 1 });
  return blocks;
}

// Walk CSS keeping a stack of selectors so each declaration knows its rule.
function* declarations(css) {
  const stack = [];
  let buf = '', line = 1, startLine = 1;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {          // keep comments with the declaration text
      const end = css.indexOf('*/', i + 2);
      const chunk = css.slice(i, end + 2);
      buf += chunk; line += (chunk.match(/\n/g) || []).length; i = end + 1; continue;
    }
    if (c === '\n') line++;
    if (c === '{') { stack.push(buf.replace(/\/\*[\s\S]*?\*\//g, '').trim()); buf = ''; startLine = line; continue; }
    if (c === ';' || c === '}') {
      const decl = buf.trim();
      if (decl.includes(':') && stack.length) {
        const declLine = line - (buf.match(/\n/g) || []).length + (buf.match(/^\s*\n/) ? 1 : 0);
        const after = css.slice(i + 1, css.indexOf('\n', i + 1) === -1 ? css.length : css.indexOf('\n', i + 1));
        yield { selector: stack[stack.length - 1], stack: [...stack], text: decl, trailing: after, line: declLine };
      }
      buf = '';
      if (c === '}') stack.pop();
      continue;
    }
    buf += c;
  }
}

const problems = [];
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const text = fs.readFileSync(file, 'utf8');
  const caseStudy = rel.startsWith('projects/') || rel === 'case-study.css';

  for (const { css, offset } of cssBlocks(file, text)) {
    for (const d of declarations(css)) {
      const clean = d.text.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      const prop = clean.slice(0, clean.indexOf(':')).trim().toLowerCase();
      const value = clean.slice(clean.indexOf(':') + 1).trim();
      if (/ds-ignore:/.test(d.text + d.trailing)) continue;
      if (d.stack.some((s) => MOCKUPS.some((m) => new RegExp(`(^|[^\\w-])\\${m}(-[\\w-]*)?(?![\\w-])`).test(s)))) continue;
      const where = `${rel}:${offset + d.line}  ${d.selector.replace(/\s+/g, ' ').slice(0, 60)}`;

      if (prop === 'font-size') {
        const ok = caseStudy ? /var\(--cs-|var\(--type-(body|logo)\)/ : /var\(--(cs|type)-/;
        const relative = /^(inherit|initial|unset|[\d.]+(em|%))$/.test(value);
        if (!ok.test(value) && !relative && !(prop === 'font-size' && d.selector.trim() === 'html')) {
          problems.push(`${where}\n    font-size: ${value}  → use a ${caseStudy ? '--cs-*' : '--cs-* or --type-*'} token`);
        }
      }
      if ((prop === 'color' || prop === 'fill' || prop === 'stroke') && RAW_COLOUR.test(value) && !/^#(fff|ffffff|000|000000)$/i.test(value)) {
        problems.push(`${where}\n    ${prop}: ${value}  → use a token from tokens/colors.css`);
      }
    }
  }
  if (file.endsWith('.html')) {
    const re = /style="[^"]*font-size[^"]*"/g; let m;
    while ((m = re.exec(text))) problems.push(`${rel}:${text.slice(0, m.index).split('\n').length}\n    inline ${m[0].slice(0, 60)}  → move it into a rule with a token`);
  }
}

if (problems.length) {
  console.log(`✗ ${problems.length} design-system problem${problems.length > 1 ? 's' : ''}\n`);
  console.log(problems.join('\n\n'));
  process.exit(1);
}
console.log('✓ Type sizes and colours all come from the tokens.');
