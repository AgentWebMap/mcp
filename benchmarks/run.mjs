#!/usr/bin/env node
// Dependency-free discovery benchmark. Node.js 20+.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const DEFAULT_TASKS = fileURLToPath(new URL('./tasks.json', import.meta.url));
const DEFAULT_BASE = 'https://agentwebmap.com';
const round = n => Math.round(n * 100) / 100;

export function parseArgs(argv) {
  const options = { baseUrl: DEFAULT_BASE, tasks: DEFAULT_TASKS, label: 'candidate',
    repeat: 1, timeoutMs: 15_000, detail: 'compact', maxAge: 86400, sourceLimit: 3 };
  const names = { '--base-url': 'baseUrl', '--tasks': 'tasks', '--label': 'label',
    '--output': 'output', '--repeat': 'repeat', '--timeout-ms': 'timeoutMs',
    '--detail': 'detail', '--max-age': 'maxAge', '--limit': 'taskLimit', '--source-limit': 'sourceLimit' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--help') return { help: true };
    const name = names[argv[i]];
    if (!name || !argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`Unknown option or missing value: ${argv[i]}`);
    options[name] = argv[++i];
  }
  const base = new URL(options.baseUrl);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new Error('--base-url must be an HTTP(S) base URL without credentials, query or fragment');
  }
  for (const key of ['repeat', 'timeoutMs', 'maxAge', 'sourceLimit', 'taskLimit']) {
    if (options[key] === undefined) continue;
    options[key] = Number(options[key]);
    if (!Number.isSafeInteger(options[key]) || options[key] < (key === 'maxAge' ? 0 : 1)) throw new Error(`Invalid ${key}`);
  }
  if (options.sourceLimit > 5) throw new Error('--source-limit must be between 1 and 5');
  if (options.maxAge > 2_592_000) throw new Error('--max-age must be at most 2592000 seconds');
  if (!['compact', 'full'].includes(options.detail)) throw new Error('--detail must be compact or full');
  return options;
}

export function validateTasks(tasks) {
  if (!Array.isArray(tasks) || !tasks.length) throw new Error('Task dataset must be a nonempty array');
  const ids = new Set();
  for (const task of tasks) {
    if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id) || typeof task.query !== 'string' || !task.query.trim()) {
      throw new Error('Every task needs a unique id and nonempty query');
    }
    ids.add(task.id);
    if (!Array.isArray(task.expected) || !task.expected.length) throw new Error(`Task ${task.id} needs expected host/path entries`);
    for (const rule of task.expected) {
      if (typeof rule.host !== 'string' || !/^[a-z0-9]+(?:[.-][a-z0-9]+)+$/.test(rule.host) || typeof rule.path !== 'string' || !rule.path) {
        throw new Error(`Invalid expected host/path for ${task.id}`);
      }
      new RegExp(rule.path, 'i');
    }
  }
  return tasks;
}

function hostMatches(host, expected) {
  return host === expected || host.endsWith(`.${expected}`);
}

export function sourceMatches(rawUrl, rules) {
  try {
    const url = new URL(rawUrl);
    return ['https:', 'http:'].includes(url.protocol) && rules.some(rule =>
      hostMatches(url.hostname.toLowerCase(), rule.host) && new RegExp(rule.path, 'i').test(url.pathname));
  } catch { return false; }
}

export function evaluate(task, body) {
  // An old domain-only response is deliberately not a documentation-page hit.
  const sources = Array.isArray(body?.sources) ? body.sources : [];
  const sourceUrls = sources.map(source => source?.url).filter(url => typeof url === 'string');
  const bestDomain = typeof body?.best?.domain === 'string' ? body.best.domain.toLowerCase() : null;
  return {
    source_hit_at_1: sources.slice(0, 1).some(source => sourceMatches(source?.url, task.expected)),
    source_hit_at_3: sources.slice(0, 3).some(source => sourceMatches(source?.url, task.expected)),
    provider_hit: !!bestDomain && task.expected.some(rule => hostMatches(bestDomain, rule.host)),
    source_urls: sourceUrls,
    best_domain: bestDomain,
    stale: typeof body?.health?.stale === 'boolean' ? body.health.stale : null,
    match_strength: typeof body?.match?.strength === 'string' ? body.match.strength : null,
  };
}

const percentile = (values, p) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return round(sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)]);
};

export function summarize(results) {
  const total = results.length;
  const rate = field => total ? round(results.filter(result => result[field]).length / total) : 0;
  const mean = field => total ? round(results.reduce((sum, result) => sum + result[field], 0) / total) : 0;
  return { attempts: total,
    source_hit_rate_at_1: rate('source_hit_at_1'), source_hit_rate_at_3: rate('source_hit_at_3'),
    provider_hit_rate: rate('provider_hit'),
    non_2xx_or_transport_errors: results.filter(result => result.error || result.status < 200 || result.status >= 300).length,
    stale_results: results.filter(result => result.stale === true).length,
    freshness_unknown: results.filter(result => result.stale === null).length,
    latency_ms: { median: percentile(results.map(result => result.latency_ms), 0.5),
      p95: percentile(results.map(result => result.latency_ms), 0.95) },
    response_bytes: { mean: mean('response_bytes'), total: results.reduce((sum, result) => sum + result.response_bytes, 0) },
    estimated_response_tokens: { mean: mean('estimated_response_tokens'),
      total: results.reduce((sum, result) => sum + result.estimated_response_tokens, 0) },
  };
}

export async function runBenchmark(options, tasks, fetchImpl = fetch) {
  validateTasks(tasks);
  const selected = options.taskLimit ? tasks.slice(0, options.taskLimit) : tasks;
  const startedAt = new Date().toISOString();
  const results = [];
  for (let iteration = 1; iteration <= options.repeat; iteration++) {
    for (const task of selected) {
      const url = new URL(`${options.baseUrl.replace(/\/$/, '')}/v1/resolve`);
      url.search = new URLSearchParams({ q: task.query, detail: options.detail,
        max_age: String(options.maxAge), limit: String(options.sourceLimit) }).toString();
      const started = performance.now();
      let status = null, responseBytes = 0, estimatedTokens = 0, error = null, body = null;
      try {
        const response = await fetchImpl(url, { headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(options.timeoutMs), redirect: 'error' });
        status = response.status;
        const raw = await response.text();
        responseBytes = Buffer.byteLength(raw, 'utf8');
        estimatedTokens = Math.ceil(raw.length / 4);
        try { body = JSON.parse(raw); }
        catch { error = 'invalid_json'; }
        if (!error && (!body || typeof body !== 'object' || Array.isArray(body))) error = 'invalid_response_shape';
      } catch (err) { error = err.name === 'TimeoutError' || err.name === 'AbortError' ? 'timeout' : String(err.message); }
      const evaluation = evaluate(task, body);
      if (status === null || status < 200 || status >= 300 || error) {
        evaluation.source_hit_at_1 = evaluation.source_hit_at_3 = evaluation.provider_hit = false;
      }
      results.push({ id: task.id, query: task.query, iteration, status, error,
        latency_ms: round(performance.now() - started), response_bytes: responseBytes,
        estimated_response_tokens: estimatedTokens, ...evaluation });
    }
  }
  return { schema_version: 1, label: options.label, started_at: startedAt,
    completed_at: new Date().toISOString(), base_url: options.baseUrl,
    parameters: { detail: options.detail, max_age: options.maxAge, source_limit: options.sourceLimit,
      repeat: options.repeat, task_count: selected.length, timeout_ms: options.timeoutMs },
    methodology: { source_hit: 'Expected host (or subdomain) AND path regex among returned sources only',
      provider_hit: 'best.domain matches an expected host or subdomain; not a page-level success',
      token_estimate: 'Heuristic ceil(JSON response UTF-16 code units / 4), NOT tokenizer usage or billing',
      response_bytes: 'Uncompressed UTF-8 response body; excludes headers, destination fetches and model work',
      latency: 'Sequential client-observed request plus body read; includes error attempts; no retry or warm-up' },
    summary: summarize(results), results };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log('Usage: node benchmarks/run.mjs [--base-url URL] [--label LABEL] [--output FILE] [--tasks FILE] [--limit N] [--repeat N] [--detail compact|full] [--max-age SECONDS] [--source-limit 1..5] [--timeout-ms N]');
    return;
  }
  const tasks = JSON.parse(await readFile(options.tasks, 'utf8'));
  const report = await runBenchmark(options, tasks);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  if (options.output) await writeFile(options.output, json, 'utf8');
  process.stdout.write(json);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
