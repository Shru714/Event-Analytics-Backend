const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'ak_test';
const NUM_REQUESTS = parseInt(process.env.NUM_REQUESTS) || 1000;
const CONCURRENCY = parseInt(process.env.CONCURRENCY) || 10;

async function trackEvent() {
  const start = Date.now();
  try {
    await axios.post(
      `${BASE_URL}/api/events/track`,
      {
        eventType: 'benchmark_test',
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
        url: 'https://example.com/test',
        screenWidth: 1920,
        screenHeight: 1080
      },
      {
        headers: { 'X-API-Key': API_KEY }
      }
    );
    return Date.now() - start;
  } catch (error) {
    console.error('Request failed:', error.message);
    return -1;
  }
}

async function runBenchmark() {
  console.log(`Starting benchmark: ${NUM_REQUESTS} requests with concurrency ${CONCURRENCY}`);
  console.log(`Target: ${BASE_URL}`);
  console.log('---');

  const results = [];
  const startTime = Date.now();
  let completed = 0;
  let errors = 0;

  const runBatch = async () => {
    const promises = [];
    for (let i = 0; i < CONCURRENCY && completed < NUM_REQUESTS; i++) {
      completed++;
      promises.push(trackEvent());
    }
    const times = await Promise.all(promises);
    times.forEach(time => {
      if (time === -1) {
        errors++;
      } else {
        results.push(time);
      }
    });
  };

  while (completed < NUM_REQUESTS) {
    await runBatch();
    process.stdout.write(`\rProgress: ${completed}/${NUM_REQUESTS} (${errors} errors)`);
  }

  const totalTime = Date.now() - startTime;
  console.log('\n---');
  console.log('Benchmark Results:');
  console.log(`Total time: ${totalTime}ms`);
  console.log(`Requests: ${NUM_REQUESTS}`);
  console.log(`Successful: ${results.length}`);
  console.log(`Failed: ${errors}`);
  console.log(`Requests/sec: ${((NUM_REQUESTS / totalTime) * 1000).toFixed(2)}`);
  
  if (results.length > 0) {
    results.sort((a, b) => a - b);
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const p50 = results[Math.floor(results.length * 0.5)];
    const p95 = results[Math.floor(results.length * 0.95)];
    const p99 = results[Math.floor(results.length * 0.99)];
    const min = results[0];
    const max = results[results.length - 1];

    console.log('\nLatency:');
    console.log(`  Min: ${min}ms`);
    console.log(`  Avg: ${avg.toFixed(2)}ms`);
    console.log(`  p50: ${p50}ms`);
    console.log(`  p95: ${p95}ms`);
    console.log(`  p99: ${p99}ms`);
    console.log(`  Max: ${max}ms`);
  }
}

runBenchmark().catch(console.error);
