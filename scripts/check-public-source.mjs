import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Check exactly the tracked snapshot, never print matched credential values.
const files = execFileSync('git', ['ls-files', '-z'], { encoding:'utf8' }).split('\0').filter(Boolean);
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/,
  /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/,
  /(?:https?:\/\/|root@|HostName\s+)(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/,
  /(?:DB_PASSWORD|BRIDGE_SECRET)\s*['"]?\s*[,=:]\s*['"][A-Za-z0-9+/_=-]{20,}['"]/
];
const issues = [];
for (const file of files) {
  if (file === 'scripts/check-public-source.mjs') continue;
  if (/(?:^|\/)(?:node_modules|dist|uploads|backups|\.git)(?:\/|$)/.test(file) || /(?:wp-config\.php|\.(?:sql|pem|key|ttf|jpg))$/.test(file)) issues.push(file + ': forbidden file');
  const content = fs.readFileSync(path.resolve(file), 'utf8');
  for (const [i, line] of content.split('\n').entries()) if (patterns.some(p => p.test(line))) issues.push(file + ':' + (i+1) + ': sensitive-pattern match');
}
if (issues.length) { console.error(issues.join('\n')); process.exit(1); }
console.log(`Checked ${files.length} tracked files: no blocked paths or credential patterns.`);
