import mockData from '../../data/mockData.js';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
  return delay(200 + Math.random() * 400);
}

export async function fetchSocialCases(filters = {}) {
  await randomDelay();
  let cases = mockData.socialCases.map(c => ({ ...c }));

  if (filters.district && filters.district !== 'all') {
    cases = cases.filter(c => c.district.toLowerCase() === filters.district.toLowerCase());
  }
  if (filters.riskMin != null) {
    cases = cases.filter(c => c.riskScore >= filters.riskMin);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    cases = cases.filter(c =>
      c.title.toLowerCase().includes(q) || c.meta.toLowerCase().includes(q)
    );
  }
  return cases;
}

export async function fetchWorkflowSteps() {
  await randomDelay();
  return mockData.workflowSteps.map(s => ({ ...s }));
}

export async function fetchCaseVolume() {
  await randomDelay();
  return { ...mockData.caseVolume };
}

export async function fetchCaseworkerCapacity() {
  await randomDelay();
  return { ...mockData.caseworkerCapacity };
}

export async function fetchProgramOutcomes() {
  await randomDelay();
  return { ...mockData.programOutcomes };
}
