import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { parseArgs, validateTasks, evaluate, runBenchmark } from './run.mjs';

const task = { id: 'webhooks', query: 'stripe webhooks', expected: [{ host: 'stripe.com', path: 'webhook' }] };

test('page hits require an official host and a relevant path; a provider match is separate', () => {
  const old = evaluate(task, { best: { domain: 'stripe.com' }, read: { llms_txt: 'https://stripe.com/llms.txt' } });
  assert.equal(old.provider_hit, true);
  assert.equal(old.source_hit_at_3, false);
  const result = evaluate(task, { sources: [
    { url: 'https://stripe.com.attacker.example/webhooks' },
    { url: 'https://docs.stripe.com/webhooks' },
  ] });
  assert.equal(result.source_hit_at_1, false);
  assert.equal(result.source_hit_at_3, true);
});

test('runner records HTTP failures, JSON failures, UTF-8 bytes and source hits against an actual local service', async () => {
  const server = createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    assert.equal(url.searchParams.get('detail'), 'compact');
    assert.equal(url.searchParams.get('limit'), '3');
    const query = url.searchParams.get('q');
    if (query === 'missing') {
      response.writeHead(404, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'no_match', sources: [{ url: 'https://docs.stripe.com/webhooks' }] }));
    } else if (query === 'bad json') response.end('not JSON');
    else response.end(JSON.stringify({ best: { domain: 'stripe.com' }, health: { stale: false },
      sources: [{ url: 'https://docs.stripe.com/webhooks', excerpt: 'réessayer' }] }));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const options = parseArgs(['--base-url', `http://127.0.0.1:${server.address().port}`]);
    const report = await runBenchmark(options, [task,
      { ...task, id: 'missing', query: 'missing' }, { ...task, id: 'bad', query: 'bad json' }]);
    assert.equal(report.summary.attempts, 3);
    assert.equal(report.results[0].source_hit_at_1, true);
    assert.equal(report.results[0].stale, false);
    assert.equal(report.results[1].source_hit_at_3, false);
    assert.equal(report.results[2].error, 'invalid_json');
    assert.equal(report.summary.non_2xx_or_transport_errors, 2);
    assert.equal(report.results[0].response_bytes, Buffer.byteLength(JSON.stringify({ best: { domain: 'stripe.com' }, health: { stale: false },
      sources: [{ url: 'https://docs.stripe.com/webhooks', excerpt: 'réessayer' }] }), 'utf8'));
    assert.ok(report.results.every(result => result.latency_ms >= 0));
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('timeouts are reported and remain misses', async () => {
  const options = parseArgs(['--timeout-ms', '1']);
  const report = await runBenchmark(options, [task], async (_url, { signal }) => {
    await new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error('unexpected timeout handling')), 100);
      signal.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
    });
  });
  assert.equal(report.results[0].error, 'timeout');
  assert.equal(report.results[0].source_hit_at_3, false);
});

test('input validation rejects malformed datasets and ambiguous options', () => {
  assert.throws(() => validateTasks([task, task]), /unique/);
  assert.throws(() => validateTasks([{ ...task, expected: [{ host: 'stripe.com', path: '[' }] }]));
  assert.throws(() => parseArgs(['--source-limit', '6']), /between 1 and 5/);
  assert.throws(() => parseArgs(['--base-url', 'https://user:secret@example.org']), /without credentials/);
  assert.throws(() => parseArgs(['--repeat', '-1']), /Invalid repeat/);
});
