'use strict';

const fs = require('fs');

const PATTERNS = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i],
  ['aws-access-key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ['openai-anthropic-stripe-key', /\bsk-(?:ant-|live-)?[A-Za-z0-9_-]{20,}\b/i],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/i],
  ['google-api-key', /\bAIza[0-9A-Za-z_-]{30,}\b/],
  ['gitlab-token', /\bglpat-[A-Za-z0-9_-]{20,}\b/],
  ['npm-token', /\bnpm_[A-Za-z0-9]{20,}\b/],
  ['sendgrid-key', /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{20,}\b/],
  ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['credential-url', /\b[a-z][a-z0-9+.-]*:\/\/[^\s/@:]+:[^\s/@]+@[^\s]+/i],
  ['generic-sensitive-assignment', /\b(?:PASSWORD|PASSWD|SECRET|API_KEY|TOKEN|DATABASE_URL|TWILIO_AUTH_TOKEN|SENDGRID_API_KEY|STRIPE_SECRET_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN)\s*[:=]\s*["']?[^\s"'`]{12,}/i],
];

const SAFE_REFERENCE_PATTERNS = [
  /\$\{\{[^}]+\}\}/,
  /\$[A-Z][A-Z0-9_]*/,
  /process\.env\.[A-Z0-9_]+/,
  /os\.environ(?:\.get)?\s*\(/,
  /secrets\.[A-Z0-9_]+/i,
  /vars\.[A-Z0-9_]+/i,
  /\b(?:REDACTED|EXAMPLE|PLACEHOLDER|CHANGEME|DUMMY|TEST[_-]?(?:TOKEN|KEY|SECRET)|YOUR[_-]?(?:TOKEN|KEY|SECRET))\b/i,
];

function addedLines(diffText) {
  return String(diffText || '')
    .split(/\r?\n/)
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .filter(({ line }) => line.startsWith('+') && !line.startsWith('+++'))
    .map(({ line, lineNumber }) => ({ text: line.slice(1), lineNumber }));
}

function isSafeReference(text) {
  return SAFE_REFERENCE_PATTERNS.some((pattern) => pattern.test(text));
}

function scanText(diffText) {
  const findings = [];
  for (const { text, lineNumber } of addedLines(diffText)) {
    for (const [name, pattern] of PATTERNS) {
      if (!pattern.test(text)) continue;
      if (name === 'generic-sensitive-assignment' && isSafeReference(text)) continue;
      findings.push({ pattern: name, lineNumber });
    }
  }
  return findings;
}

function main(argv) {
  if (argv.includes('--self-check')) {
    const bad = [
      '+API_KEY="this-is-a-real-looking-secret-123456789"',
      '+const token = "ghp_abcdefghijklmnopqrstuvwxyz123456";',
      '+DATABASE_URL=postgres://admin:supersecretpassword@example.invalid/db',
      '+const jwt = "eyJabcdefghijklmno.abcdefghijklmnop.abcdefghijklmnop";',
    ].join('\n');
    if (scanText(bad).length < 4) throw new Error('secret scanner self-check failed to detect fixtures');
    const safe = [
      '+ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }}',
      '+const token = process.env.GITHUB_TOKEN;',
      '+password = $DATABASE_PASSWORD',
      '+const sample = "REDACTED";',
    ].join('\n');
    if (scanText(safe).length !== 0) throw new Error('secret scanner self-check produced a false positive on references');
    console.log('added-line secret scanner self-check passed');
    return;
  }

  const paths = argv.filter((arg) => arg !== '--');
  if (!paths.length) {
    console.error('usage: node scripts/scan-added-secrets.js <diff-file> [diff-file ...]');
    process.exit(2);
  }
  let combined = '';
  for (const path of paths) combined += fs.readFileSync(path, 'utf8') + '\n';
  const findings = scanText(combined);
  if (findings.length) {
    for (const finding of findings) {
      // Intentionally never print the matching source line or credential-shaped value.
      console.error(`credential-like addition detected: ${finding.pattern} at diff line ${finding.lineNumber}`);
    }
    process.exit(1);
  }
  console.log('added-line secret scan passed');
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { scanText, addedLines, isSafeReference };
