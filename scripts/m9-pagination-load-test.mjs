const baseUrl = process.env.PERF_API_URL ?? "http://localhost:3000";
const endpoint = process.env.PERF_ENDPOINT ?? "/scooters";
const requestedLimit = Number(process.env.PERF_LIMIT ?? 200);
const expectedLimit = Number(process.env.PERF_EXPECTED_LIMIT ?? 100);
const totalRequests = Number(process.env.PERF_REQUESTS ?? 60);
const concurrency = Number(process.env.PERF_CONCURRENCY ?? 12);
const maxP95Ms = Number(process.env.PERF_MAX_P95_MS ?? 1500);

function percentile(values, pct) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.ceil((pct / 100) * sorted.length) - 1,
  );
  return sorted[index];
}

function buildUrl() {
  const url = new URL(endpoint, baseUrl);
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", String(requestedLimit));
  return url;
}

async function runRequest(index, url) {
  const startedAt = performance.now();
  const response = await fetch(url);
  const durationMs = performance.now() - startedAt;

  if (!response.ok) {
    throw new Error(`request ${index} returned HTTP ${response.status}`);
  }

  const body = await response.json();
  const data = body.data ?? body;

  if (data.limit !== expectedLimit) {
    throw new Error(
      `request ${index} expected limit ${expectedLimit}, received ${data.limit}`,
    );
  }

  if (Array.isArray(data.items) && data.items.length > expectedLimit) {
    throw new Error(
      `request ${index} returned ${data.items.length} items, above ${expectedLimit}`,
    );
  }

  return durationMs;
}

async function main() {
  const url = buildUrl();
  const durations = [];
  const failures = [];
  let nextRequest = 0;

  async function worker() {
    while (nextRequest < totalRequests) {
      const current = nextRequest;
      nextRequest += 1;

      try {
        durations.push(await runRequest(current + 1, url));
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error));
      }
    }
  }

  const workerCount = Math.min(concurrency, totalRequests);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  const avgMs =
    durations.reduce((total, duration) => total + duration, 0) /
    Math.max(1, durations.length);
  const p95Ms = percentile(durations, 95);

  console.log("M9 pagination load test");
  console.log(`URL: ${url.toString()}`);
  console.log(`Requests: ${totalRequests}, concurrency: ${workerCount}`);
  console.log(`Successful: ${durations.length}, failed: ${failures.length}`);
  console.log(`avg=${avgMs.toFixed(1)}ms p95=${p95Ms.toFixed(1)}ms`);
  console.log(`limit=${requestedLimit} was clamped to ${expectedLimit}`);

  if (failures.length > 0) {
    console.error("Failures:");
    failures.slice(0, 10).forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }

  if (p95Ms > maxP95Ms) {
    console.error(`p95 ${p95Ms.toFixed(1)}ms exceeded ${maxP95Ms}ms`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
