import mockData from '../../data/mockData.js';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
  return delay(200 + Math.random() * 400);
}

export async function fetchPopulationKpis() {
  await randomDelay();
  const k = mockData.kpis;
  return {
    citizensMonitored: k.citizensMonitored + Math.round((Math.random() - 0.5) * 1000),
    activeAlerts: k.activeAlerts,
    earlierDetection: k.earlierDetection,
    manualTriageReduction: k.manualTriageReduction,
    fasterReporting: k.fasterReporting
  };
}

export async function fetchRiskStratification() {
  await randomDelay();
  const r = mockData.riskStratification;
  return {
    veryHigh: r.veryHigh + Math.round((Math.random() - 0.5) * 200),
    high: r.high + Math.round((Math.random() - 0.5) * 800),
    moderate: r.moderate + Math.round((Math.random() - 0.5) * 2000),
    low: r.low + Math.round((Math.random() - 0.5) * 5000),
    healthy: r.healthy
  };
}

export async function fetchChronicDisease() {
  await randomDelay();
  return { ...mockData.chronicDisease };
}

export async function fetchSdohCoverage() {
  await randomDelay();
  return mockData.sdohCoverage.map(item => ({
    ...item,
    value: Math.min(100, Math.max(10, item.value + Math.round((Math.random() - 0.5) * 3)))
  }));
}

export async function fetchInterventions() {
  await randomDelay();
  return mockData.interventions.map(i => ({ ...i }));
}

export async function fetchPopulationTrends() {
  await randomDelay();
  return { ...mockData.populationTrends };
}
