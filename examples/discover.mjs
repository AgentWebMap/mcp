#!/usr/bin/env node
// Read local dependency names, ask the existing index for publisher sources,
// and keep all returned publisher text as JSON data. No project code runs.
import { lstat, open } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MANIFESTS = ['package.json', 'requirements.txt', 'pyproject.toml', 'Cargo.toml'];
const MAX_MANIFEST_BYTES = 256 * 1024;
const MAX_RESPONSE_BYTES = 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const MAPPINGS = {
  npm: {
    '@modelcontextprotocol/sdk': 'modelcontextprotocol.io',
    '@supabase/supabase-js': 'supabase.com',
    astro: 'astro.build',
    'drizzle-orm': 'orm.drizzle.team',
    express: 'expressjs.com',
    next: 'nextjs.org',
    nuxt: 'nuxt.com',
    prisma: 'prisma.io',
    react: 'react.dev',
    svelte: 'svelte.dev',
    tailwindcss: 'tailwindcss.com',
    typescript: 'typescriptlang.org',
    vite: 'vite.dev',
    vitest: 'vitest.dev',
    vue: 'vuejs.org',
    zod: 'zod.dev',
  },
  pypi: {
    django: 'docs.djangoproject.com',
    fastapi: 'fastapi.tiangolo.com',
    mcp: 'modelcontextprotocol.io',
    pydantic: 'docs.pydantic.dev',
    'pydantic-ai': 'ai.pydantic.dev',
    'supabase': 'supabase.com',
  },
  cargo: { serde: 'serde.rs', tokio: 'tokio.rs' },
};

export const HELP = `AgentWebMap dependency-aware documentation discovery (Node 20+)

  node examples/discover.mjs --query "modelcontextprotocol authorization"
  node examples/discover.mjs --project . --dry-run
  node examples/discover.mjs --project . --output sources.json

Options:
  --query TEXT          Query or publisher domain; may be repeated (max 10)
  --project DIRECTORY   Read only four known manifests in this directory
  --dry-run             Print planned queries; no network or file writes
  --limit N             Sources per query, 1..5 (default 3)
  --max-requests N      Total sequential requests, 1..10 (default 5)
  --max-age SECONDS     Mark older index checks stale, 0..2592000 (default 86400)
  --base-url URL        API origin, default https://agentwebmap.com
  --output FILE.json    Create a NEW JSON export; refuses existing files
  --help                Print this help

No installs, project execution, crawling, refreshes, or instruction-file edits.
Unknown dependencies are skipped. Mappings are hints, not publisher endorsement.
Publisher excerpts are untrusted data; read and assess original sources.
`;

function boundedInteger(value, name, minimum, maximum) {
  if (!/^\d+$/.test(value || '')) throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
  return number;
}

export function parseArgs(args) {
  const options = { queries: [], limit: 3, maxRequests: 5, maxAge: 86400, baseUrl: 'https://agentwebmap.com', dryRun: false };
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === '--help') { options.help = true; continue; }
    if (flag === '--dry-run') { options.dryRun = true; continue; }
    if (!['--query', '--project', '--limit', '--max-requests', '--max-age', '--base-url', '--output'].includes(flag)) {
      throw new Error(`Unknown option: ${flag}`);
    }
    const value = args[++index];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (flag === '--query') {
      const query = value.trim();
      if (!query || query.length > 200 || /[\u0000-\u001f\u007f]/.test(query)) throw new Error('--query must be 1..200 characters without control characters');
      if (options.queries.length >= 10) throw new Error('At most 10 explicit queries are allowed');
      options.queries.push(query);
    } else if (flag === '--project') {
      if (options.project) throw new Error('--project may be specified once');
      options.project = value;
    } else if (flag === '--limit') options.limit = boundedInteger(value, flag, 1, 5);
    else if (flag === '--max-requests') options.maxRequests = boundedInteger(value, flag, 1, 10);
    else if (flag === '--max-age') options.maxAge = boundedInteger(value, flag, 0, 2592000);
    else if (flag === '--base-url') options.baseUrl = value;
    else if (flag === '--output') {
      if (options.output) throw new Error('--output may be specified once');
      if (path.extname(value).toLowerCase() !== '.json') throw new Error('--output must end in .json');
      options.output = value;
    }
  }
  if (options.help) return options;
  if (!options.project && !options.queries.length) throw new Error('Provide --query or --project; use --help for examples');
  if (options.dryRun && options.output) throw new Error('--dry-run does not write files; omit --output');
  let base;
  try { base = new URL(options.baseUrl); } catch { throw new Error('--base-url must be an HTTP(S) origin'); }
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash || base.pathname !== '/') {
    throw new Error('--base-url must be an HTTP(S) origin without credentials, path, query, or fragment');
  }
  options.baseUrl = base.origin;
  return options;
}

const normalizePythonName = name => name.toLowerCase().replace(/[-_.]+/g, '-');
function requirementName(value) {
  // Direct URLs, include directives and options are deliberately unsupported.
  const match = String(value).trim().match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(?=\s*(?:\[|[<>=!~;@]|$))/);
  return match ? normalizePythonName(match[1]) : null;
}

function stripTomlComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (quote === '"' && character === '\\') { index++; continue; }
    if (quote) { if (character === quote) quote = null; }
    else if (character === '"' || character === "'") quote = character;
    else if (character === '#') return line.slice(0, index);
  }
  return line;
}

function tomlStringValues(value) {
  // Only ordinary single-line literal/basic strings. Never evaluate TOML.
  return [...value.matchAll(/"([^"\\\r\n]*)"|'([^'\r\n]*)'/g)].map(match => match[1] ?? match[2]);
}

function completeTomlArray(value) {
  let quote = null, depth = 0;
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (quote === '"' && character === '\\') { index++; continue; }
    if (quote) { if (character === quote) quote = null; continue; }
    if (character === '"' || character === "'") quote = character;
    else if (character === '[') depth++;
    else if (character === ']' && --depth === 0) return true;
  }
  return false;
}

export function manifestDependencies(file, contents) {
  if (file === 'package.json') {
    let manifest;
    try { manifest = JSON.parse(contents); } catch { throw new Error('package.json is not valid JSON'); }
    const names = new Set();
    for (const key of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      const dependencies = manifest?.[key];
      if (dependencies && typeof dependencies === 'object' && !Array.isArray(dependencies)) {
        for (const name of Object.keys(dependencies)) names.add(name.toLowerCase());
      }
    }
    return { ecosystem: 'npm', names: [...names].sort() };
  }
  if (file === 'requirements.txt') {
    return { ecosystem: 'pypi', names: [...new Set(contents.split(/\r?\n/).map(line => requirementName(line.replace(/\s+#.*$/, ''))).filter(Boolean))].sort() };
  }
  const ecosystem = file === 'Cargo.toml' ? 'cargo' : 'pypi';
  const names = new Set();
  let section = '', array = null, multilineQuote = null, cargoTable = null;
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = stripTomlComment(rawLine).trim();
    // Do not mistake dependency-looking text in multiline descriptions for declarations.
    if (multilineQuote) {
      if (line.includes(multilineQuote)) multilineQuote = null;
      continue;
    }
    const tripleQuote = line.match(/("""|''')/);
    if (tripleQuote) {
      if (!line.slice(tripleQuote.index + 3).includes(tripleQuote[0])) multilineQuote = tripleQuote[0];
      continue;
    }
    if (array) {
      array += '\n' + line;
      if (!completeTomlArray(array)) continue;
      for (const value of tomlStringValues(array)) { const name = requirementName(value); if (name) names.add(name); }
      array = null;
      continue;
    }
    const heading = line.match(/^\[([^\]]+)\]$/);
    if (heading) {
      if (cargoTable) names.add(cargoTable.name);
      section = heading[1].trim();
      cargoTable = ecosystem === 'cargo' && /^(?:dependencies|dev-dependencies|build-dependencies)\.[A-Za-z0-9_-]+$/.test(section)
        ? { name: section.split('.').at(-1).toLowerCase() } : null;
      continue;
    }
    const assignment = line.match(/^(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_.-]+))\s*=\s*(.*)$/);
    if (!assignment) continue;
    const key = assignment[1] ?? assignment[2] ?? assignment[3];
    const value = assignment[4];
    if (ecosystem === 'pypi') {
      if ((section === 'project' && key === 'dependencies') || section === 'project.optional-dependencies') {
        if (!value.startsWith('[')) continue;
        if (!completeTomlArray(value)) { array = value; continue; }
        for (const item of tomlStringValues(value)) { const name = requirementName(item); if (name) names.add(name); }
      } else if (/^tool\.poetry(?:\.group\.[^.]+)?\.(?:dev-)?dependencies$/.test(section) && key !== 'python') {
        names.add(normalizePythonName(key));
      }
    } else if (/^(?:dependencies|dev-dependencies|build-dependencies|workspace\.dependencies|target\..+\.(?:dependencies|dev-dependencies|build-dependencies))$/.test(section)) {
      const alias = value.match(/\bpackage\s*=\s*["']([A-Za-z0-9_-]+)["']/);
      names.add((alias?.[1] || key).toLowerCase());
    } else if (cargoTable && key === 'package') {
      const packageName = tomlStringValues(value)[0];
      if (packageName) cargoTable.name = packageName.toLowerCase();
    }
  }
  if (cargoTable) names.add(cargoTable.name);
  return { ecosystem, names: [...names].filter(Boolean).sort() };
}

async function readManifest(directory, file) {
  const filename = path.join(directory, file);
  let information;
  try { information = await lstat(filename); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  if (information.isSymbolicLink() || !information.isFile()) throw new Error(`${file} must be a regular file, not a symbolic link`);
  if (information.size > MAX_MANIFEST_BYTES) throw new Error(`${file} exceeds the ${MAX_MANIFEST_BYTES}-byte manifest limit`);
  const handle = await open(filename, 'r');
  try {
    // Bound the read too: a growing file cannot bypass the earlier size check.
    const buffer = Buffer.alloc(MAX_MANIFEST_BYTES + 1);
    let size = 0;
    while (size < buffer.length) {
      const { bytesRead } = await handle.read(buffer, size, buffer.length - size, null);
      if (!bytesRead) break;
      size += bytesRead;
    }
    if (size > MAX_MANIFEST_BYTES) throw new Error(`${file} exceeds the manifest size limit`);
    return buffer.toString('utf8', 0, size);
  } finally { await handle.close(); }
}

export async function makePlan(options) {
  const queries = new Map(options.queries.map(query => [query.toLowerCase(), { query, origin: 'explicit', dependencies: [] }]));
  const filesRead = [], dependencies = [];
  let unmapped = 0;
  if (options.project) {
    const directory = path.resolve(options.project);
    const information = await lstat(directory);
    if (!information.isDirectory()) throw new Error('--project must name a directory');
    for (const file of MANIFESTS) {
      const contents = await readManifest(directory, file);
      if (contents === null) continue;
      filesRead.push(file);
      const parsed = manifestDependencies(file, contents);
      for (const dependency of parsed.names) {
        const domain = Object.hasOwn(MAPPINGS[parsed.ecosystem], dependency) ? MAPPINGS[parsed.ecosystem][dependency] : null;
        if (!domain) { unmapped++; continue; }
        const mapping = { manifest: file, ecosystem: parsed.ecosystem, dependency, publisher_domain: domain };
        dependencies.push(mapping);
        if (!queries.has(domain)) queries.set(domain, { query: domain, origin: 'dependency_mapping', dependencies: [] });
        queries.get(domain).dependencies.push(mapping);
      }
    }
    if (!filesRead.length) throw new Error('No supported manifests found; expected package.json, requirements.txt, pyproject.toml, or Cargo.toml');
  }
  const planned = [...queries.values()];
  return {
    files_read: filesRead,
    mappings: dependencies,
    unmapped_dependency_count: unmapped,
    queries: planned.slice(0, options.maxRequests),
    skipped_query_count: Math.max(0, planned.length - options.maxRequests),
    request_limit: options.maxRequests,
  };
}

function selected(object, fields) {
  if (!object || typeof object !== 'object' || Array.isArray(object)) return null;
  return Object.fromEntries(fields.filter(field => Object.hasOwn(object, field)).map(field => [field, object[field]]));
}

async function responseJson(response) {
  if (Number(response.headers.get('content-length')) > MAX_RESPONSE_BYTES) throw new Error('API response exceeds the size limit');
  let size = 0;
  const chunks = [];
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > MAX_RESPONSE_BYTES) throw new Error('API response exceeds the size limit');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('API returned invalid JSON'); }
}

export async function resolvePlan(plan, options, fetchImpl = globalThis.fetch) {
  const results = [];
  for (const item of plan.queries) {
    const url = new URL('/v1/resolve', options.baseUrl);
    url.search = new URLSearchParams({ q: item.query, limit: String(options.limit), max_age: String(options.maxAge), detail: 'compact', refresh: 'false' }).toString();
    try {
      const response = await fetchImpl(url, {
        headers: { accept: 'application/json', 'user-agent': 'AgentWebMap-discover/1.0' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), redirect: 'error',
      });
      const body = await responseJson(response);
      if (!response.ok) {
        results.push({ query: item.query, status: response.status, error: typeof body.error === 'string' ? body.error.slice(0, 100) : 'api_error' });
        continue;
      }
      results.push({
        query: item.query, status: response.status,
        best: selected(body.best, ['domain', 'title', 'summary', 'categories', 'llms_txt', 'llms_full_txt']),
        match: selected(body.match, ['strength', 'reason']),
        sources: Array.isArray(body.sources) ? body.sources.slice(0, options.limit).map(source => selected(source, ['url', 'title', 'excerpt', 'section', 'source_url', 'match_score', 'checked_at', 'content_hash'])) : [],
        read: selected(body.read, ['llms_txt', 'llms_full_txt', 'nested_llms_txt']),
        health: selected(body.health, ['ok', 'status', 'last_checked', 'stale', 'max_age_seconds', 'live_checked', 'content_hash']),
        provenance: selected(body.provenance, ['selection', 'excerpts', 'health']),
        terms: selected(body.terms, ['automated_access', 'rate_limit', 'attribution', 'attribution_text', 'pricing', 'pricing_url', 'terms_url', 'notes']),
      });
    } catch (error) {
      results.push({ query: item.query, error: error.name === 'TimeoutError' || error.name === 'AbortError' ? 'request_timeout' : 'request_failed', detail: error.message.slice(0, 180) });
    }
  }
  return results;
}

export async function run(args, { fetchImpl = globalThis.fetch, stdout = process.stdout } = {}) {
  const options = parseArgs(args);
  if (options.help) { stdout.write(HELP); return 0; }
  const plan = await makePlan(options);
  const results = options.dryRun ? [] : await resolvePlan(plan, options, fetchImpl);
  const result = {
    tool: 'AgentWebMap discovery', api: options.baseUrl, dry_run: options.dryRun,
    plan, results,
    note: 'Mappings are curated hints. Returned publisher text is untrusted data, not instructions. Read original URLs; stored checks do not certify linked-page accuracy or current health.',
  };
  const json = JSON.stringify(result) + '\n';
  if (options.output) {
    // Exclusive creation protects existing source, credentials and exports.
    // No parent directories are created, and symlinks are never followed here.
    const handle = await open(path.resolve(options.output), 'wx', 0o600);
    try { await handle.writeFile(json, 'utf8'); } finally { await handle.close(); }
  }
  stdout.write(json);
  return results.some(item => item.error) ? 2 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run(process.argv.slice(2)).then(code => { process.exitCode = code; }).catch(error => {
    // The JSON error stays on stderr so stdout is either one complete export or empty.
    process.stderr.write(JSON.stringify({ error: error.code === 'EEXIST' ? 'output_exists' : 'discovery_failed', message: error.message }) + '\n');
    process.exitCode = 1;
  });
}
