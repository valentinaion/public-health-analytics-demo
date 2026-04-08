import mockData from '../../data/mockData.js';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
  return delay(250 + Math.random() * 350);
}

function maybeFailure() {
  if (Math.random() < 0.05) {
    throw new Error('Surveillance data service temporarily unavailable. Please retry.');
  }
}

export async function fetchOutbreaks() {
  await randomDelay();
  maybeFailure();
  return mockData.outbreaks.map(o => ({
    ...o,
    cases7d: o.cases7d + Math.round((Math.random() - 0.3) * 20)
  }));
}

export async function fetchSurveillanceTimeSeries() {
  await randomDelay();
  maybeFailure();
  return { ...mockData.surveillanceTimeSeries };
}

export async function fetchEarlyWarningLog() {
  await randomDelay();
  maybeFailure();
  return mockData.earlyWarningLog.map(e => ({ ...e }));
}

export async function fetchMapHotspots() {
  await randomDelay();
  maybeFailure();
  return mockData.mapHotspots.map(h => ({ ...h }));
}
