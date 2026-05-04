#!/usr/bin/env node
/**
 * Creates a new blog post from blog/_blog-template.mdx
 * Usage: node scripts/new-blog.cjs <slug> [title]
 * Example: node scripts/new-blog.cjs k8s-networking-deep-dive "K8s Networking Deep Dive"
 *
 * Output: blog/YYYY-MM-DD-<slug>/YYYY-MM-DD-<slug>.mdx
 */
const fs = require('fs');
const path = require('path');

const slugArg = process.argv[2];
if (!slugArg) {
  console.error('Usage: node scripts/new-blog.cjs <slug> [title]');
  console.error('Example: node scripts/new-blog.cjs my-post-title "My Post Title"');
  process.exit(1);
}

const titleArg = process.argv[3] || slugArg.replace(/-/g, ' ');
const date = new Date().toISOString().slice(0, 10);

const kebabSlug = slugArg
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const postId = kebabSlug;

const root = path.join(__dirname, '..');
const templatePath = path.join(root, 'blog', '_blog-template.mdx');
const dirName = `${date}-${kebabSlug}`;
const fileName = `${date}-${kebabSlug}.mdx`;
const outDir = path.join(root, 'blog', dirName);
const outFile = path.join(outDir, fileName);

if (!fs.existsSync(templatePath)) {
  console.error('Missing template:', templatePath);
  process.exit(1);
}

if (fs.existsSync(outFile)) {
  console.error('Already exists:', outFile);
  process.exit(1);
}

let body = fs.readFileSync(templatePath, 'utf8');
body = body
  .replaceAll('{{SLUG}}', kebabSlug)
  .replaceAll('{{TITLE}}', titleArg)
  .replaceAll('{{POST_ID}}', postId);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, body, 'utf8');
console.log('Created:', path.relative(root, outFile));
